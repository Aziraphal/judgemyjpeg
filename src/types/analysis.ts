// Types pour l'analyse de photos - utilisables côté client et serveur
export type AnalysisTone = 'professional' | 'roast' | 'expert'
export type AnalysisLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'
export type PhotoType = 
  | 'portrait' 
  | 'landscape' 
  | 'street' 
  | 'macro' 
  | 'architecture' 
  | 'nature' 
  | 'sport' 
  | 'night' 
  | 'wedding' 
  | 'abstract' 
  | 'documentary' 
  | 'fashion' 
  | 'food' 
  | 'travel' 
  | 'other'

// Configuration des types de photo avec prompts spécialisés
export const PHOTO_TYPES_CONFIG = {
  portrait: {
    name: 'Portrait',
    emoji: '👤',
    description: 'Photos de personnes, portraits artistiques ou corporatifs',
    focusAreas: ['expression', 'éclairage visage', 'profondeur de champ', 'pose'],
    specificCriteria: {
      lighting: 'Qualité de l\'éclairage du visage, gestion des ombres',
      composition: 'Cadrage du sujet, règle des tiers appliquée au visage',
      emotion: 'Expression du sujet, connexion avec le spectateur',
      technical: 'Netteté des yeux, profondeur de champ appropriée'
    }
  },
  landscape: {
    name: 'Paysage',
    emoji: '🏔️',
    description: 'Paysages naturels, urbains ou ruraux',
    focusAreas: ['horizon', 'lumière naturelle', 'profondeur', 'éléments naturels'],
    specificCriteria: {
      composition: 'Ligne d\'horizon, premier plan/arrière-plan',
      lighting: 'Lumière dorée, contraste naturel, atmosphère',
      technical: 'Netteté globale, hyperfocale, exposition ciel/terre',
      creativity: 'Perspective unique, moment capturé'
    }
  },
  street: {
    name: 'Street Photo',
    emoji: '🏙️',
    description: 'Photographie de rue, scènes de vie urbaine',
    focusAreas: ['moment décisif', 'spontanéité', 'interaction sociale', 'géométrie urbaine'],
    specificCriteria: {
      storytelling: 'Narration visuelle, capture du moment',
      composition: 'Géométrie urbaine, lignes de fuite',
      emotion: 'Authenticité, émotion spontanée',
      technical: 'Réactivité, gestion lumière variable'
    }
  },
  macro: {
    name: 'Macro',
    emoji: '🔍',
    description: 'Photographie rapprochée, détails, nature',
    focusAreas: ['netteté extrême', 'détails fins', 'profondeur de champ réduite', 'bokeh'],
    specificCriteria: {
      focus: 'Zone de netteté critique, micro-détails',
      lighting: 'Éclairage doux, éviter les reflets',
      composition: 'Cadrage serré, élément principal isolé',
      technical: 'Stabilité, ouverture optimale, grossissement'
    }
  },
  architecture: {
    name: 'Architecture',
    emoji: '🏛️',
    description: 'Bâtiments, structures, design architectural',
    focusAreas: ['lignes de fuite', 'symétrie', 'géométrie', 'perspective'],
    specificCriteria: {
      composition: 'Lignes de fuite, perspective, symétrie',
      technical: 'Correction des distorsions, netteté globale',
      lighting: 'Contraste architectural, ombres créatives',
      creativity: 'Angle de vue original, cadrage innovant'
    }
  },
  nature: {
    name: 'Nature',
    emoji: '🌿',
    description: 'Faune, flore, environnements naturels',
    focusAreas: ['lumière naturelle', 'patience', 'respect environnement', 'détails naturels'],
    specificCriteria: {
      lighting: 'Lumière naturelle douce, golden hour',
      composition: 'Sujet isolé, environnement harmonieux',
      emotion: 'Beauté naturelle, moment authentique',
      technical: 'Patience technique, conditions extérieures'
    }
  },
  sport: {
    name: 'Sport',
    emoji: '⚽',
    description: 'Action sportive, mouvement, énergie',
    focusAreas: ['vitesse d\'obturation', 'anticipation', 'mouvement figé', 'émotion action'],
    specificCriteria: {
      technical: 'Vitesse d\'obturation, suivi de mise au point',
      emotion: 'Intensité sportive, moment clé',
      composition: 'Cadrage dynamique, mouvement suggéré',
      storytelling: 'Narration de l\'action, contexte sportif'
    }
  },
  night: {
    name: 'Photo de nuit',
    emoji: '🌙',
    description: 'Photographie nocturne, faible lumière',
    focusAreas: ['gestion ISO', 'longue exposition', 'sources lumineuses', 'stabilité'],
    specificCriteria: {
      technical: 'Gestion du bruit, exposition longue, stabilité',
      lighting: 'Sources lumineuses multiples, contraste',
      creativity: 'Ambiance nocturne, effets lumineux',
      composition: 'Éléments éclairés, silhouettes'
    }
  },
  wedding: {
    name: 'Mariage',
    emoji: '💒',
    description: 'Photographie de mariage, événements',
    focusAreas: ['émotion', 'discrétion', 'moments clés', 'lumière disponible'],
    specificCriteria: {
      emotion: 'Capture d\'émotions authentiques',
      storytelling: 'Narration de l\'événement',
      technical: 'Discrétion, lumière disponible',
      composition: 'Moments intimes, interactions'
    }
  },
  abstract: {
    name: 'Abstrait',
    emoji: '🎨',
    description: 'Art visuel, formes, couleurs, concepts',
    focusAreas: ['créativité', 'interprétation', 'couleurs', 'formes géométriques'],
    specificCriteria: {
      creativity: 'Originalité conceptuelle, vision artistique',
      composition: 'Équilibre visuel, rythme',
      lighting: 'Utilisation créative de la lumière',
      emotion: 'Impact visuel, interprétation personnelle'
    }
  },
  documentary: {
    name: 'Documentaire',
    emoji: '📰',
    description: 'Reportage, témoignage, réalité sociale',
    focusAreas: ['authenticité', 'contexte', 'témoignage', 'objectivité'],
    specificCriteria: {
      storytelling: 'Message clair, contexte informatif',
      emotion: 'Authenticité, impact social',
      composition: 'Cadrage informatif, éléments contextuels',
      technical: 'Adaptabilité, conditions réelles'
    }
  },
  fashion: {
    name: 'Mode',
    emoji: '👗',
    description: 'Photographie de mode, style, tendances',
    focusAreas: ['mise en scène', 'éclairage studio', 'style', 'créativité'],
    specificCriteria: {
      lighting: 'Éclairage maîtrisé, mise en valeur',
      composition: 'Mise en scène, cadrage élégant',
      creativity: 'Style personnel, tendances mode',
      technical: 'Qualité technique irréprochable'
    }
  },
  food: {
    name: 'Culinaire',
    emoji: '🍽️',
    description: 'Photographie culinaire, gastronomie',
    focusAreas: ['présentation', 'éclairage doux', 'couleurs appétissantes', 'composition'],
    specificCriteria: {
      lighting: 'Lumière douce et naturelle, sans reflets',
      composition: 'Présentation appétissante, accessoires',
      creativity: 'Styling culinaire, originalité',
      technical: 'Couleurs fidèles, netteté sélective'
    }
  },
  travel: {
    name: 'Voyage',
    emoji: '✈️',
    description: 'Photographie de voyage, découverte culturelle',
    focusAreas: ['culture locale', 'lumière naturelle', 'authenticité', 'souvenirs'],
    specificCriteria: {
      storytelling: 'Récit de voyage, découverte culturelle',
      composition: 'Éléments culturels, environnement typique',
      emotion: 'Émerveillement, authenticité locale',
      technical: 'Adaptabilité, conditions variables'
    }
  },
  other: {
    name: 'Autre',
    emoji: '📷',
    description: 'Autre type de photographie',
    focusAreas: ['créativité', 'technique', 'composition', 'originalité'],
    specificCriteria: {
      composition: 'Règles de composition générales',
      technical: 'Maîtrise technique générale',
      creativity: 'Originalité et vision personnelle',
      emotion: 'Impact visuel général'
    }
  }
} as const

export interface PhotoAnalysis {
  score: number
  partialScores: {
    composition: number
    lighting: number
    focus: number
    exposure: number
    creativity: number
    emotion: number
    storytelling: number
  }
  technical: {
    composition: string
    lighting: string
    focus: string
    exposure: string
  }
  artistic: {
    creativity: string
    emotion: string
    storytelling: string
  }
  suggestions: string[]
  improvements: {
    impact: string
    description: string
    difficulty: 'facile' | 'moyen' | 'difficile'
    scoreGain: number
  }[]
  toolRecommendations: {
    lightroom?: string[]
    photoshop?: string[]
    snapseed?: string[]
  }
  // NOUVELLES SECTIONS SÉPARÉES
  nextShotTips: {
    tip: string
    category: 'technique' | 'composition' | 'éclairage' | 'créativité'
    difficulty: 'débutant' | 'intermédiaire' | 'avancé'
  }[]
  editingRecommendations: {
    suggestion: string
    tool: 'Lightroom' | 'Photoshop' | 'Snapseed' | 'GIMP'
    difficulty: 'facile' | 'moyen' | 'difficile'
    expectedImprovement: string
  }[]
  // NOUVELLES DONNÉES EXIF
  exifData?: any
  exifAnalysis?: {
    exposureAssessment: string
    equipmentRecommendations: string[]
    technicalIssues: string[]
    shootingConditions: string
  }
  hasExifData: boolean
  // TYPE DE PHOTO ET TRACKING
  photoType?: PhotoType
  analysisMetadata?: {
    timestamp: string
    userId?: string
    sessionId?: string
  }
}