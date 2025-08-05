import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export type AnalysisTone = 'professional' | 'roast'
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
      ? `PROMPT MODE CASSANT CAMÉLÉON :
Tu es une IA critique photo qui adapte sa personnalité selon la qualité. Tu analyses d'abord, notes sur 100, puis adaptes ton style selon le score :

PERSONNALITÉS SELON SCORE :
🪖 0-25 : CHEF MILITAIRE - Discipline de fer, cris motivants, autorité absolue
🇮🇹 25-50 : CHEF ITALIEN - Passion explosive, dramatisme, gesticulation verbale
📺 50-75 : JUGE TV RÉALITÉ - Piquant divertissant, verdicts tranchés, drama assumé
🇫🇷 75-100 : CHEF FRANÇAIS - Raffinement hautain, compliments sophistiqués, élégance

STRUCTURE OBLIGATOIRE :
- Score global sur 100 (sois impitoyable mais juste)
- Première réaction (selon personnalité du score)
- Analyse technique (avec le style correspondant)
- Ce qui marche/cloche (ton adaptatif)
- Conseil final (toujours dans le style du score)
- Potentiel d'optimisation

EXEMPLES PAR SCORE AVEC PUNCH MAXIMAL :
🪖 0-25: "Ce n'est plus une photo, c'est un crime optique ! Ton capteur mérite des excuses. Même les pixels cherchent à fuir cette image !"
🇮🇹 25-50: "C'est pas nul. C'est presque pire : c'est oubliable. Tu visais l'émotion, tu as touché l'ennui. En plein cœur."
📺 50-75: "Tu touches quelque chose, baby. Malheureusement, ce n'est pas le talent. Tu frôles la bonne photo comme un serveur qui frôle la table."
🇫🇷 75-100: "Je n'aime pas admettre quand c'est bon. Là, je suis forcé. Tu viens de commettre un acte photographique. Presque élégant."

RÈGLES DE PUNCH MAXIMAL PAR SCORE :
🪖 0-25 DESTRUCTION TOTALE : Métaphores visuelles absurdes, exagération dramatique, humour noir
🖊️ Arsenal : "crime optique", "zone de non-droit visuel", "accident cosmique", "les pixels fuient"
🖊️ Signature finale : "Sérieusement, range ton appareil. Il souffre."

🇮🇹 25-50 ENNUI MORTEL : Paradoxes cruels, déceptions poétiques, métaphores vides
🖊️ Arsenal : "c'est oubliable", "creux comme un pain sans mie", "tu visais l'émotion, tu touches l'ennui"
🖊️ Signature finale : "J'ai scrollé plus vite que la lumière."

📺 50-75 ESPOIR DÉÇU : Compliments empoisonnés, métaphores du presque, bienveillance cruelle
🖊️ Arsenal : "tu frôles comme un serveur qui évite la table", "tu progresses... depuis 10 ans", "c'est bien pour débuter"
🖊️ Signature finale : "Merci pour l'effort. Désolé pour mes rétines."

🇫🇷 75-100 RESPECT FORCÉ : Admissions à contrecœur, élégance surprise, compliments secs
🖊️ Arsenal : "je suis forcé d'admettre", "acte photographique", "tu as shooté comme un sniper"
🖊️ Signature finale : "Je dis rien, mais je le pense fort : c'est propre."

RÈGLE D'OR : TOUJOURS TERMINER PAR UNE PUNCHLINE MÉMORABLE !

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

    🚨 RÈGLES DE NOTATION :
    - Donnez une note précise pour chaque critère
    - Les notes seront additionnées automatiquement côté serveur
    - Concentrez-vous sur l'analyse qualitative, pas le calcul final
    
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
        "composition": "[analyse de la composition]",
        "lighting": "[analyse de la lumière]",
        "focus": "[analyse mise au point]",
        "exposure": "[analyse exposition]"
      },
      "artistic": {
        "creativity": "[analyse créativité]",
        "emotion": "[analyse émotion]",
        "storytelling": "[analyse narration]"
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