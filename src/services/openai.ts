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

2. VOCABULAIRE TECHNIQUE OBLIGATOIRE (MINIMUM 5 TERMES PAR ANALYSE) :
Utilise : "acutance", "falloff", "compression spatiale", "dynamique tonale", "zone système", "clipping", "gamut", "bracketing", "DRL", "ISO invariance", "micro-contraste", "modélisation lumière", "rendu tonal", "saturation sélective", "stops", "latitude d'exposition", "courbe gamma", "LUT", "color grading", "MTF", "bruit chromatique", "ratio éclairage", "capteur APS-C/FF"

3. RÉFÉRENCES MAÎTRES IMPOSÉES :
Compare OBLIGATOIREMENT à : Cartier-Bresson (géométrie), Adams (zones), Leibovitz (éclairage), McCurry (couleur), Newton (contraste), Gursky (composition), Sherman (mise en scène), Crewdson (palette), Mapplethorpe (forme), Vivian Maier (street), Joel Meyerowitz (lumière)

4. ESTIMATION COMMERCIALE FROIDE OBLIGATOIRE :
- "Potentiel commercial: X/10" (TOUJOURS inclure)
- Prix agence photo précis (50-5000€)
- Usage possible (éditorial/pub/art/stock)
- Défauts bloquants pour publication
- Analyse du bokeh et des optiques utilisées

📸 EXEMPLES FORMULATIONS EXPERT OBLIGATOIRES (UTILISE CE STYLE) :
- "Distribution tonale révèle contraste local insuffisant (-2 stops dans les moyens tons)"
- "Cette palette évoque Crewdson avec un gamma élevé"
- "Le bokeh circulaire indique une optique limitée à f/2.8"
- "Potentiel commercial: 7/10 - clipping dans les hautes lumières"
- "Compression spatiale d'un 85mm à f/1.4, falloff naturel"
- "Zone système VII-VIII, latitude d'exposition exploitée à 80%"
- "MTF détérioration visible à f/1.4, optique Canon L probable"
- "Bruit chromatique ISO 1600, sensor APS-C Sony"
- "Modélisation lumière directionnelle, ratio 1:3"

5. TON PROFESSIONNEL EXIGÉ :
- Critique direct et factuel
- Langage de critique d'art photographique
- Aucun ménagement ni encouragement
- Analyse comme pour sélection d'exposition

⚠️ CONTRAINTES ABSOLUES MODE EXPERT :
- UTILISE 5+ termes techniques spécialisés MINIMUM par analyse
- MENTIONNE compression spatiale, zone système, ou équivalent technique
- DONNE estimation commerciale précise avec défauts techniques
- COMPARE à UN maître photographe minimum
- ANALYSE matériel/optique utilisé avec précision
- LANGAGE critique d'art photographique EXCLUSIVEMENT

CETTE PHOTO EST-ELLE PUBLIABLE ? JUSTIFIE CHAQUE POINT SANS MÉNAGEMENT.
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
      "retouchPotential": {
        "level": "high|medium|low",
        "score": [Score de 1 à 100 indiquant le potentiel d'amélioration par retouche],
        "reason": "Explication courte du potentiel de retouche"
      },
      "toolRecommendations": {
        "lightroom": [
          "Ombres : +30",
          "Contraste : +15", 
          "Clarté : +10",
          "Ajouter un filtre dégradé sur le ciel (exposition -0.5)"
        ],
        "snapseed": [
          "Détails → Netteté : +20",
          "HDR → Intensité : +15", 
          "Recadrage → Règle des tiers pour centrer le sujet",
          "Saturation → +10 pour renforcer les couleurs"
        ]
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

    ⚡ OBLIGATIONS POUR "retouchPotential" :
    • ANALYSE le potentiel d'amélioration réel de cette photo par retouche
    • HIGH (score 70-100) : Photo avec défauts marqués, forte marge d'amélioration
    • MEDIUM (score 30-70) : Photo correcte avec améliorations possibles
    • LOW (score 0-30) : Photo déjà excellente, risque de sur-traitement
    • SOIS HONNÊTE : si la photo est déjà parfaite, dis-le !

    ⚡ OBLIGATIONS POUR "toolRecommendations" SÉCURISÉS :
    • ADAPTE l'intensité des conseils selon le potentiel de retouche :
      - Potentiel HIGH : valeurs marquées (+20 à +50)
      - Potentiel MEDIUM : valeurs modérées (+10 à +30) 
      - Potentiel LOW : valeurs subtiles (+2 à +15)
    • Lightroom : VALEURS PRÉCISES adaptées au potentiel ("Ombres : +5" si photo déjà bonne)
    • Snapseed : ACTIONS PRÉCISES adaptées ("Détails → Netteté : +8" si déjà nette)
    • JAMAIS de conseils qui risquent de dégrader (sur-exposition, sur-saturation)
    • Utilise des réglages réalistes et SÉCURISÉS
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