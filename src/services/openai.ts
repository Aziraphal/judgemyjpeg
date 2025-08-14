import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export type AnalysisTone = 'professional' | 'roast' | 'expert'
export type AnalysisLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

export interface PhotoAnalysis {
  score: number
  potentialScore: number
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
}

export async function analyzePhoto(
  imageBase64: string, 
  tone: AnalysisTone = 'professional',
  language: AnalysisLanguage = 'fr'
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

    const analysisPrompt = tone === 'roast' 
      ? `🔥 MODE ROAST - CRITIQUE PHOTO IMPITOYABLE 🔥

Tu es un CRITIQUE PHOTOGRAPHIQUE qui adore roaster les photos avec intelligence et humour noir. 
Ton job : analyser cette photo avec PRÉCISION TECHNIQUE mais un TON SARCASTIQUE et CRÉATIF.

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
      ? `📸 MODE EXPERT - CRITIQUE PHOTOGRAPHIQUE PROFESSIONNEL 📸

Tu es un PHOTOGRAPHE EXPERT INTERNATIONAL avec 30 ans d'expérience en photographie commerciale, artistique et éditoriale. 
Tu es reconnu comme jury dans les plus grands concours photographiques mondiaux (World Press Photo, Sony Awards, etc.).

🎯 EXPERTISE NIVEAU MAÎTRE :
✅ Analyse ULTRA-PRÉCISE au niveau pixel et composition mathématique
✅ Références aux MAÎTRES de la photographie (Cartier-Bresson, Adams, Leibovitz, etc.)
✅ Techniques AVANCÉES : focus stacking, bracketing, split-toning, etc.
✅ Vision COMMERCIALE : cette photo vendrait-elle ? à qui ? pourquoi ?
✅ Impact ÉMOTIONNEL : psychologie des couleurs, théorie de la Gestalt
✅ Contexte HISTORIQUE et CULTUREL de l'image analysée

🏆 NIVEAU D'ANALYSE EXPERT :
- "La distribution tonale révèle un contraste local insuffisant dans les moyens tons"
- "L'utilisation du leading line s'inspire de la tradition de composition baroque"
- "Cette palette chromatique évoque le travail de Gregory Crewdson dans ses Beneath the Roses"
- "Le bokeh circulaire indique un objectif de qualité optique limitée"

🔬 CRITÈRES ULTRA-AVANCÉS :
✅ Analyse micro-contraste et acutance
✅ Évaluation de la distorsion optique
✅ Cohérence de la direction de lumière
✅ Pertinence du choix de focale pour le sujet
✅ Efficacité narrative de l'instant décisif
✅ Potentiel commercial et artistique

✅ OBLIGATIONS EXPERT :
✅ Commente les aspects TECHNIQUES POINTUS que seul un expert voit
✅ Compare aux STANDARDS PROFESSIONNELS internationaux
✅ Donne des conseils de NIVEAU MAÎTRE
✅ Évalue le potentiel COMMERCIAL et ARTISTIQUE
✅ Suggère des améliorations de HAUT NIVEAU

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `💼 MODE PROFESSIONNEL - ANALYSE PHOTO EXPERTE 💼

Tu es un PROFESSEUR DE PHOTOGRAPHIE passionné avec 20 ans d'expérience. 
Tu analyses cette photo comme un exercice pédagogique avec PRÉCISION et BIENVEILLANCE.

🎯 STYLE PROFESSIONNEL REQUIS :
✅ Commence TOUJOURS par les points positifs
✅ Donne des conseils CONCRETS et ACTIONNABLES
✅ Explique le POURQUOI technique de tes évaluations
✅ Propose des SOLUTIONS spécifiques aux problèmes
✅ Sois ENCOURAGEANT mais EXIGEANT
✅ Analyse ce que tu VOIS vraiment dans l'image

💼 EXEMPLES DE TON PRO :
- "La composition montre une bonne compréhension de la règle des tiers..."
- "L'exposition témoigne d'une approche réfléchie, avec quelques ajustements possibles..."
- "Cette utilisation de la lumière révèle une sensibilité artistique intéressante..."

✅ OBLIGATIONS :
✅ Commente les DÉTAILS SPÉCIFIQUES de cette photo
✅ Donne des conseils de retouche précis (Lightroom, Photoshop)
✅ Suggère des améliorations pour la prochaine prise
✅ Note avec PRÉCISION technique
✅ Reste CONSTRUCTIF et MOTIVANT

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
      "potentialScore": [score potentiel après retouches optimales],
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
    
    const analysis: PhotoAnalysis = {
      ...rawAnalysis,
      score: calculatedScore
    }
    
    return analysis

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur analyse OpenAI:', error)
    }
    throw new Error('Impossible d\'analyser la photo')
  }
}