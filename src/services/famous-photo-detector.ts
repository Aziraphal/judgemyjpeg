import { logger } from '@/lib/logger'

// Service de détection de photos célèbres
// Pour éviter l'usage abusif tout en gardant l'aspect éducatif

export interface FamousPhotoInfo {
  photographer: string
  title: string
  year?: number
  confidence: number // 0-100
  isIconic: boolean
}

// Base de données simplifiée de photos iconiques (hashes ou caractéristiques)
const FAMOUS_PHOTOS_PATTERNS = [
  // Ansel Adams
  { keywords: ['yosemite', 'mont', 'noir et blanc', 'paysage'], photographer: 'Ansel Adams', minConfidence: 75 },
  
  // Henri Cartier-Bresson
  { keywords: ['rue', 'street', 'decisive moment', 'paris'], photographer: 'Henri Cartier-Bresson', minConfidence: 70 },
  
  // Vivian Maier
  { keywords: ['autoportrait', 'miroir', 'chicago', 'street'], photographer: 'Vivian Maier', minConfidence: 65 },
  
  // Steve McCurry
  { keywords: ['afghan', 'vert', 'portrait', 'national geographic'], photographer: 'Steve McCurry', minConfidence: 80 },
  
  // Annie Leibovitz
  { keywords: ['celebrity', 'portrait', 'vogue', 'studio'], photographer: 'Annie Leibovitz', minConfidence: 70 },
]

export async function detectFamousPhoto(
  imageBase64: string,
  filename: string,
  analysis?: any
): Promise<FamousPhotoInfo | null> {
  try {
    // Méthode 1: Analyse du nom de fichier (la plus fiable)
    const filenameConfidence = analyzeFilename(filename)
    if (filenameConfidence.confidence > 70) {
      return filenameConfidence
    }

    // Méthode 2: Détection via l'analyse IA si elle mentionne des photographes
    if (analysis) {
      const contentConfidence = analyzeContent(analysis)
      if (contentConfidence.confidence > 60) {
        return contentConfidence
      }
    }

    // Méthode 3: Scores suspicieusement parfaits (photos iconiques)
    const compositionConfidence = analyzeComposition(analysis)
    if (compositionConfidence.confidence > 75) {
      return compositionConfidence
    }

    // Méthode 4: Dimension/ratio d'images iconiques
    const dimensionConfidence = analyzeDimensions(imageBase64)
    if (dimensionConfidence.confidence > 65) {
      return dimensionConfidence
    }

    return null

  } catch (error) {
    logger.error('Erreur détection photo célèbre:', error)
    return null
  }
}

function analyzeFilename(filename: string): FamousPhotoInfo {
  const lower = filename.toLowerCase()
  
  // Patterns évidents de photographes célèbres
  const patterns = [
    // Photographes célèbres
    { pattern: /ansel.?adams/i, photographer: 'Ansel Adams', confidence: 90 },
    { pattern: /cartier.?bresson/i, photographer: 'Henri Cartier-Bresson', confidence: 90 },
    { pattern: /steve.?mccurry/i, photographer: 'Steve McCurry', confidence: 90 },
    { pattern: /vivian.?maier/i, photographer: 'Vivian Maier', confidence: 90 },
    { pattern: /annie.?leibovitz/i, photographer: 'Annie Leibovitz', confidence: 90 },
    { pattern: /helmut.?newton/i, photographer: 'Helmut Newton', confidence: 90 },
    { pattern: /robert.?capa/i, photographer: 'Robert Capa', confidence: 90 },
    { pattern: /diane.?arbus/i, photographer: 'Diane Arbus', confidence: 90 },
    { pattern: /richard.?avedon/i, photographer: 'Richard Avedon', confidence: 90 },
    { pattern: /irving.?penn/i, photographer: 'Irving Penn', confidence: 90 },
    
    // Photos iconiques spécifiques  
    { pattern: /(afghan|sharbat).?girl/i, photographer: 'Steve McCurry', confidence: 98, title: 'Afghan Girl' },
    { pattern: /migrant.?mother/i, photographer: 'Dorothea Lange', confidence: 95, title: 'Migrant Mother' },
    { pattern: /moonrise.?hernandez/i, photographer: 'Ansel Adams', confidence: 98, title: 'Moonrise, Hernandez' },
    { pattern: /guerrillero.?heroico/i, photographer: 'Alberto Korda', confidence: 95, title: 'Che Guevara' },
    { pattern: /(girl|napalm).?vietnam/i, photographer: 'Nick Ut', confidence: 95, title: 'Napalm Girl' },
    { pattern: /lunch.?skyscraper/i, photographer: 'Charles Ebbets', confidence: 95, title: 'Lunch atop a Skyscraper' },
    
    // Patterns de sources suspects
    { pattern: /getty.?images/i, photographer: 'Source commerciale', confidence: 80, title: 'Getty Images' },
    { pattern: /shutterstock/i, photographer: 'Source commerciale', confidence: 85, title: 'Shutterstock' },
    { pattern: /unsplash/i, photographer: 'Source libre', confidence: 70, title: 'Unsplash' },
    { pattern: /(magnum|national.?geographic)/i, photographer: 'Archive professionnelle', confidence: 75, title: 'Source prestigieuse' },
    
    // Patterns de copies/téléchargements
    { pattern: /(copy|download|image\d+)/i, photographer: 'Fichier téléchargé', confidence: 60, title: 'Copy détectée' },
    { pattern: /\d{10,}/i, photographer: 'Fichier web', confidence: 55, title: 'ID numérique suspect' },
  ]

  for (const pattern of patterns) {
    if (pattern.pattern.test(filename)) {
      return {
        photographer: pattern.photographer,
        title: pattern.title || 'Œuvre référencée',
        confidence: pattern.confidence,
        isIconic: pattern.confidence > 85
      }
    }
  }

  return { photographer: '', title: '', confidence: 0, isIconic: false }
}

function analyzeContent(analysis: any): FamousPhotoInfo {
  if (!analysis || !analysis.technical) return { photographer: '', title: '', confidence: 0, isIconic: false }

  const content = JSON.stringify(analysis).toLowerCase()
  
  // Recherche de références à des photographes célèbres dans l'analyse
  const photographerRefs = [
    { name: 'cartier-bresson', photographer: 'Henri Cartier-Bresson', confidence: 60 },
    { name: 'ansel adams', photographer: 'Ansel Adams', confidence: 60 },
    { name: 'steve mccurry', photographer: 'Steve McCurry', confidence: 60 },
    { name: 'vivian maier', photographer: 'Vivian Maier', confidence: 60 },
    { name: 'annie leibovitz', photographer: 'Annie Leibovitz', confidence: 60 },
  ]

  for (const ref of photographerRefs) {
    if (content.includes(ref.name)) {
      return {
        photographer: ref.photographer,
        title: 'Style reconnu',
        confidence: ref.confidence,
        isIconic: false
      }
    }
  }

  return { photographer: '', title: '', confidence: 0, isIconic: false }
}

function analyzeComposition(analysis: any): FamousPhotoInfo {
  if (!analysis) return { photographer: '', title: '', confidence: 0, isIconic: false }

  // Analyse des scores parfaits suspicieux
  const scores = analysis.partialScores
  if (scores) {
    const totalScore = Object.values(scores).reduce((a: number, b: any) => a + (b as number), 0)
    const maxPossible = 15 + 15 + 15 + 15 + 15 + 15 + 10 // Total max possible
    
    // Score suspicieusement parfait (>95%)
    if (totalScore / maxPossible > 0.95) {
      return {
        photographer: 'Photographe célèbre',
        title: 'Photo potentiellement iconique',
        confidence: 80,
        isIconic: true
      }
    }
    
    // Score très élevé avec composition parfaite (>90%)
    if (totalScore / maxPossible > 0.90 && scores.composition >= 14) {
      return {
        photographer: 'Maître photographe',
        title: 'Composition magistrale détectée',
        confidence: 65,
        isIconic: true
      }
    }
  }

  return { photographer: '', title: '', confidence: 0, isIconic: false }
}

function analyzeDimensions(imageBase64: string): FamousPhotoInfo {
  try {
    // Analyser la taille de l'image base64 pour détecter des patterns suspects
    const sizeKB = (imageBase64.length * 3) / 4 / 1024
    
    // Images trop parfaites (probablement retéléchargées depuis internet)
    if (sizeKB > 500 && sizeKB < 2000) {
      return {
        photographer: 'Source Internet',
        title: 'Image possiblement téléchargée',
        confidence: 55,
        isIconic: false
      }
    }
    
    // Images très lourdes (scans haute qualité d'œuvres)
    if (sizeKB > 5000) {
      return {
        photographer: 'Archive professionnelle',
        title: 'Scan haute qualité détecté',
        confidence: 60,
        isIconic: true
      }
    }
    
    return { photographer: '', title: '', confidence: 0, isIconic: false }
    
  } catch (error) {
    return { photographer: '', title: '', confidence: 0, isIconic: false }
  }
}

// Fonction utilitaire pour marquer les photos célèbres
export function shouldMarkAsFamous(confidence: number): boolean {
  return confidence > 50 // Seuil de détection
}

export function getFamousPhotoMessage(info: FamousPhotoInfo): string {
  if (info.confidence > 80) {
    return `🎨 Photo d'œuvre célèbre détectée (${info.photographer}${info.title ? ` - ${info.title}` : ''}) - Analyse à titre éducatif`
  } else if (info.confidence > 60) {
    return `📚 Style de ${info.photographer} détecté - Analyse éducative`
  } else {
    return `🔍 Possible référence artistique détectée - Analyse comparative`
  }
}