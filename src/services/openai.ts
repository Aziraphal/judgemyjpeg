import OpenAI from 'openai'
import { ExifData } from '@/types/exif'
import { generateShootingConditionsSummary } from '@/utils/exifExtractor'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

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
  exifData?: ExifData
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

export async function analyzePhoto(
  imageBase64: string, 
  tone: AnalysisTone = 'professional',
  language: AnalysisLanguage = 'fr',
  exifData?: ExifData | null,
  photoType: PhotoType = 'other',
  userId?: string
): Promise<PhotoAnalysis> {
  try {
    // Configuration des langues
    const languageConfig = {
      fr: { name: 'français', code: 'fr' },
      en: { name: 'English', code: 'en' },
      es: { name: 'español', code: 'es' },
      de: { name: 'Deutsch', code: 'de' },
      it: { name: 'italiano', code: 'it' },
      pt: { name: 'português', code: 'pt' }
    }

    const currentLang = languageConfig[language]

    // Générer le résumé des conditions de prise de vue si EXIF disponible
    const shootingConditions = exifData ? generateShootingConditionsSummary(exifData) : null
    
    // Récupérer la configuration du type de photo
    const photoTypeConfig = PHOTO_TYPES_CONFIG[photoType]
    
    // Construire la section spécialisée selon le type de photo
    const photoTypeSection = `

📸 TYPE DE PHOTOGRAPHIE : ${photoTypeConfig.name.toUpperCase()} ${photoTypeConfig.emoji}

🎯 CRITÈRES SPÉCIALISÉS POUR ${photoTypeConfig.name.toUpperCase()} :
${Object.entries(photoTypeConfig.specificCriteria).map(([key, value]) => 
  `• ${key.charAt(0).toUpperCase() + key.slice(1)} : ${value}`
).join('\n')}

🔍 ZONES D'ATTENTION PRIORITAIRES :
${photoTypeConfig.focusAreas.map(area => `• ${area}`).join('\n')}

⚠️ OBLIGATIONS SPÉCIFIQUES ${photoTypeConfig.name.toUpperCase()} :
- ANALYSE cette photo selon les standards ${photoTypeConfig.name}
- JUGE les critères spécifiques à ce type de photographie
- COMPARE aux références de ce genre photographique
- DONNE des conseils adaptés à cette spécialité
`
    
    // Construire la section EXIF pour le prompt Expert
    const exifSection = exifData && tone === 'expert' ? `
    
📊 DONNÉES TECHNIQUES RÉELLES EXTRAITES DE L'IMAGE :
${exifData.camera ? `• Appareil : ${exifData.camera}` : ''}
${exifData.lens ? `• Objectif : ${exifData.lens}` : ''}
${exifData.iso ? `• ISO : ${exifData.iso}` : ''}
${exifData.aperture ? `• Ouverture : ${exifData.aperture}` : ''}
${exifData.shutterSpeed ? `• Vitesse : ${exifData.shutterSpeed}` : ''}
${exifData.focalLength ? `• Focale : ${exifData.focalLength}` : ''}
${exifData.exposureMode ? `• Mode exposition : ${exifData.exposureMode}` : ''}
${exifData.whiteBalance ? `• Balance des blancs : ${exifData.whiteBalance}` : ''}
${exifData.flashMode ? `• Flash : ${exifData.flashMode}` : ''}
${exifData.dimensions ? `• Dimensions : ${exifData.dimensions.width}×${exifData.dimensions.height}` : ''}
${shootingConditions ? `• Conditions déduites : ${shootingConditions}` : ''}

⚠️ OBLIGATIONS AVEC CES DONNÉES RÉELLES :
- ANALYSE ces paramètres exacts sans les deviner
- JUGE la cohérence ISO/ouverture/vitesse pour les conditions
- IDENTIFIE les erreurs techniques basées sur ces réglages
- COMMENTE l'adéquation matériel/objectif pour le résultat
- DONNE des recommandations précises selon l'équipement utilisé
` : ''

    const analysisPrompt = tone === 'roast' 
      ? `🔥 MODE ROAST - CRITIQUE PHOTO IMPITOYABLE 🔥

Tu es un CRITIQUE PHOTOGRAPHIQUE qui adore roaster les photos avec intelligence et humour noir. 
Ton job : analyser cette photo avec PRÉCISION TECHNIQUE mais un TON SARCASTIQUE et CRÉATIF.
${photoTypeSection}
🎯 STYLE ROAST REQUIS :
✅ Sois MÉCHANT mais JUSTE dans tes évaluations
✅ Utilise des MÉTAPHORES CRÉATIVES et des comparaisons hilarantes
✅ Roaste les défauts SPÉCIFIQUES de cette photo
✅ Garde un niveau technique ÉLEVÉ
✅ Sois DRÔLE et ORIGINAL dans tes punchlines
✅ Analyse ce que tu VOIS vraiment dans l'image

🔥 EXEMPLES DE TON ROAST :
- "Tu as cadré ça comme un daltonien arrange ses chaussettes"
- "Cette lumière a l'air aussi naturelle qu'un sourire de politicien"
- "La netteté de ton image rivalise avec celle d'un myope dans le brouillard"
- "Cette composition respecte la règle des tiers comme moi je respecte mon régime"

💀 INTERDICTIONS :
❌ Ne dis JAMAIS "intéressant", "basique", "pas mal"
❌ Pas de langue de bois ou de politesse excessive
❌ Évite les commentaires génériques

✅ OBLIGATIONS :
✅ Commente les DÉTAILS SPÉCIFIQUES de cette photo
✅ Sois créatif dans tes critiques
✅ Note avec PRÉCISION technique
✅ Fais RIRE avec tes analyses

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : tone === 'expert'
      ? `🎯 MODE EXPERT - CRITIQUE PHOTOGRAPHIQUE PROFESSIONNELLE

Tu es un CRITIQUE PHOTOGRAPHIQUE SENIOR pour National Geographic et Magnum Photos. 
Tu analyses des photos soumises pour publication internationale. AUCUNE PÉDAGOGIE - SEULEMENT EXPERTISE PURE.
${photoTypeSection}
⚠️ INTERDICTIONS FORMELLES :
❌ AUCUNE vulgarisation ou explication simplifiée
❌ AUCUN ton bienveillant ou encourageant  
❌ AUCUNE phrase comme "pour améliorer" ou "conseil"
❌ PAS de pédagogie - le lecteur EST UN PROFESSIONNEL

✅ OBLIGATIONS TECHNIQUES STRICTES :

1. ANALYSE MATÉRIEL PRÉCISE :
- Déduire objectif utilisé (ex: "35mm f/1.4 Sigma Art, ouverture f/2.8")
- Identifier capteur probable (APS-C/FF) via compression spatiale
- Diagnostiquer ISO réel via grain et bruit chromatique
- Analyser MTF et acutance aux jonctions de contraste

2. VOCABULAIRE TECHNIQUE OBLIGATOIRE :
Utilise : "acutance", "falloff", "compression spatiale", "dynamique tonale", "zone système", "clipping", "gamut", "bracketing", "DRL", "ISO invariance", "micro-contraste", "modélisation lumière", "rendu tonal", "saturation sélective"

3. RÉFÉRENCES MAÎTRES IMPOSÉES :
Compare OBLIGATOIREMENT à : Cartier-Bresson (géométrie), Adams (zones), Leibovitz (éclairage), McCurry (couleur), Newton (contraste), Gursky (composition), Sherman (mise en scène)

4. ESTIMATION COMMERCIALE FROIDE :
- Prix agence photo (50-5000€)
- Usage possible (éditorial/pub/art)
- Défauts bloquants pour publication
- Note finale SANS concession

5. TON PROFESSIONNEL EXIGÉ :
- Critique direct et factuel
- Langage de critique d'art photographique
- Aucun ménagement ni encouragement
- Analyse comme pour sélection d'exposition

CETTE PHOTO EST-ELLE PUBLIABLE ? JUSTIFIE CHAQUE POINT SANS MÉNAGEMENT.
${exifSection}
RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `💼 MODE PROFESSIONNEL - ANALYSE PÉDAGOGIQUE

Tu es un PROFESSEUR DE PHOTOGRAPHIE bienveillant avec 15 ans d'expérience.
${photoTypeSection}
STYLE PROFESSIONNEL :
- Commence par les points positifs
- Vocabulaire accessible mais technique
- Explique le "pourquoi" des évaluations
- Conseils concrets et motivants
- Ton encourageant et constructif

CONSEILS OBLIGATOIRES :
- Ajustements Lightroom précis (exposition, contraste...)
- Techniques de composition pour la prochaine prise
- Suggestions d'amélioration réalistes

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`


    const fullPrompt = `
    ${analysisPrompt}
    
    CRITÈRES D'ÉVALUATION (sois précis et juste) :
    
    SECTION TECHNIQUE (/60 points) :
    - Composition : /15 points (cadrage, règle des tiers, équilibre)
    - Lumière : /15 points (qualité, direction, contraste)
    - Mise au point : /15 points (netteté, profondeur de champ)
    - Exposition : /15 points (histogramme, sur/sous-exposition)
    
    SECTION ARTISTIQUE (/40 points) :
    - Créativité : /15 points (originalité, angle de vue)
    - Émotion : /15 points (impact visuel, atmosphère)
    - Narration : /10 points (message, storytelling)
    
    TOTAL : /100

    🎯 INSTRUCTIONS SPÉCIFIQUES :
    - Analyse les DÉTAILS RÉELS de cette photo
    - Note avec PRÉCISION selon la qualité observée
    - ${tone === 'roast' ? 'Sois CRÉATIF et DRÔLE dans tes roasts' : 
         tone === 'expert' ? 'Sois ULTRA-TECHNIQUE et RÉFÉRENCE les MAÎTRES' : 
         'Sois CONSTRUCTIF et PÉDAGOGIQUE'}
    - Commente ce que tu VOIS vraiment, pas des généralités
    
    Fournissez une analyse détaillée en JSON avec cette structure exacte :

    {
      "partialScores": {
        "composition": [note de 0 à 15],
        "lighting": [note de 0 à 15],
        "focus": [note de 0 à 15],
        "exposure": [note de 0 à 15],
        "creativity": [note de 0 à 15],
        "emotion": [note de 0 à 15],
        "storytelling": [note de 0 à 10]
      },
      "technical": {
        "composition": "[analyse spécifique de LA composition de CETTE photo]",
        "lighting": "[analyse spécifique de LA lumière de CETTE photo]",
        "focus": "[analyse spécifique de LA netteté de CETTE photo]",
        "exposure": "[analyse spécifique de L'exposition de CETTE photo]"
      },
      "artistic": {
        "creativity": "[analyse spécifique de LA créativité de CETTE photo]",
        "emotion": "[analyse spécifique de L'émotion de CETTE photo]",
        "storytelling": "[analyse spécifique de LA narration de CETTE photo]"
      },
      "suggestions": [
        "suggestion concrète spécifique à cette photo",
        "conseil technique actionnable",
        "amélioration créative possible"
      ],
      "improvements": [
        {
          "impact": "Amélioration spécifique",
          "description": "Action concrète à faire",
          "difficulty": "facile|moyen|difficile",
          "scoreGain": [TOUJOURS UN GAIN POSITIF entre 1 et 25 points - JAMAIS négatif]
        }
      ],
      "toolRecommendations": {
        "lightroom": ["retouches Lightroom spécifiques"],
        "photoshop": ["retouches Photoshop spécifiques"],
        "snapseed": ["ajustements mobile spécifiques"]
      },
      "nextShotTips": [
        {
          "tip": "Conseil spécifique pour améliorer la prochaine prise de vue",
          "category": "technique|composition|éclairage|créativité",
          "difficulty": "débutant|intermédiaire|avancé"
        },
        {
          "tip": "Deuxième conseil pour la prise de vue suivante",
          "category": "technique|composition|éclairage|créativité",
          "difficulty": "débutant|intermédiaire|avancé"
        },
        {
          "tip": "Troisième conseil pratique pour s'améliorer",
          "category": "technique|composition|éclairage|créativité",
          "difficulty": "débutant|intermédiaire|avancé"
        }
      ],
      "editingRecommendations": [
        {
          "suggestion": "Retouche spécifique pour améliorer CETTE photo",
          "tool": "Lightroom|Photoshop|Snapseed|GIMP",
          "difficulty": "facile|moyen|difficile",
          "expectedImprovement": "Résultat attendu de cette retouche"
        },
        {
          "suggestion": "Deuxième suggestion de retouche pour cette photo",
          "tool": "Lightroom|Photoshop|Snapseed|GIMP",
          "difficulty": "facile|moyen|difficile",
          "expectedImprovement": "Bénéfice de cette modification"
        },
        {
          "suggestion": "Troisième idée de retouche ciblée",
          "tool": "Lightroom|Photoshop|Snapseed|GIMP",
          "difficulty": "facile|moyen|difficile",
          "expectedImprovement": "Impact visuel escompté"
        }
      ]
    }
    
    📸 SECTION "nextShotTips" : Conseils pour améliorer la PROCHAINE PRISE de vue
    🎨 SECTION "editingRecommendations" : Suggestions pour retoucher CETTE PHOTO ACTUELLE
    `

    // DEBUG: Log pour vérifier le ton utilisé
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ANALYSE DEBUG:', {
        tone,
        promptLength: fullPrompt.length,
        promptStart: fullPrompt.substring(0, 150),
        isExpertMode: tone === 'expert'
      })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: fullPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Réponse OpenAI vide')
    }
    
    // Extraire le JSON de la réponse
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Réponse OpenAI invalide - pas de JSON')
    }

    const rawAnalysis = JSON.parse(jsonMatch[0])
    
    // Calculer le score total côté serveur
    const partialScores = rawAnalysis.partialScores
    const calculatedScore = 
      partialScores.composition +
      partialScores.lighting +
      partialScores.focus +
      partialScores.exposure +
      partialScores.creativity +
      partialScores.emotion +
      partialScores.storytelling
    
    // Générer l'analyse EXIF si données disponibles
    const exifAnalysisData = exifData ? generateExifAnalysis(exifData) : undefined
    
    const analysis: PhotoAnalysis = {
      ...rawAnalysis,
      score: calculatedScore,
      exifData: exifData || undefined,
      exifAnalysis: exifAnalysisData,
      hasExifData: !!exifData,
      photoType: photoType,
      analysisMetadata: {
        timestamp: new Date().toISOString(),
        userId: userId,
        sessionId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }
    
    return analysis

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur analyse OpenAI:', error)
    }
    throw new Error('Impossible d\'analyser la photo')
  }
}

/**
 * Génère une analyse technique basée sur les données EXIF
 */
function generateExifAnalysis(exif: ExifData) {
  const analysis = {
    exposureAssessment: '',
    equipmentRecommendations: [] as string[],
    technicalIssues: [] as string[],
    shootingConditions: ''
  }
  
  // Évaluation de l'exposition basée sur le triangle d'exposition
  if (exif.iso && exif.aperture && exif.shutterSpeed) {
    const isoNum = exif.iso
    
    if (isoNum <= 200) {
      analysis.exposureAssessment = "Excellentes conditions lumineuses - ISO faible optimal pour la qualité d'image"
    } else if (isoNum <= 800) {
      analysis.exposureAssessment = "Conditions lumineuses correctes - ISO modéré, bon compromis qualité/sensibilité"
    } else if (isoNum <= 3200) {
      analysis.exposureAssessment = "Faible luminosité - ISO élevé peut introduire du bruit numérique"
    } else {
      analysis.exposureAssessment = "Conditions très sombres - ISO très élevé, bruit significatif probable"
      analysis.technicalIssues.push("ISO extrêmement élevé - risque de bruit important")
    }
  }
  
  // Recommandations équipement
  if (exif.camera) {
    if (exif.camera.toLowerCase().includes('canon')) {
      analysis.equipmentRecommendations.push("Exploiter le Dynamic Range optimisé Canon en post-traitement")
    } else if (exif.camera.toLowerCase().includes('sony')) {
      analysis.equipmentRecommendations.push("Profiter de la gestion ISO excellente Sony pour les hauts ISO")
    } else if (exif.camera.toLowerCase().includes('nikon')) {
      analysis.equipmentRecommendations.push("Utiliser la colorimétrie naturelle Nikon pour les tons chair")
    }
  }
  
  // Analyse de la focale et perspective
  if (exif.focalLength) {
    const focalNum = parseInt(exif.focalLength.replace('mm', ''))
    if (focalNum <= 24) {
      analysis.equipmentRecommendations.push("Grand angle - attention aux distorsions en périphérie")
    } else if (focalNum >= 85) {
      analysis.equipmentRecommendations.push("Focale portrait - excellente compression spatiale pour isoler le sujet")
    }
  }
  
  // Détection problèmes techniques potentiels
  if (exif.shutterSpeed) {
    const speed = exif.shutterSpeed
    if (speed.includes('1/') && parseInt(speed.split('/')[1]) < 60) {
      analysis.technicalIssues.push("Vitesse lente - risque de flou de bougé sans stabilisation")
    }
  }
  
  // Analyse ouverture et profondeur de champ
  if (exif.aperture) {
    const fNumber = parseFloat(exif.aperture.replace('f/', ''))
    if (fNumber <= 1.8) {
      analysis.equipmentRecommendations.push("Très grande ouverture - profondeur de champ ultra-réduite, mise au point critique")
    } else if (fNumber >= 8) {
      analysis.equipmentRecommendations.push("Petite ouverture - excellente netteté globale mais attention à la diffraction")
    }
  }
  
  // Conditions de prise de vue déduites
  analysis.shootingConditions = generateShootingConditionsSummary(exif)
  
  return analysis
}