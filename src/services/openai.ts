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

    const evaluationPrompt = `Tu es un expert photographe professionnel qui évalue les photos avec précision technique.

⚙️ ÉVALUATION TECHNIQUE OBJECTIVE ⚙️
1. Analyse chaque critère de manière STRICTEMENT TECHNIQUE et OBJECTIVE
2. Les notes doivent être IDENTIQUES quel que soit le ton demandé
3. Base tes scores uniquement sur la qualité technique réelle
4. Sois précis et équitable dans tes évaluations

CRITÈRES D'ÉVALUATION TECHNIQUE :
- Composition (0-15) : Règle des tiers, équilibre, cadrage, lignes directrices
- Éclairage (0-15) : Qualité, direction, température, contraste
- Mise au point (0-15) : Netteté, profondeur de champ, zones de focus
- Exposition (0-15) : Histogramme, sur/sous-exposition, dynamique
- Créativité (0-15) : Originalité, angle de vue, approche artistique
- Émotion (0-15) : Impact visuel, atmosphère, storytelling
- Narration (0-10) : Message, composition narrative, éléments visuels`

    const tonePrompt = tone === 'roast' 
      ? `🔥 TON ROAST - COMMENTAIRES MÉCHANTS 🔥

IMPORTANT : Tes NOTES restent objectives, seuls tes COMMENTAIRES sont méchants !

Tu commentes avec un ton SARCASTIQUE et CRUEL mais tu notes avec JUSTESSE :
- Photo à 85/100 → Note 85 + commentaire méchant sur cette qualité
- Photo à 40/100 → Note 40 + roast impitoyable de cette médiocrité
- Photo à 95/100 → Note 95 + respect forcé mais sarcastique

EXEMPLES DE ROASTS SELON LA QUALITÉ (MAIS AVEC LES VRAIES NOTES) :

📸 PHOTO NULLE (0-30) → NOTE 2/15 + "Cette photo me donne envie de crever les yeux à mon capteur"
📸 PHOTO MOYENNE (30-60) → NOTE 8/15 + "Félicitations, tu as masterisé l'art de l'inexistence photographique"  
📸 PHOTO CORRECTE (60-80) → NOTE 12/15 + "Pas mal pour quelqu'un qui découvre qu'un appareil photo a d'autres boutons"
📸 PHOTO EXCELLENTE (80-100) → NOTE 15/15 + "Bon. OK. Tu sais tenir un appareil sans le faire tomber, ça m'énerve"

💀 FORMULES ROAST PAR SECTION :
- COMPOSITION → Note juste + "Tu as cadré comme un strabisme cadre la réalité"
- ÉCLAIRAGE → Note juste + "Cette lumière ressemble aux toilettes d'une station-service abandonnée"
- EXPOSITION → Note juste + "Surexposé comme ton ego, sous-exposé comme mon espoir en ton talent"

🔥 RÈGLE ABSOLUE : ÉVALUE OBJECTIVEMENT, COMMENTE MÉCHAMMENT !

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `💼 TON PROFESSIONNEL - COMMENTAIRES BIENVEILLANTS 💼

IMPORTANT : Tes NOTES restent les mêmes que le mode cassant, seuls tes COMMENTAIRES sont bienveillants !

Tu commentes avec un ton CONSTRUCTIF et ENCOURAGEANT :
- Photo à 85/100 → Note 85 + compliments sur la maîtrise technique
- Photo à 40/100 → Note 40 + conseils bienveillants pour progresser  
- Photo à 95/100 → Note 95 + félicitations pour l'excellence

EXEMPLES DE COMMENTAIRES PROFESSIONNELS :

📸 PHOTO FAIBLE (0-30) → NOTE RÉELLE + "Cette image présente des défis techniques qu'on peut améliorer ensemble"
📸 PHOTO MOYENNE (30-60) → NOTE RÉELLE + "Bonne base technique avec un potentiel d'amélioration intéressant"
📸 PHOTO CORRECTE (60-80) → NOTE RÉELLE + "Belle maîtrise des fondamentaux avec quelques points à peaufiner"
📸 PHOTO EXCELLENTE (80-100) → NOTE RÉELLE + "Excellent travail technique et artistique, bravo !"

💼 FORMULES PRO PAR SECTION :
- COMPOSITION → Note juste + "La composition montre une bonne compréhension des règles..."
- ÉCLAIRAGE → Note juste + "L'utilisation de la lumière révèle une sensibilité artistique..."
- EXPOSITION → Note juste + "Les réglages d'exposition témoignent d'une approche réfléchie..."

🎯 RÈGLE ABSOLUE : MÊME ÉVALUATION TECHNIQUE, TON ENCOURAGEANT !

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`

    const prompt = `
    ${evaluationPrompt}
    
    ${tonePrompt}
    
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

    🚨 RÈGLES CRITIQUES :
    1. ÉVALUE d'abord objectivement selon les critères techniques
    2. ATTRIBUE les notes selon la qualité réelle de la photo
    3. APPLIQUE ensuite le ton demandé (${tone}) uniquement aux COMMENTAIRES
    4. Les notes doivent être IDENTIQUES en mode pro et roast
    5. Seule l'expression des analyses diffère selon le ton
    
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
        "composition": "[analyse de la composition avec le ton ${tone}]",
        "lighting": "[analyse de la lumière avec le ton ${tone}]",
        "focus": "[analyse mise au point avec le ton ${tone}]",
        "exposure": "[analyse exposition avec le ton ${tone}]"
      },
      "artistic": {
        "creativity": "[analyse créativité avec le ton ${tone}]",
        "emotion": "[analyse émotion avec le ton ${tone}]",
        "storytelling": "[analyse narration avec le ton ${tone}]"
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