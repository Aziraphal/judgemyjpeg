import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// 🛡️ SYSTÈME DE MODÉRATION - Liste des mots/expressions interdits
const INAPPROPRIATE_WORDS = [
  // Mots vulgaires français
  'merde', 'putain', 'con', 'connard', 'salope', 'pute', 'enculé', 'chiant', 'bordel',
  // Mots discriminatoires
  'gros', 'grosse', 'moche', 'laid', 'laide', 'débile', 'crétin', 'idiot',
  // Mots anglais inappropriés
  'shit', 'fuck', 'damn', 'stupid', 'ugly', 'fat', 'retard', 'gay', 'loser',
  // Références corporelles inappropriées
  'gras', 'obèse', 'maigre', 'diforme',
  // Discriminations
  'noir', 'blanc', 'jaune' // dans un contexte discriminatoire
]

const INAPPROPRIATE_PHRASES = [
  'tu es nul', 'tu es moche', 'ça craint', 'c\'est dégueulasse', 'horrible',
  'you suck', 'you\'re ugly', 'disgusting', 'awful person'
]

// 🛡️ Fonction de modération de contenu
function moderateContent(analysis: PhotoAnalysis): PhotoAnalysis {
  const moderateText = (text: string): string => {
    let moderatedText = text
    
    // Vérifier les mots interdits
    INAPPROPRIATE_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(moderatedText)) {
        // Remplacer par des alternatives appropriées
        moderatedText = moderatedText.replace(regex, getAppropriateAlternative(word))
      }
    })
    
    // Vérifier les phrases interdites
    INAPPROPRIATE_PHRASES.forEach(phrase => {
      if (moderatedText.toLowerCase().includes(phrase.toLowerCase())) {
        moderatedText = 'Cette analyse nécessite des améliorations techniques.'
      }
    })
    
    return moderatedText
  }
  
  // Appliquer la modération à tous les textes
  const moderatedAnalysis: PhotoAnalysis = {
    ...analysis,
    technical: {
      composition: moderateText(analysis.technical.composition),
      lighting: moderateText(analysis.technical.lighting),
      focus: moderateText(analysis.technical.focus),
      exposure: moderateText(analysis.technical.exposure)
    },
    artistic: {
      creativity: moderateText(analysis.artistic.creativity),
      emotion: moderateText(analysis.artistic.emotion),
      storytelling: moderateText(analysis.artistic.storytelling)
    },
    suggestions: analysis.suggestions.map(suggestion => moderateText(suggestion)),
    improvements: analysis.improvements.map(improvement => ({
      ...improvement,
      description: moderateText(improvement.description)
    }))
  }
  
  return moderatedAnalysis
}

// 🛡️ Alternatives appropriées pour mots inappropriés
function getAppropriateAlternative(word: string): string {
  const alternatives: Record<string, string> = {
    'merde': 'problématique',
    'putain': 'vraiment',
    'con': 'peu optimal',
    'connard': 'photographe',
    'moche': 'perfectible',
    'laid': 'améliorable',
    'shit': 'challenging',
    'fuck': 'very',
    'stupid': 'basic',
    'ugly': 'improvable'
  }
  
  return alternatives[word.toLowerCase()] || 'technique'
}

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
      ? `YOU ARE AN OBJECTIVE PHOTOGRAPHY CRITIC. Analyze this photo with STRICTLY IDENTICAL TECHNICAL EVALUATION as a professional would, but EXPRESS your observations with sarcastic humor. 

ABSOLUTE RULES:
- The SCORE must be IDENTICAL to what an objective professional critic would give
- Only the FORMULATION of comments changes (sarcastic vs polite)
- Technical analysis remains RIGOROUS and OBJECTIVE
- Example: "This exposure looks like a vampire afraid of light... but technically +2 stops would fix the issue."

🚨 CONTENT SAFETY RULES - MANDATORY:
- NEVER use offensive, vulgar, or inappropriate language
- NEVER make personal attacks or body shaming
- NEVER use discriminatory language (race, gender, religion, etc.)
- NEVER reference explicit content or violence
- Keep sarcasm CONSTRUCTIVE and RESPECTFUL
- Focus criticism on TECHNICAL aspects only, not personal characteristics
- Use playful teasing, not harsh insults
- Example good: "Cette photo semble avoir été prise dans un tunnel... essayons d'ajouter de la lumière !"
- Example bad: Any offensive or discriminatory content

KEEP THE SAME EVALUATION SEVERITY as a professional!

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}. All text, comments, and technical terms must be in ${currentLang.name}.`
      : `YOU ARE AN OBJECTIVE AND PROFESSIONAL PHOTOGRAPHY CRITIC. Analyze this photo with technical rigor, precision and kindness. Your evaluation must be fair and constructive.

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}. All text, comments, and technical terms must be in ${currentLang.name}.`

    const prompt = `
    ${basePrompt}
    
    PROCESSUS D'ANALYSE EN 2 ÉTAPES :
    
    1️⃣ ÉVALUATION OBJECTIVE (IDENTIQUE POUR TOUS LES TONS) :
    - Analysez la composition, l'exposition, la netteté, les couleurs
    - Attribuez un score de 0 à 100 basé UNIQUEMENT sur ces critères techniques
    - Calculez le score potentiel avec les améliorations possibles
    
    2️⃣ FORMULATION DES COMMENTAIRES :
    - Mode professionnel : ton respectueux et encourageant
    - Mode cassant : ton sarcastique mais constructif
    - Le FOND de l'analyse reste identique, seule la FORME change
    
    Fournissez une analyse détaillée en JSON avec cette structure exacte :

    {
      "score": [note actuelle de 0 à 100],
      "potentialScore": [score potentiel après retouches optimales],
      "technical": {
        "composition": "[analyse de la composition, règle des tiers, lignes directrices]",
        "lighting": "[qualité de la lumière, direction, température de couleur]",
        "focus": "[netteté, profondeur de champ, mise au point]",
        "exposure": "[exposition, hautes lumières, ombres, contraste]"
      },
      "artistic": {
        "creativity": "[originalité, innovation, angle unique]",
        "emotion": "[impact émotionnel, atmosphère, ressenti]",
        "storytelling": "[narration, message, histoire racontée]"
      },
      "suggestions": [
        "suggestion concrète 1",
        "suggestion concrète 2",
        "suggestion concrète 3"
      ],
      "improvements": [
        {
          "impact": "Corriger l'exposition",
          "description": "Éclaircir les ombres de +2 stops et réduire les hautes lumières",
          "difficulty": "facile",
          "scoreGain": 8
        },
        {
          "impact": "Améliorer la composition",
          "description": "Recadrer selon la règle des tiers pour centrer le sujet",
          "difficulty": "facile",
          "scoreGain": 5
        }
      ],
      "toolRecommendations": {
        "lightroom": ["ajustement lumière", "correction couleur"],
        "photoshop": ["retouche peau", "suppression éléments"],
        "snapseed": ["amélioration contraste", "filtre vintage"],
        "canva": ["recadrage créatif", "filtres instagram"],
        "luminar": ["amélioration IA", "ciel dramatique"]
      }
    }

    ⚠️ RÈGLE CRITIQUE ABSOLUE ⚠️ : 
    - Le SCORE (score actuel et potentialScore) doit être EXACTEMENT IDENTIQUE peu importe le ton choisi
    - Le score doit être basé UNIQUEMENT sur les critères techniques et artistiques objectifs
    - JAMAIS le ton du commentaire ne doit influencer la notation
    - Seuls les TEXTES d'analyse (technical, artistic, suggestions) changent de style
    - L'évaluation photographique reste STRICTEMENT la même
    - Si vous donnez 70/100 en mode professionnel, vous DEVEZ donner 70/100 en mode cassant
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ])

    const response = result.response.text()
    
    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Réponse Gemini invalide')
    }

    const analysis: PhotoAnalysis = JSON.parse(jsonMatch[0])
    
    // 🛡️ MODÉRATION DE CONTENU - Validation post-génération
    const moderatedAnalysis = moderateContent(analysis)
    
    return moderatedAnalysis

  } catch (error) {
    // Note: logger would require user context here
    // Keep console.error for now as this is a service function
    console.error('Erreur analyse Gemini:', error)
    throw new Error('Impossible d\'analyser la photo')
  }
}