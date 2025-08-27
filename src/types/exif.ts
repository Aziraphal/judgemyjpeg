// Types pour les données EXIF extraites des photos
export interface ExifData {
  // Données de base de l'appareil
  camera?: string        // Marque + modèle (ex: "Canon EOS R5")
  lens?: string          // Objectif utilisé
  
  // Paramètres de prise de vue
  iso?: number           // Sensibilité ISO
  aperture?: string      // Ouverture (ex: "f/2.8")
  shutterSpeed?: string  // Vitesse d'obturation (ex: "1/60s")
  focalLength?: string   // Distance focale (ex: "85mm")
  
  // Paramètres techniques
  exposureMode?: string  // Mode d'exposition (Auto, Manuel, etc.)
  meteringMode?: string  // Mode de mesure
  whiteBalance?: string  // Balance des blancs
  flashMode?: string     // Flash utilisé ou non
  
  // Informations de l'image
  dimensions?: {
    width: number
    height: number
  }
  fileSize?: number      // Taille du fichier en octets
  colorSpace?: string    // Espace colorimétrique
  orientation?: number   // Orientation EXIF (1-8)
  
  // Métadonnées
  dateTime?: string      // Date/heure de prise de vue
  software?: string      // Logiciel de retouche utilisé
  copyright?: string     // Copyright si présent
  
  // Géolocalisation (si disponible)
  gps?: {
    latitude?: number
    longitude?: number
    altitude?: number
  }
}

// Interface pour l'analyse enrichie avec EXIF
export interface ExifEnrichedAnalysis {
  // Analyse classique
  score: number
  analysis: string
  strengths: string[]
  improvements: string[]
  technicalAdvice: string[]
  
  // Nouvelles données EXIF
  exifData?: ExifData
  exifAnalysis?: {
    exposureAssessment: string    // Analyse de l'exposition basée sur les paramètres
    equipmentRecommendations: string[]  // Conseils matériel basés sur l'équipement détecté
    technicalIssues: string[]     // Problèmes techniques identifiés via EXIF
    shootingConditions: string    // Conditions de prise de vue déduites
  }
  
  // Métadonnées d'analyse
  tone: 'roast' | 'pro' | 'expert'
  language: string
  processingTime: number
  hasExifData: boolean
}

// Utilitaires pour le parsing EXIF
export interface RawExifTags {
  [key: string]: {
    description?: string
    value?: any
  }
}

// Configuration pour l'extraction EXIF
export const EXIF_CONFIG = {
  // Tags EXIF les plus importants à extraire
  PRIORITY_TAGS: [
    'Make',           // Marque appareil
    'Model',          // Modèle appareil  
    'LensModel',      // Modèle objectif
    'ISO',            // Sensibilité
    'FNumber',        // Ouverture
    'ExposureTime',   // Vitesse d'obturation
    'FocalLength',    // Distance focale
    'ExposureMode',   // Mode exposition
    'WhiteBalance',   // Balance des blancs
    'Flash',          // Flash
    'MeteringMode',   // Mode mesure
    'ExifImageWidth', // Largeur
    'ExifImageHeight',// Hauteur
    'DateTime',       // Date/heure
    'Software',       // Logiciel
    'ColorSpace',     // Espace couleur
    'GPSLatitude',    // GPS Latitude
    'GPSLongitude',   // GPS Longitude
    'GPSAltitude'     // GPS Altitude
  ]
}

// Messages d'erreur localisés
export const EXIF_ERRORS = {
  fr: {
    NO_EXIF: "Aucune donnée EXIF détectée dans cette image",
    PARSING_ERROR: "Erreur lors de l'extraction des données EXIF",
    INCOMPLETE_DATA: "Données EXIF partielles - certaines informations manquent"
  },
  en: {
    NO_EXIF: "No EXIF data detected in this image",
    PARSING_ERROR: "Error while extracting EXIF data", 
    INCOMPLETE_DATA: "Partial EXIF data - some information is missing"
  }
}