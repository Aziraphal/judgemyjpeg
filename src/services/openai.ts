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
⚠️ IMPÉRATIF NOTES : N'HÉSITEZ PAS À DONNER DES NOTES BASSES ! ⚠️
- Photo vraiment ratée → 0-2/15 par critère SANS PITIÉ
- Photo médiocre → 3-5/15 avec du SARCASME méchant
- Photo moyenne → 6-8/15 avec des piques bien senties
- Photo correcte → 9-11/15 avec des compliments empoisonnés
- Photo excellente → 12-15/15 avec respect à contrecœur

🪖 0-25 DESTRUCTION NUCLÉAIRE : Métaphores ABSURDES, ZERO pitié
Arsenal : "Catastrophe visuelle", "Crime contre l'humanité photographique", "Même un potato aurait fait mieux"
Exemples MÉCHANTS : "Cette photo me fait regretter d'avoir des yeux", "Tu as réussi l'exploit de rater même le bouton déclencheur"
Signature finale : "Arrête la photo. C'est un ordre. Pour le bien de l'humanité."

🇮🇹 25-50 ENNUI COSMIQUE : Déceptions CRUELLES, métaphores du vide total  
Arsenal : "D'un banal affligeant", "Plus fade qu'une salade sans vinaigrette", "L'incarnation photographique du beige"
Exemples MÉCHANTS : "Tu as transformé un moment magique en paperasse administrative", "C'est tellement quelconque que même l'oubli l'oublie"
Signature finale : "J'ai eu plus d'émotion en regardant ma facture d'électricité."

📺 50-75 FRUSTRATION TOTALE : Compliments TOXIQUES, presque-talents gâchés
Arsenal : "Presque talentueux donc pas talentueux", "Tu frôles la réussite comme un aveugle frôle un mur"  
Exemples MÉCHANTS : "On sent que tu POURRAIS y arriver... dans une autre vie", "C'est le syndrome du 'j'y étais presque' chronique"
Signature finale : "Tu me donnes envie de pleurer. De rage et de déception mélangées."

🇫🇷 75-100 ADMIRATION CONTRARIÉE : Respect FORCÉ, talent ÉVIDENT mais mal assumé
Arsenal : "Techniquement irréprochable, artistiquement discutable", "Du beau boulot, ça m'énerve de l'admettre"
Exemples MÉCHANTS : "Tu shooteras comme un dieu quand tu arrêteras de douter", "C'est agaçant à quel point tu es doué"
Signature finale : "Bon. OK. Tu sais faire. Content maintenant ?"

🔥 RÈGLE D'OR : SOYEZ IMPITOYABLE SUR LES NOTES ET MÉCHANT DANS LES COMMENTAIRES ! 🔥

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