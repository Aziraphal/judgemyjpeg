import ExifReader from 'exifreader'
import { ExifData, RawExifTags, EXIF_CONFIG } from '@/types/exif'
import { logger } from '@/lib/logger'

/**
 * Extrait les données EXIF d'un fichier image
 * @param file - Fichier image à analyser
 * @returns Promise<ExifData | null>
 */
export async function extractExifData(file: File): Promise<ExifData | null> {
  try {
    // Vérifier si le fichier est valide
    if (!file || file.size === 0) {
      logger.error('❌ EXIF: Invalid file (null or empty)')
      return null
    }

    logger.debug(`📸 EXIF: Converting file to ArrayBuffer (${file.size} bytes)`)

    // Convertir le fichier en ArrayBuffer pour ExifReader
    const arrayBuffer = await file.arrayBuffer()

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      logger.error('❌ EXIF: ArrayBuffer is empty')
      return null
    }

    logger.debug(`📸 EXIF: ArrayBuffer ready (${arrayBuffer.byteLength} bytes), loading tags...`)
    console.log(`📸 EXIF: ArrayBuffer ready (${arrayBuffer.byteLength} bytes), loading tags...`)

    // Extraire les tags EXIF avec protection supplémentaire
    // IMPORTANT: expanded: false pour avoir les tags à plat (tags.Make au lieu de tags.exif.Make)
    const tags = ExifReader.load(arrayBuffer, {
      expanded: false,
      includeUnknown: false
    }) as RawExifTags

    const tagCount = Object.keys(tags).length
    logger.debug(`📸 EXIF: Tags loaded, found ${tagCount} tags`)
    console.log(`📸 EXIF: Tags loaded, found ${tagCount} tags`)

    logger.debug('📸 EXIF: Tag keys:', Object.keys(tags).slice(0, 20))
    console.log('📸 EXIF: First 20 tag keys:', Object.keys(tags).slice(0, 20))

    // Log complet pour debug
    if (tagCount > 0) {
      console.log('📸 EXIF: ALL tag keys:', Object.keys(tags))
      console.log('📸 EXIF: Make =', tags.Make)
      console.log('📸 EXIF: Model =', tags.Model)
      console.log('📸 EXIF: ISO =', tags.ISO || tags.ISOSpeedRatings)
      console.log('📸 EXIF: LensModel =', tags.LensModel)

      logger.debug('📸 EXIF: All tag keys:', Object.keys(tags))
      logger.debug('📸 EXIF: Make =', tags.Make)
      logger.debug('📸 EXIF: Model =', tags.Model)
      logger.debug('📸 EXIF: ISO =', tags.ISO || tags.ISOSpeedRatings)
      logger.debug('📸 EXIF: LensModel =', tags.LensModel)
    } else {
      console.log('📸 EXIF: NO TAGS FOUND!')
    }

    if (!tags || Object.keys(tags).length === 0) {
      logger.warn('⚠️ EXIF: No tags found in image')
      return null
    }
    
    // Parser les données importantes
    const exifData: ExifData = {
      // Appareil et objectif
      camera: buildCameraString(tags),
      lens: parseLens(tags),
      
      // Paramètres de prise de vue
      iso: parseISO(tags),
      aperture: parseAperture(tags),
      shutterSpeed: parseShutterSpeed(tags),
      focalLength: parseFocalLength(tags),
      
      // Paramètres techniques
      exposureMode: parseExposureMode(tags),
      meteringMode: parseMeteringMode(tags),
      whiteBalance: parseWhiteBalance(tags),
      flashMode: parseFlash(tags),
      
      // Informations image
      dimensions: parseDimensions(tags),
      fileSize: file.size,
      colorSpace: parseColorSpace(tags),
      orientation: parseOrientation(tags),
      
      // Métadonnées
      dateTime: parseDateTime(tags),
      software: parseSoftware(tags),
      
      // GPS (si disponible)
      gps: parseGPS(tags)
    }
    
    // Filtrer les valeurs undefined pour avoir un objet propre
    return cleanExifData(exifData)
    
  } catch (error) {
    logger.error('❌ Erreur extraction EXIF:', error)
    return null
  }
}

/**
 * Construit la chaîne décrivant l'appareil photo
 */
function buildCameraString(tags: RawExifTags): string | undefined {
  const make = tags.Make?.description || tags.Make?.value
  const model = tags.Model?.description || tags.Model?.value
  
  if (!make && !model) return undefined
  if (!make) return model
  if (!model) return make
  
  // Éviter la redondance (ex: "Canon" + "Canon EOS R5" -> "Canon EOS R5")
  if (model.toLowerCase().includes(make.toLowerCase())) {
    return model
  }
  
  return `${make} ${model}`
}

/**
 * Parse l'objectif utilisé
 */
function parseLens(tags: RawExifTags): string | undefined {
  return tags.LensModel?.description || 
         tags.LensModel?.value ||
         tags['Lens Info']?.description ||
         tags.LensSpecification?.description
}

/**
 * Parse la sensibilité ISO
 */
function parseISO(tags: RawExifTags): number | undefined {
  const iso = tags.ISO?.value || tags.ISOSpeedRatings?.value
  return typeof iso === 'number' ? iso : undefined
}

/**
 * Parse l'ouverture (f-number)
 */
function parseAperture(tags: RawExifTags): string | undefined {
  const fNumber = tags.FNumber?.value
  if (typeof fNumber === 'number') {
    return `f/${fNumber.toFixed(1)}`
  }
  return tags.FNumber?.description
}

/**
 * Parse la vitesse d'obturation
 */
function parseShutterSpeed(tags: RawExifTags): string | undefined {
  const exposureTime = tags.ExposureTime?.value
  
  if (typeof exposureTime === 'number') {
    if (exposureTime >= 1) {
      return `${exposureTime}s`
    } else {
      // Convertir en fraction (ex: 0.0167 -> "1/60s")
      const denominator = Math.round(1 / exposureTime)
      return `1/${denominator}s`
    }
  }
  
  return tags.ExposureTime?.description
}

/**
 * Parse la distance focale
 */
function parseFocalLength(tags: RawExifTags): string | undefined {
  const focal = tags.FocalLength?.value
  if (typeof focal === 'number') {
    return `${Math.round(focal)}mm`
  }
  return tags.FocalLength?.description
}

/**
 * Parse le mode d'exposition
 */
function parseExposureMode(tags: RawExifTags): string | undefined {
  return tags.ExposureMode?.description || tags.ExposureProgram?.description
}

/**
 * Parse le mode de mesure
 */
function parseMeteringMode(tags: RawExifTags): string | undefined {
  return tags.MeteringMode?.description
}

/**
 * Parse la balance des blancs
 */
function parseWhiteBalance(tags: RawExifTags): string | undefined {
  return tags.WhiteBalance?.description
}

/**
 * Parse l'utilisation du flash
 */
function parseFlash(tags: RawExifTags): string | undefined {
  return tags.Flash?.description
}

/**
 * Parse les dimensions de l'image
 */
function parseDimensions(tags: RawExifTags): { width: number, height: number } | undefined {
  const width = tags.ExifImageWidth?.value || tags.ImageWidth?.value
  const height = tags.ExifImageHeight?.value || tags.ImageLength?.value
  
  if (typeof width === 'number' && typeof height === 'number') {
    return { width, height }
  }
  
  return undefined
}

/**
 * Parse l'espace colorimétrique
 */
function parseColorSpace(tags: RawExifTags): string | undefined {
  return tags.ColorSpace?.description
}

/**
 * Parse la date/heure de prise de vue
 */
function parseDateTime(tags: RawExifTags): string | undefined {
  return tags.DateTime?.description || tags.DateTimeOriginal?.description
}

/**
 * Parse le logiciel utilisé
 */
function parseSoftware(tags: RawExifTags): string | undefined {
  return tags.Software?.description
}

/**
 * Parse l'orientation de l'image
 */
function parseOrientation(tags: RawExifTags): number | undefined {
  const orientation = tags.Orientation?.value
  return typeof orientation === 'number' ? orientation : undefined
}

/**
 * Parse les données GPS si disponibles
 */
function parseGPS(tags: RawExifTags): { latitude?: number, longitude?: number, altitude?: number } | undefined {
  const lat = tags.GPSLatitude?.value
  const lon = tags.GPSLongitude?.value  
  const alt = tags.GPSAltitude?.value
  
  if (typeof lat === 'number' || typeof lon === 'number' || typeof alt === 'number') {
    return {
      latitude: typeof lat === 'number' ? lat : undefined,
      longitude: typeof lon === 'number' ? lon : undefined,
      altitude: typeof alt === 'number' ? alt : undefined
    }
  }
  
  return undefined
}

/**
 * Nettoie l'objet EXIF en supprimant les valeurs undefined
 */
function cleanExifData(exifData: ExifData): ExifData {
  const cleaned: any = {}
  
  Object.entries(exifData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Nettoyer récursivement les objets imbriqués
        const cleanedNested = Object.entries(value).reduce((acc, [nestedKey, nestedValue]) => {
          if (nestedValue !== undefined && nestedValue !== null) {
            acc[nestedKey] = nestedValue
          }
          return acc
        }, {} as any)
        
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested
        }
      } else {
        cleaned[key] = value
      }
    }
  })
  
  return cleaned
}

/**
 * Génère un résumé textuel des conditions de prise de vue
 * Utile pour enrichir les prompts IA
 */
export function generateShootingConditionsSummary(exif: ExifData): string {
  const conditions: string[] = []
  
  // Appareil utilisé
  if (exif.camera) {
    conditions.push(`Appareil: ${exif.camera}`)
  }
  
  // Objectif
  if (exif.lens) {
    conditions.push(`Objectif: ${exif.lens}`)
  }
  
  // Triangle d'exposition
  const exposure = []
  if (exif.iso) exposure.push(`ISO ${exif.iso}`)
  if (exif.aperture) exposure.push(exif.aperture)
  if (exif.shutterSpeed) exposure.push(exif.shutterSpeed)
  if (exif.focalLength) exposure.push(exif.focalLength)
  
  if (exposure.length > 0) {
    conditions.push(`Réglages: ${exposure.join(', ')}`)
  }
  
  // Conditions de lumière déduites
  if (exif.iso) {
    if (exif.iso <= 200) {
      conditions.push("Conditions lumineuses excellentes")
    } else if (exif.iso <= 800) {
      conditions.push("Conditions lumineuses correctes") 
    } else if (exif.iso <= 3200) {
      conditions.push("Conditions de faible luminosité")
    } else {
      conditions.push("Conditions très sombres (ISO élevé)")
    }
  }
  
  // Flash
  if (exif.flashMode && exif.flashMode.toLowerCase().includes('fired')) {
    conditions.push("Flash utilisé")
  }
  
  return conditions.join(' • ')
}

/**
 * Convertit la valeur d'orientation EXIF en transformation CSS
 * @param orientation - Valeur EXIF orientation (1-8)
 * @returns Transformation CSS ou undefined si orientation normale
 */
export function getOrientationTransform(orientation?: number): string | undefined {
  if (!orientation || orientation === 1) {
    return undefined // Orientation normale
  }

  switch (orientation) {
    case 2:
      return 'scaleX(-1)' // Miroir horizontal
    case 3:
      return 'rotate(180deg)' // Rotation 180°
    case 4:
      return 'scaleX(-1) rotate(180deg)' // Miroir horizontal + rotation 180°
    case 5:
      return 'scaleX(-1) rotate(90deg)' // Miroir horizontal + rotation 90°
    case 6:
      return 'rotate(90deg)' // Rotation 90° horaire
    case 7:
      return 'scaleX(-1) rotate(270deg)' // Miroir horizontal + rotation 270°
    case 8:
      return 'rotate(270deg)' // Rotation 90° anti-horaire
    default:
      return undefined
  }
}