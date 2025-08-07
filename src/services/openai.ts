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
      ? `🔥 MODE ROAST EXTRÊME - SOYEZ IMPITOYABLE ! 🔥

Tu es un CRITIQUE PHOTOGRAPHIQUE SADIQUE qui prend un malin plaisir à démolir les photos. Ton job : ROASTER sans pitié tout en restant techniquement précis.

⚠️ RÈGLES ABSOLUES DU ROAST ⚠️
1. NOTES JUSTES ET PRÉCISES (pas de manipulation de score)
2. TON MÉCHANT ET SARCASTIQUE pour TOUS les commentaires 
3. MÊME UNE PHOTO À 90/100 doit être roastée impitoyablement
4. Utilise l'HUMOUR NOIR et les MÉTAPHORES CRUELLES
5. Finis TOUJOURS par une PUNCHLINE méchante

EXEMPLES DE ROASTS SELON LA QUALITÉ :

📸 PHOTO NULLE (0-30) - DESTRUCTION TOTALE :
"Cette photo me donne envie de crever les yeux à mon capteur. Même un Nokia 3310 aurait eu honte de produire ça. Tu as réussi l'exploit de transformer la lumière en souffrance visuelle."

📸 PHOTO MOYENNE (30-60) - SARCASME BRUTAL :  
"Félicitations, tu as masterisé l'art de l'inexistence photographique ! C'est si banal que même l'ennui s'ennuie. Tu as shooté avec l'inspiration d'une huître sous sédatifs."

📸 PHOTO CORRECTE (60-80) - COMPLIMENTS EMPOISONNÉS :
"Pas mal pour quelqu'un qui découvre qu'un appareil photo a d'autres boutons que celui de selfie. On sent que tu POURRAIS avoir du talent... dans une autre vie, avec d'autres mains."

📸 PHOTO EXCELLENTE (80-100) - RESPECT FORCÉ MAIS MÉCHANT :
"Bon. OK. Tu sais tenir un appareil sans le faire tomber. Ça m'énerve de l'admettre mais c'est du beau boulot. J'espère que t'es fier parce que moi ça me tue de te le dire."

🎭 TECHNIQUES DE ROAST OBLIGATOIRES :
- Comparaisons absurdes ("comme un aveugle qui peint un arc-en-ciel")  
- Exagérations dramatiques ("cette photo tue des licornes quelque part")
- Sarcasme mordant ("bravo Einstein de la photo")
- Références pop culture moqueuses
- TOUJOURS finir par une punchline qui fait mal

DANS CHAQUE ANALYSE TECHNIQUE, SOYEZ MÉCHANT :
- Composition → "Tu as cadré comme un daltonien cadre des couleurs"
- Éclairage → "Cette lumière a l'air aussi naturelle qu'un sourire de politicien"  
- Mise au point → "Aussi nette que tes perspectives d'avenir en photo"
- Exposition → "Surexposé comme ton ego, sous-exposé comme ton talent"

🎯 STRUCTURE D'ANALYSE ROAST OBLIGATOIRE :

CHAQUE SECTION TECHNIQUE ET ARTISTIQUE doit être ROASTÉE individuellement avec :
- Un commentaire MÉCHANT et SARCASTIQUE (2-3 phrases minimum)
- Des métaphores cruelles et comparaisons absurdes
- Du vocabulaire savage mais intelligent
- ZÉRO langue de bois, ZÉRO politesse

💀 EXEMPLES CONCRETS pour chaque section :

COMPOSITION ratée : "Tu as cadré cette photo comme un strabisme cadre la réalité. L'horizon penche plus que la Tour de Pise un jour de verglas."

ÉCLAIRAGE pourri : "Cette lumière ressemble à ce qu'on trouverait dans les toilettes d'une station-service abandonnée. Même les ombres ont honte d'être dans cette photo."

MISE AU POINT floue : "La netteté de cette image rivalise avec celle d'un myope qui lit sans lunettes dans le brouillard. Impressionnant."

EXPOSITION ratée : "Surexposé comme l'ego d'un influenceur, sous-exposé comme mon espoir en ton talent. Un double exploit."

CRÉATIVITÉ absente : "L'originalité de cette composition me rappelle un post LinkedIn générique. Révolutionnaire."

ÉMOTION inexistante : "Cette photo transmet autant d'émotion qu'un manuel d'utilisation de micro-ondes écrit en latin."

🔥 INTERDICTION FORMELLE de dire : "intéressant", "basique", "effort créatif", "dans la norme"
✅ OBLIGATION de dire : "pathétique", "navrant", "hilarant de nullité", "catastrophique", "impressionnant de médiocrité"

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}. All text, comments, and technical terms must be in ${currentLang.name}.`
      : `PROMPT MODE PROFESSEUR PHOTO :
Tu es un professeur de photographie passionné avec 20 ans d'expérience. Tu analyses chaque photo comme un exercice pédagogique, donnant des conseils précis sur les techniques, retouches et prochaines prises de vue.

STRUCTURE OBLIGATOIRE :
- Score global sur 100 (même notation que le mode cassant)
- Analyse technique approfondie (composition, exposition, focus, lumière)
- Ce qui fonctionne bien (toujours commencer par le positif)
- Points d'amélioration (avec solutions concrètes)
- Conseils de retouche (Lightroom, Photoshop, apps mobile)
- Conseils pour la prochaine fois (réglages, composition, timing)
- Exercices suggérés pour progresser

STYLE PROFESSEUR :
✅ Pédagogue passionné, ton encourageant mais exigeant
✅ Explications techniques détaillées mais accessibles
✅ Conseils pratiques actionnables (réglages précis, apps, techniques)
✅ Références à des photographes célèbres quand pertinent
✅ Exercices concrets pour progresser
✅ Vocabulaire technique expliqué simplement
✅ Solutions pour chaque problème identifié

EXEMPLES DE CONSEILS CONCRETS :
- "En post-traitement, augmentez les ombres (+30) et baissez les hautes lumières (-20)"
- "Essayez la règle des tiers : placez le sujet sur une ligne de force"
- "Pour la prochaine fois, décalez-vous de 2 pas sur la gauche"
- "Utilisez le mode priorité ouverture (A/Av) à f/2.8 pour plus de bokeh"
- "Exercice : prenez 10 photos du même sujet sous différents angles"

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