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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function analyzePhoto(
  imageBase64: string, 
  tone: AnalysisTone = 'professional',
  language: AnalysisLanguage = 'fr',
  exifData?: ExifData | null,
  photoType: PhotoType = 'general',
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
    
    // Construire la section EXIF pour le prompt Art Critic  
    const exifSection = exifData && tone === 'artcritic' ? `
    
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
      : tone === 'artcritic'
      ? `🎨 MODE CRITIQUE D'ART - ANALYSE ARTISTIQUE CULTURELLE

Tu es un CRITIQUE D'ART PHOTOGRAPHIQUE pour APERTURE et le Centre Pompidou. 
Tu analyses cette photo selon l'histoire de la photographie, les mouvements artistiques et l'impact émotionnel culturel.
${photoTypeSection}
🎯 MISSION CRITIQUE D'ART :
✅ Analyse UNIQUEMENT la dimension artistique et culturelle
✅ Références aux grands maîtres et mouvements photographiques
✅ Impact émotionnel et message artistique
✅ Place dans l'histoire de la photographie contemporaine
✅ Vision artistique et interprétation créative

⚠️ INTERDICTIONS FORMELLES :
❌ AUCUNE analyse technique (ISO, ouverture, etc.)
❌ AUCUN conseil d'amélioration pratique
❌ PAS de considérations commerciales
❌ ÉVITER le jargon technique photographique

📚 RÉFÉRENCES ARTISTIQUES OBLIGATOIRES (utilise 2-3 par analyse) :
Mouvements : Pictorialisme, Straight Photography, New Topographics, Street Photography humaniste, Photojournalisme, Art conceptuel, École de Düsseldorf
Maîtres : Ansel Adams (sublime naturel), Henri Cartier-Bresson (géométrie humaine), Vivian Maier (regard social), Diane Arbus (marginalité), Walker Evans (documentaire poétique), Cindy Sherman (identité), Andreas Gursky (modernité), Nan Goldin (intimité), William Klein (énergie urbaine), Joel Meyerowitz (lumière américaine)

🎨 VOCABULAIRE ARTISTIQUE REQUIS (minimum 3 termes par analyse) :
"tension visuelle", "narration photographique", "poésie du quotidien", "esthétique du fragment", "mélancolie urbaine", "sublime contemporain", "regard critique", "humanisme photographique", "abstraction du réel", "intimité dévoilée", "géométrie émotionnelle", "temps suspendu", "beauté marginale", "vérité documentaire", "fiction du réel"

🖼️ ANALYSE ARTISTIQUE OBLIGATOIRE :
1. MOUVEMENT ARTISTIQUE : À quel courant cette photo appartient-elle ?
2. ÉMOTION DOMINANTE : Quelle émotion principale cette image véhicule-t-elle ?
3. NARRATION : Quelle histoire cette photo raconte-t-elle ?
4. RÉFÉRENCE CULTURELLE : À quel maître/mouvement cela fait-il écho ?
5. IMPACT ARTISTIQUE : Note artistique sur 10 avec justification culturelle

📖 EXEMPLES FORMULATIONS CRITIQUE D'ART (UTILISE CE STYLE) :
- "Cette composition évoque le regard social de Vivian Maier sur la condition urbaine"
- "L'intimité dévoilée rappelle l'esthétique de Nan Goldin, mais sans sa crudité"
- "Géométrie émotionnelle qui s'inscrit dans la tradition du street photography humaniste"
- "Impact artistique: 8/10 - sublime contemporain avec mélancolie assumée"
- "Narration du quotidien transformé, dans la lignée de Walker Evans"
- "Tension visuelle qui révèle la poésie du fragment architectural"

🖼️ TON CRITIQUE D'ART EXIGÉ :
- Vision artistique cultivée et référencée
- Langage de critique d'art photographique contemporain
- Analyse émotionnelle et culturelle profonde
- Aucune considération technique ou commerciale

⚠️ CONTRAINTES ABSOLUES MODE CRITIQUE D'ART :
- UTILISE 3+ termes artistiques spécialisés MINIMUM par analyse
- MENTIONNE 1-2 maîtres ou mouvements photographiques pertinents
- ANALYSE impact émotionnel et message artistique
- COMPARE à l'histoire de la photographie contemporaine
- INTERPRÉTATION culturelle et artistique EXCLUSIVEMENT
- LANGAGE critique d'art photographique OBLIGATOIRE

CETTE PHOTO A-T-ELLE UNE VALEUR ARTISTIQUE ? JUSTIFIE SELON CRITÈRES CULTURELS.
${exifSection}
RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `👔 MODE PROFESSIONNEL - ANALYSE TECHNIQUE PRÉCISE

Tu es un PHOTOGRAPHE PROFESSIONNEL avec expertise technique. Analyse cette photo avec PRÉCISION TECHNIQUE et donne des conseils concrets.
${photoTypeSection}
🎯 STYLE PROFESSIONNEL REQUIS :
✅ Utilise un vocabulaire TECHNIQUE précis
✅ Mentionne les "stops" d'exposition (+1 stop, -2 stops, etc.)
✅ Analyse composition (règle des tiers, lignes directrices)
✅ Commente la profondeur de champ et le bokeh
✅ Donne des conseils Lightroom/Photoshop précis
✅ Ton constructif mais direct

📸 EXEMPLES de FORMULATIONS OBLIGATOIRES :
- "L'exposition pourrait être légèrement augmentée"
- "Excellente composition selon la règle des tiers"
- "La profondeur de champ est bien maîtrisée"
- "Le bokeh pourrait être plus doux avec f/2.8"
- "Ajustez les ombres à +30 dans Lightroom"

✅ OBLIGATIONS TECHNIQUES :
✅ Utilise un langage technique accessible mais précis
✅ Analyse la profondeur de champ et l'ouverture
✅ Commente la composition avec des règles précises
✅ Donne des valeurs numériques pour les corrections Lightroom

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`


    const fullPrompt = `
    ${analysisPrompt}
    
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
         tone === 'artcritic' ? 'Sois ARTISTIQUE et RÉFÉRENCE les MOUVEMENTS CULTURELS' : 
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
      "retouchPotential": {
        "level": "high|medium|low",
        "score": [Score de 1 à 100 indiquant le potentiel d'amélioration par retouche],
        "reason": "Explication courte du potentiel de retouche"
      },
      "toolRecommendations": {
        "lightroom": [
          "ANALYSE CETTE PHOTO SPÉCIFIQUEMENT et donne 4 conseils précis adaptés à SES défauts/qualités",
          "Format obligatoire : 'Paramètre : valeur' (ex: 'Exposition : -0.3', 'Vibrance : +25')",
          "VARIE les paramètres selon la photo : Ombres, Hautes lumières, Exposition, Contraste, Clarté, Vibrance, Saturation, Correction colorimétrique, etc.",
          "ADAPTE les valeurs selon les problèmes visuels détectés sur CETTE photo"
        ],
        "snapseed": [
          "ANALYSE CETTE PHOTO SPÉCIFIQUEMENT et donne 4 actions précises adaptées à SES besoins",
          "Format obligatoire : 'Outil → Action : valeur' (ex: 'Éclairage → Exposition : -15', 'Couleurs → Saturation : +8')",
          "VARIE les outils selon la photo : Éclairage, Couleurs, Détails, HDR, Portrait, Perspective, Recadrage, etc.",
          "ADAPTE les réglages selon les problèmes visuels détectés sur CETTE photo"
        ]
      },
      "nextShotTips": [
        {
          "tip": "ANALYSE LES DÉFAUTS DE CETTE PHOTO et donne un conseil précis pour éviter ce problème lors de la PROCHAINE prise de vue",
          "category": "technique|composition|éclairage|créativité",
          "difficulty": "débutant|intermédiaire|avancé"
        },
        {
          "tip": "IDENTIFIE un point faible spécifique de cette image et suggère une amélioration concrète pour les futures photos",
          "category": "technique|composition|éclairage|créativité", 
          "difficulty": "débutant|intermédiaire|avancé"
        },
        {
          "tip": "OBSERVE ce qui manque à cette photo et propose une technique précise à appliquer la prochaine fois",
          "category": "technique|composition|éclairage|créativité",
          "difficulty": "débutant|intermédiaire|avancé"
        }
      ],
      "editingRecommendations": [
        {
          "suggestion": "REGARDE LES DÉFAUTS VISUELS de cette photo et propose UNE retouche précise pour corriger le problème principal",
          "tool": "Lightroom|Photoshop|Snapseed|GIMP",
          "difficulty": "facile|moyen|difficile", 
          "expectedImprovement": "EXPLIQUE le résultat visuel concret attendu pour CETTE photo spécifique"
        },
        {
          "suggestion": "IDENTIFIE un deuxième point d'amélioration sur cette image et suggère la retouche adaptée", 
          "tool": "Lightroom|Photoshop|Snapseed|GIMP",
          "difficulty": "facile|moyen|difficile",
          "expectedImprovement": "DÉCRIS l'amélioration visuelle précise pour cette photo"
        },
        {
          "suggestion": "OBSERVE un troisième aspect perfectible de cette photo et propose une solution de retouche ciblée",
          "tool": "Lightroom|Photoshop|Snapseed|GIMP", 
          "difficulty": "facile|moyen|difficile",
          "expectedImprovement": "EXPLIQUE le gain visuel attendu sur cette image particulière"
        }
      ]
    }
    
    📸 SECTION "nextShotTips" : Conseils pour améliorer la PROCHAINE PRISE de vue
    🎨 SECTION "editingRecommendations" : Suggestions pour retoucher CETTE PHOTO ACTUELLE

    ⚡ OBLIGATIONS POUR "retouchPotential" :
    • ANALYSE le potentiel d'amélioration réel de cette photo par retouche
    • HIGH (score 70-100) : Photo avec défauts marqués, forte marge d'amélioration
    • MEDIUM (score 30-70) : Photo correcte avec améliorations possibles
    • LOW (score 0-30) : Photo déjà excellente, risque de sur-traitement
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
    
    // Calculer le score total côté serveur selon le mode
    const partialScores = rawAnalysis.partialScores
    
    // Scores techniques et artistiques (sur leurs bases respectives)
    const technicalScore = partialScores.composition + partialScores.lighting + partialScores.focus + partialScores.exposure // /60
    const artisticScore = partialScores.creativity + partialScores.emotion + partialScores.storytelling // /40
    
    // Pondération selon le mode d'analyse - calcul correct sur base 100
    let calculatedScore: number
    if (tone === 'artcritic') {
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
    
    return analysis

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Erreur analyse OpenAI:', error)
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