import ExifReader from 'exifreader'
import { ExifData, RawExifTags, EXIF_CONFIG } from '@/types/exif'

/**
 * Extrait les données EXIF d'un fichier image
 * @param file - Fichier image à analyser
 * @returns Promise<ExifData | null>
 */
export async function extractExifData(file: File): Promise<ExifData | null> {
  try {
    console.log('🔧 DEBUG: Starting EXIF extraction...')
    
    // Convertir le fichier en ArrayBuffer pour ExifReader
    const arrayBuffer = await file.arrayBuffer()
    console.log('📦 DEBUG: ArrayBuffer size:', arrayBuffer.byteLength)
    
    // Extraire les tags EXIF
    const tags = ExifReader.load(arrayBuffer, {
      expanded: true,
      includeUnknown: false
    }) as RawExifTags
    
    console.log('🏷️ DEBUG: Raw tags found:', tags ? Object.keys(tags).length : 0)
    
    if (!tags || Object.keys(tags).length === 0) {
      console.log('❌ DEBUG: Aucune donnée EXIF trouvée')
      return null
    }
    
    console.log('📊 DEBUG: Tags EXIF extraits:', {
      totalTags: Object.keys(tags).length,
      availableTags: Object.keys(tags).slice(0, 10), // Premiers 10 tags
      hasMake: !!tags.Make,
      hasModel: !!tags.Model,
      hasISO: !!tags.ISO || !!tags.ISOSpeedRatings,
      hasFNumber: !!tags.FNumber,
      hasExposureTime: !!tags.ExposureTime
    })
    
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
      
      // Métadonnées
      dateTime: parseDateTime(tags),
      software: parseSoftware(tags),
      
      // GPS (si disponible)
      gps: parseGPS(tags)
    }
    
    // Filtrer les valeurs undefined pour avoir un objet propre
    const cleanedData = cleanExifData(exifData)
    
    console.log('🧹 DEBUG: Cleaned EXIF data:', {
      hasData: Object.keys(cleanedData).length > 0,
      keys: Object.keys(cleanedData),
      sample: cleanedData
    })
    
    return cleanedData
    
  } catch (error) {
    console.error('❌ DEBUG: Erreur extraction EXIF:', error)
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