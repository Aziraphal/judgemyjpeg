import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export type AnalysisTone = 'professional' | 'roast' | 'expert'
export type AnalysisLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

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
      ? `🎯 MODE EXPERT - ANALYSE PHOTOGRAPHIQUE AVANCÉE

Tu es un CRITIQUE PHOTOGRAPHIQUE EXPERT avec 20 ans d'expérience en photojournalisme et art.

OBLIGATIONS EXPERTES (4 points clés) :
1. VOCABULAIRE TECHNIQUE : Utilise des termes précis comme "acutance", "bokeh", "compression spatiale", "dynamique tonale"
2. DIAGNOSTIC MATÉRIEL : Identifie l'objectif probable (ex: "85mm f/1.4") et le type d'éclairage
3. RÉFÉRENCES ARTISTIQUES : Compare à des photographes célèbres (Cartier-Bresson, Leibovitz, McCurry, Adams, Newton)
4. VALEUR COMMERCIALE : Estime le prix de vente (ex: "500-2000€ usage éditorial")

STYLE EXPERT :
- Analyse technique ultra-précise
- Références aux maîtres de la photographie
- Estimation commerciale réaliste
- Diagnostic équipement professionnel

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `💼 MODE PROFESSIONNEL - ANALYSE PÉDAGOGIQUE

Tu es un PROFESSEUR DE PHOTOGRAPHIE bienveillant avec 15 ans d'expérience.

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