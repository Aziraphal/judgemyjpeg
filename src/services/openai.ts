import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export type AnalysisTone = 'professional' | 'roast'
export type AnalysisLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

export interface PhotoAnalysis {
  score: number
  potentialScore: number
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

    const basePrompt = tone === 'roast' 
      ? `PROMPT MODE CASSANT :
Tu es un critique photographique sarcastique mais brillant. Analyse cette photo avec un ton caustique, des blagues bien placées et des références pop culture, MAIS reste toujours techniquement précis et constructif. Ta mission : faire rire tout en étant juste.

STRUCTURE OBLIGATOIRE :
- Score global sur 100
- Première impression (une punchline)
- Composition (moqueries + analyse vraie)
- Lumière (sarcasmes + reconnaissance des qualités)
- Technique (blagues + évaluation juste)  
- Créativité (taquineries + respect si mérité)
- Verdict brutal (conclusion cash mais équitable)

RÈGLES :
✅ Humour caustique sans méchanceté gratuite
✅ Reconnaissance des vraies qualités quand elles existent
✅ Conseils déguisés en piques
✅ Références culturelles/memes
❌ Attaques personnelles
❌ Découragement pur
❌ Fausses critiques pour faire du buzz

EXEMPLES DE TON :
- "Félicitations, vous avez découvert le bouton déclencheur"
- "Cette composition est plus centrée qu'un débat politique, mais ça marche"
- "On va dire génie par charité"
- "Votre maman serait fière"

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}. All text, comments, and technical terms must be in ${currentLang.name}.`
      : `PROMPT MODE PRO :
Tu es un mentor photographique expérimenté et bienveillant. Analyse cette photo avec expertise technique et pédagogie, en encourageant la progression tout en maintenant des standards élevés.

STRUCTURE OBLIGATOIRE :
- Score global sur 100 (identique au mode cassant)
- Forces principales (ce qui fonctionne bien)
- Analyse technique détaillée (composition, lumière, netteté, exposition)
- Impact artistique (émotion, créativité, narration)
- Axes d'amélioration (conseils constructifs et précis)
- Potentiel d'optimisation (score atteignable avec retouches)

RÈGLES :
✅ Ton professionnel mais chaleureux
✅ Explications pédagogiques détaillées  
✅ Reconnaissance systématique des réussites
✅ Conseils techniques précis et actionnables
✅ Encouragement à la progression
✅ Contexte et comparaisons instructives
❌ Complaisance excessive
❌ Jargon incompréhensible
❌ Critiques sans solutions

EXEMPLES DE TON :
- "Votre maîtrise de [technique] révèle une progression remarquable"
- "Cette approche illustre parfaitement le principe de..."
- "Pour optimiser cette réussite, considérez..."
- "Cette image possède le potentiel pour atteindre..."

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}. All text, comments, and technical terms must be in ${currentLang.name}.`

    const prompt = `
    ${basePrompt}
    
    CRITÈRES D'ÉVALUATION (correspondance directe avec l'interface) :
    
    SECTION TECHNIQUE (/60 points) :
    - Composition : /15 points
    - Lumière : /15 points  
    - Mise au point : /15 points
    - Exposition : /15 points
    
    SECTION ARTISTIQUE (/40 points) :
    - Créativité : /15 points
    - Émotion : /15 points
    - Narration : /10 points
    
    TOTAL : /100

    🚨 RÈGLES DE NOTATION STRICTES :
    - CALCULEZ précisément chaque critère
    - Le score final = EXACTEMENT la somme des 7 notes partielles
    - Exemple : 12+15+14+14+10+10+5 = 80 → score final = 80
    - INTERDIT de donner un score différent de cette addition
    
    Fournissez une analyse détaillée en JSON avec cette structure exacte :

    {
      "score": [somme exacte des 7 notes ci-dessous],
      "potentialScore": [score potentiel après retouches optimales],
      "technical": {
        "composition": "[NOTE/15] [analyse de la composition]",
        "lighting": "[NOTE/15] [analyse de la lumière]",
        "focus": "[NOTE/15] [analyse mise au point]",
        "exposure": "[NOTE/15] [analyse exposition]"
      },
      "artistic": {
        "creativity": "[NOTE/15] [analyse créativité]",
        "emotion": "[NOTE/15] [analyse émotion]",
        "storytelling": "[NOTE/10] [analyse narration]"
      },
      "suggestions": [
        "suggestion concrète 1",
        "suggestion concrète 2",
        "suggestion concrète 3"
      ],
      "improvements": [
        {
          "impact": "Corriger l'exposition",
          "description": "Éclaircir les ombres de +2 stops",
          "difficulty": "facile",
          "scoreGain": 8
        }
      ],
      "toolRecommendations": {
        "lightroom": ["ajustement lumière"],
        "photoshop": ["retouche"],
        "snapseed": ["contraste"]
      }
    }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
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

    const analysis: PhotoAnalysis = JSON.parse(jsonMatch[0])
    
    return analysis

  } catch (error) {
    console.error('Erreur analyse OpenAI:', error)
    throw new Error('Impossible d\'analyser la photo')
  }
}