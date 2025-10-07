import OpenAI from 'openai'
import { ExifData } from '@/types/exif'
import { generateShootingConditionsSummary } from '@/utils/exifExtractor'
import { logger } from '@/lib/logger'
import {
  AnalysisTone,
  AnalysisLanguage,
  PhotoType,
  PhotoAnalysis,
  PHOTO_TYPES_CONFIG
} from '@/types/analysis'
import {
  generateImageEmbedding,
  findSimilarAnalyses,
  enrichPromptWithExamples,
  storeAnalysis
} from './rag'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 60000, // 60 secondes timeout
  maxRetries: 3  // Retry automatique OpenAI
})

// Circuit breaker simple pour OpenAI
let failureCount = 0
let lastFailureTime = 0
const CIRCUIT_BREAKER_THRESHOLD = 5
const CIRCUIT_BREAKER_TIMEOUT = 300000 // 5 minutes

function isCircuitBreakerOpen(): boolean {
  if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
    if (Date.now() - lastFailureTime < CIRCUIT_BREAKER_TIMEOUT) {
      return true
    } else {
      // Reset après timeout
      failureCount = 0
      lastFailureTime = 0
    }
  }
  return false
}

function recordFailure(): void {
  failureCount++
  lastFailureTime = Date.now()
}

function recordSuccess(): void {
  failureCount = Math.max(0, failureCount - 1)
}

export async function analyzePhoto(
  imageBase64: string,
  tone: AnalysisTone = 'professional',
  language: AnalysisLanguage = 'fr',
  exifData?: ExifData | null,
  photoType: PhotoType = 'general',
  userId?: string,
  photoId?: string // Pour stocker dans RAG
): Promise<PhotoAnalysis> {
  let imageData = imageBase64 // Copie locale pour cleanup

  try {
    // Vérifier le circuit breaker
    if (isCircuitBreakerOpen()) {
      logger.error('OpenAI circuit breaker open', {
        userId,
        failureCount,
        lastFailureTime
      })
      throw new Error('Service IA temporairement indisponible. Veuillez réessayer dans quelques minutes.')
    }

    // Log taille image pour monitoring memory
    const imageSizeKB = Math.round(imageData.length / 1024)
    if (imageSizeKB > 10000) { // 10MB
      logger.warn('Large image processing', {
        userId,
        imageSizeKB,
        tone,
        photoType
      })
    }

    // 🚀 RAG: Générer embedding et trouver analyses similaires
    let similarAnalyses: any[] = []
    let imageEmbedding: number[] | null = null

    try {
      logger.debug('Generating image embedding for RAG')
      imageEmbedding = await generateImageEmbedding(imageData)

      logger.debug('Finding similar analyses via RAG')
      similarAnalyses = await findSimilarAnalyses(imageEmbedding, 3)

      if (similarAnalyses.length > 0) {
        logger.info(`RAG: Found ${similarAnalyses.length} similar analyses to enrich prompt`)
      }
    } catch (ragError) {
      logger.warn('RAG enrichment failed, continuing without it:', ragError)
      // Continue sans RAG si erreur
    }
    // Configuration des langues
    const languageConfig = {
      fr: { name: 'français', code: 'fr' },
      en: { name: 'English', code: 'en' },
      es: { name: 'español', code: 'es' },
      zh: { name: '中文', code: 'zh' },
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
    
    // Construire la section EXIF pour le prompt Art Critic  
    const exifSection = exifData && tone === 'learning' ? `
    
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

⚠️ UTILISATION ARTISTIQUE DES DONNÉES TECHNIQUES :
- IGNORE les aspects purement techniques (ISO, vitesse, etc.)
- INTERPRÈTE le choix d'objectif comme intention artistique
- ANALYSE l'appareil utilisé comme contexte culturel (smartphone vs reflex)
- COMMENTE l'adéquation outil/message artistique
- FOCUS sur l'intention créative derrière les choix techniques
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

🔥 EXEMPLES DE TON ROAST OBLIGATOIRES :
- "Cette exposition ressemble à un vampire qui a peur de la lumière... quelques crans plus lumineux arrangeraient les choses"
- "Le cadrage ? L'appareil a eu le hoquet ! 📸💀"
- "Tu as cadré ça comme un daltonien arrange ses chaussettes"
- "Cette lumière a l'air aussi naturelle qu'un sourire de politicien"
- "La netteté de ton image rivalise avec celle d'un myope dans le brouillard"

🎯 FORMULATIONS TECHNIQUES ROAST :
✅ Utilise des comparaisons hilarantes pour les défauts techniques  
✅ Garde la précision technique mais avec humour
✅ Compare à des situations ridicules mais précises
✅ Évite le jargon technique trop poussé (réservé au mode expert)

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
      : tone === 'learning'
      ? `📚 MODE APPRENTISSAGE - FORMATION PHOTOGRAPHIQUE COMPLÈTE

Tu es un PROFESSEUR DE PHOTOGRAPHIE expérimenté qui forme des débutants et intermédiaires. 
Tu expliques CHAQUE point technique et artistique avec PÉDAGOGIE, patience et bienveillance.
${photoTypeSection}
🎯 MISSION APPRENTISSAGE :
✅ Explique POURQUOI (pas seulement QUOI améliorer)
✅ Utilise un langage accessible mais précis
✅ Donne des exemples concrets et pratiques
✅ Encourage et motive l'apprentissage
✅ Enseigne les règles ET les exceptions créatives
✅ Lie technique et créativité

📚 TON PÉDAGOGIQUE REQUIS :
✅ Patient et bienveillant (jamais condescendant)
✅ Structuré et progressif
✅ Exemples concrets et comparaisons
✅ Encourage l'expérimentation
✅ Explique le "pourquoi" de chaque conseil

🔧 ANALYSE TECHNIQUE PÉDAGOGIQUE :
- Explique l'impact de chaque réglage sur le résultat
- Donne des alternatives techniques concrètes
- Explique les règles de base ET les exceptions créatives
- Suggère des exercices pratiques

🎨 ANALYSE ARTISTIQUE PÉDAGOGIQUE :
- Explique l'impact émotionnel des choix artistiques
- Références à des maîtres accessibles (pas trop pointu)
- Encourage la vision personnelle
- Lie technique et créativité

💡 CONSEILS PRATIQUES OBLIGATOIRES :
- Exercices spécifiques à reproduire
- Réglages précis à tester
- Erreurs courantes à éviter
- Progression par étapes

🎯 STRUCTURE PÉDAGOGIQUE :
1. Points forts à retenir
2. Axes d'amélioration avec explications du POURQUOI
3. Conseils techniques précis
4. Exercices pratiques pour progresser
5. Encouragement et motivation

AIDE CETTE PERSONNE À PROGRESSER AVEC BIENVEILLANCE ET PRÉCISION.
${exifSection}
RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `👨‍🎓 MODE PRO - CONSEILS CONSTRUCTIFS SIMPLIFIÉS

Tu es un COACH PHOTO qui donne des conseils CLAIRS et MOTIVANTS. Analyse cette photo avec PÉDAGOGIE et encourage l'apprentissage.
${photoTypeSection}
🎯 STYLE PRO SIMPLIFIÉ :
✅ Langage ACCESSIBLE et encourageant
✅ Maximum 4-5 conseils ESSENTIELS (pas plus)
✅ FOCUS sur les points qui ont le plus d'impact
✅ Explique POURQUOI (pédagogie)
✅ Ton POSITIF et constructif

📸 STRUCTURE OBLIGATOIRE (CONCISE) :
1. BRAVO pour... (1 point fort spécifique)
2. AMÉLIORE-ça (2-3 conseils max, les plus impactants)
3. CONSEIL CLÉ (1 conseil prioritaire)

✅ OBLIGATIONS SIMPLIFIÉES :
✅ Maximum 3 phrases par conseil
✅ PAS de jargon technique lourd
✅ PRIORISE ce qui améliore vraiment la photo
✅ TERMINE par une note encourageante

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`


    // 🚀 Enrichir le prompt avec exemples RAG
    let basePrompt = analysisPrompt
    if (similarAnalyses.length > 0) {
      basePrompt = enrichPromptWithExamples(analysisPrompt, similarAnalyses)
    }

    const fullPrompt = `
    ${basePrompt}
    
    CRITÈRES D'ÉVALUATION (sois précis et juste) :
    
    SECTION TECHNIQUE (/60 points) :
    - Composition : /15 points (cadrage créatif, équilibre visuel, dynamisme - RÉCOMPENSE l'originalité même si hors règle des tiers)
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
    - RÉCOMPENSE les compositions créatives et audacieuses (12-15 points si impact visuel fort)
    - Note avec GÉNÉROSITÉ : 10-15 pour composition = bon à excellent (pas seulement 12-15 pour parfait)
    - EXEMPLES notation composition : 8-9 = cadrage basique, 10-11 = bon équilibre, 12-13 = excellente composition, 14-15 = composition exceptionnelle/créative
    - ${tone === 'roast' ? 'Sois CRÉATIF et DRÔLE dans tes roasts' : 
         tone === 'learning' ? 'Sois PÉDAGOGIQUE et EXPLIQUE le POURQUOI' : 
         'Sois CONSTRUCTIF et PÉDAGOGIQUE'}
    - Commente ce que tu VOIS vraiment, pas des généralités
    
    ${tone === 'professional' ? 
      `Fournissez une analyse SIMPLIFIÉE en JSON (mode Pro allégé) avec cette structure exacte :

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
      "summary": "Bravo pour [point fort spécifique]. Améliore [2-3 conseils essentiels max]. CONSEIL CLÉ : [1 conseil prioritaire]. [Note encourageante finale]",
      "keyInsights": [
        "Point fort principal de cette photo",
        "Amélioration #1 la plus impactante", 
        "Amélioration #2 prioritaire",
        "Conseil pour la prochaine photo"
      ]
    }` :
      'Fournissez une analyse détaillée en JSON avec cette structure exacte :'}

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
      "retouchPotential": {
        "level": "high|medium|low",
        "score": [Score de 1 à 100 indiquant le potentiel d'amélioration par retouche],
        "reason": "Explication courte du potentiel de retouche"
      },
      "toolRecommendations": {
        "lightroom": [
          "Conseil 1 spécifique à cette photo",
          "Conseil 2 adapté aux défauts visibles", 
          "Conseil 3 pour améliorer cette image",
          "Conseil 4 ciblé sur les problèmes détectés"
        ],
        "snapseed": [
          "Action 1 adaptée à cette photo",
          "Action 2 pour corriger les défauts visibles",
          "Action 3 spécifique à cette image", 
          "Action 4 ciblée sur les améliorations possibles"
        ]
      },
      "nextShotTips": [
        {
          "tip": "Conseil spécifique basé sur les défauts de cette photo",
          "category": "technique",
          "difficulty": "débutant"
        },
        {
          "tip": "Conseil adapté pour améliorer la prochaine prise de vue",
          "category": "composition", 
          "difficulty": "intermédiaire"
        },
        {
          "tip": "Technique précise pour éviter le problème observé",
          "category": "éclairage",
          "difficulty": "avancé"
        }
      ],
      "editingRecommendations": [
        {
          "suggestion": "Retouche spécifique pour corriger le défaut principal observé",
          "tool": "Lightroom",
          "difficulty": "facile", 
          "expectedImprovement": "Amélioration visuelle concrète pour cette photo"
        },
        {
          "suggestion": "Correction ciblée sur le deuxième point faible détecté", 
          "tool": "Photoshop",
          "difficulty": "moyen",
          "expectedImprovement": "Résultat attendu spécifique à cette image"
        },
        {
          "suggestion": "Retouche créative adaptée aux caractéristiques de cette photo",
          "tool": "Snapseed", 
          "difficulty": "difficile",
          "expectedImprovement": "Impact visuel prévu sur cette image particulière"
        }
      ]
    }
    
    📸 SECTION "nextShotTips" : Conseils pour améliorer la PROCHAINE PRISE de vue
    🎨 SECTION "editingRecommendations" : Suggestions pour retoucher CETTE PHOTO ACTUELLE

    ⚡ OBLIGATIONS POUR "retouchPotential" :
    • ANALYSE le potentiel d'amélioration réel de cette photo par retouche
    • HIGH (score 0-60) : Photo avec défauts marqués, forte marge d'amélioration
    • MEDIUM (score 61-84) : Photo correcte avec améliorations possibles  
    • LOW (score 85-100) : Photo déjà excellente, risque de sur-traitement
    • SOIS HONNÊTE : si la photo est déjà parfaite, dis-le !

    🔍 ANALYSE VISUELLE OBLIGATOIRE AVANT CONSEILS :
    • REGARDE attentivement cette photo spécifique
    • IDENTIFIE ses problèmes réels (sous-exposition ? sur-exposition ? manque de contraste ? couleurs ternes ?)
    • ADAPTE tes conseils aux défauts VISIBLES sur cette image
    • VARIE complètement tes recommandations selon chaque photo

    ⚡ OBLIGATIONS POUR "toolRecommendations" SPÉCIFIQUES :
    • JAMAIS les mêmes conseils pour 2 photos différentes
    • ADAPTE l'intensité selon le potentiel ET les problèmes détectés :
      - Photo sombre → Exposition/Ombres positifs
      - Photo claire → Hautes lumières négatives  
      - Photo terne → Vibrance/Saturation positives
      - Photo nette → Pas de netteté, focus sur couleurs/expo
    • UTILISE des paramètres variés : Exposition, Ombres, Hautes lumières, Contraste, Clarté, Vibrance, Saturation, Balance des blancs, etc.
    • JAMAIS de conseils qui risquent de dégrader (sur-exposition, sur-saturation)
    • SOIS CRÉATIF et spécifique à chaque image

    📝 EXEMPLES CONCRETS DE RECOMMANDATIONS VARIÉES (adapte selon CETTE photo) :

    🌅 Pour photo sombre/sous-exposée :
    - "Exposition : +0.8"
    - "Ombres : +40" 
    - "Noirs : +15"
    - "Vibrance : +20"

    ☀️ Pour photo sur-exposée :
    - "Hautes lumières : -60"
    - "Exposition : -0.4"
    - "Blancs : -25"
    - "Contraste : +15"

    🎨 Pour photo terne/plate :
    - "Vibrance : +30"
    - "Saturation : +8"
    - "Contraste : +20"
    - "Clarté : +10"

    🖼️ Pour photo déjà bien exposée :
    - "Balance des blancs : -200K"
    - "Teinte : +5"
    - "Correction colorimétrique HSL"
    - "Masquage de netteté : +25"

    ANALYSE CETTE PHOTO et choisis les 4 paramètres les plus pertinents selon SES défauts spécifiques.
    `

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
                url: `data:image/jpeg;base64,${imageData}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.9
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
    
    // Calculer le score total côté serveur selon le mode
    const partialScores = rawAnalysis.partialScores
    
    // Scores techniques et artistiques (sur leurs bases respectives)
    const technicalScore = partialScores.composition + partialScores.lighting + partialScores.focus + partialScores.exposure // /60
    const artisticScore = partialScores.creativity + partialScores.emotion + partialScores.storytelling // /40
    
    // Pondération selon le mode d'analyse - calcul correct sur base 100
    let calculatedScore: number
    if (tone === 'learning') {
      // Art Critic: 40% technique (60 pts), 60% artistique (40 pts)
      // Formule: (tech/60 * 40) + (art/40 * 60) = score sur 100
      calculatedScore = Math.round((technicalScore / 60 * 40) + (artisticScore / 40 * 60))
    } else {
      // Professional & Roast: 60% technique (60 pts), 40% artistique (40 pts)
      // Formule: (tech/60 * 60) + (art/40 * 40) = score sur 100
      calculatedScore = Math.round((technicalScore / 60 * 60) + (artisticScore / 40 * 40))
    }
    
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

    // Debug EXIF dans la réponse
    logger.debug('📊 Analysis object EXIF status:', {
      hasExifData: analysis.hasExifData,
      exifDataKeys: analysis.exifData ? Object.keys(analysis.exifData) : [],
      camera: analysis.exifData?.camera
    })

    // Enregistrer le succès pour circuit breaker
    recordSuccess()

    // 🚀 RAG: Stocker cette analyse pour futures recherches (async, non-blocking)
    if (imageEmbedding && photoId && analysis.score >= 70) {
      // Stocker uniquement les bonnes analyses (score >= 70)
      storeAnalysis(photoId, imageEmbedding, analysis, photoType)
        .catch(err => logger.error('Failed to store analysis in RAG:', err))
    }

    // Cleanup memory
    imageData = ''

    return analysis

  } catch (error) {
    // Gestion détaillée des erreurs OpenAI avec retry logic
    if (error instanceof Error) {
      // Erreurs OpenAI spécifiques
      if (error.message.includes('rate_limit_exceeded')) {
        logger.error('OpenAI rate limit exceeded', { 
          userId,
          error: error.message,
          endpoint: 'analyzePhoto'
        })
        throw new Error('Limite de requêtes OpenAI atteinte. Veuillez réessayer dans quelques minutes.')
      }
      
      if (error.message.includes('insufficient_quota')) {
        logger.error('OpenAI quota exceeded', { 
          userId,
          error: error.message 
        })
        throw new Error('Quota OpenAI épuisé. Service temporairement indisponible.')
      }
      
      if (error.message.includes('invalid_api_key')) {
        logger.error('OpenAI API key invalid', { 
          userId,
          error: error.message 
        })
        throw new Error('Erreur de configuration du service IA.')
      }
      
      // Erreurs de timeout/network
      if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
        logger.error('OpenAI timeout/network error', { 
          userId,
          error: error.message 
        })
        throw new Error('Timeout de l\'analyse IA. Veuillez réessayer.')
      }
      
      // Erreur de parsing JSON
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        logger.error('OpenAI response parsing error', { 
          userId,
          error: error.message 
        })
        throw new Error('Réponse IA mal formatée. Veuillez réessayer.')
      }
    }
    
    // Erreur générique avec log complet et enregistrement échec
    recordFailure()
    
    logger.error('OpenAI analysis failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      tone,
      language,
      photoType,
      failureCount: failureCount
    })
    
    throw new Error('Impossible d\'analyser la photo. Veuillez réessayer.')
  } finally {
    // Cleanup obligatoire en cas d'erreur aussi
    imageData = ''
    
    // Force garbage collection si disponible
    if (global.gc) {
      global.gc()
    }
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