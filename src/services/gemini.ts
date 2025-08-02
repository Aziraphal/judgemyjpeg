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

    IMPORTANT : Les deux modes doivent aboutir au MÊME score final, seule la forme change.
    
    🚨 RÈGLES DE NOTATION STRICTES :
    - BANNISSEZ le score de 70/100 par défaut - soyez PRÉCIS et VARIÉ
    - Une photo floue/mal exposée = 20-40/100
    - Photo amateur correcte = 45-60/100  
    - Photo bien réalisée = 65-75/100
    - Excellente photo = 80-90/100
    - Chef d'œuvre = 95-100/100
    - ANALYSEZ VRAIMENT chaque critère et additionnez les notes partielles
    
    PROCESSUS D'ANALYSE EN 3 ÉTAPES :
    
    1️⃣ ANALYSE DÉTAILLÉE PAR CRITÈRE :
    TECHNIQUE :
    - Composition : donnez une note /15 précise
    - Lumière : donnez une note /15 précise  
    - Mise au point : donnez une note /15 précise
    - Exposition : donnez une note /15 précise
    ARTISTIQUE :
    - Créativité : donnez une note /15 précise
    - Émotion : donnez une note /15 précise
    - Narration : donnez une note /10 précise
    
    2️⃣ CALCUL DU SCORE TOTAL - CRITIQUE :
    - Additionnez OBLIGATOIREMENT les 7 notes : composition + lumière + mise_au_point + exposition + créativité + émotion + narration
    - Exemple : 12+15+14+14+10+10+10 = 85 → score final = 85/100
    - ❌ INTERDIT de donner un score différent de cette addition
    - ❌ INTERDIT d'arrondir ou d'ajuster subjectivement  
    - ✅ Le score JSON "score" DOIT être exactement égal à la somme des 7 critères
    - VÉRIFIEZ 3 FOIS votre addition avant de répondre
    
    3️⃣ FORMULATION DES COMMENTAIRES :
    - Mode PRO : ton professionnel et pédagogique
    - Mode CASSANT : ton sarcastique mais constructif
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