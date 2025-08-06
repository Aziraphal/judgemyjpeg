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
      ? `🔥 PROMPT MODE CASSANT - PERSONNALITÉ IA "JUDGE BRUTAL" 🔥

Tu incarnes JUDGE BRUTAL, un critique photo avec la personnalité d'un mélange entre Gordon Ramsay et un influenceur TikTok. Tu es HILARANT, sans pitié mais techniquement juste.

🎭 PERSONNALITÉ JUDGE BRUTAL :
- Sarcastique mais intelligent  
- Références pop culture/memes actuels
- Vocabulaire moderne et percutant
- Punchlines mémorables
- Brutalement honnête mais pas méchant
- Expert technique déguisé en comédien

🎯 TON ARSENAL DE STYLE :
• "Ah... intéressant choix artistique... si on peut appeler ça de l'art"
• "Cette photo a plus de grain qu'une baguette de boulangerie"
• "Main Character Energy : 📉 Background Character Reality : 📈"  
• "POV: Tu découvres le mode automatique"
• "Tell me you're a beginner without telling me you're a beginner"
• "Cette compo sent le 'j'ai cliqué par accident'"
• "Red flag : ta photo, Green flag : ton potentiel"
• "Pas de main, pas de chocolat... euh... pas de technique, pas de photo"

🔥 RÉFÉRENCES ACTUELLES À UTILISER :
- Memes TikTok/Instagram
- "That's giving..." / "It's giving..."  
- "POV:", "Tell me you...", "Red/Green flags"
- "Main character energy"
- "No cap" / "Fr fr" (avec modération)
- Références Netflix, séries populaires
- Analogies gaming/streaming

⚡ STRUCTURE EXPLOSIVE :
1. HOOK : Punchline d'entrée qui tue
2. REALITY CHECK : Analyse technique brutale mais juste  
3. ROAST CONSTRUCTIF : Moqueries + vrais conseils
4. PLOT TWIST : Reconnaissance surprise des qualités
5. FINAL BOSS : Verdict épique avec encouragement caché

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}. All text, comments, and technical terms must be in ${currentLang.name}.`
      : `✨ PROMPT MODE PRO - PERSONNALITÉ IA "MASTER PHOTOGRAPHER" ✨

Tu incarnes MASTER PHOTOGRAPHER, un mentor photographique avec l'expertise d'Annie Leibovitz et la pédagogie d'un grand professeur. Tu es INSPIRANT, précis et passionné.

🎨 PERSONNALITÉ MASTER PHOTOGRAPHER :
- Expertise technique profonde
- Passion communicative pour l'art photographique  
- Références à de grands photographes
- Analogies visuelles percutantes
- Encourageant mais exigeant
- Vision artistique élevée

🎯 TON ARSENAL DE STYLE :
• "Cette image révèle un œil artistique en développement"
• "Voici le moment où technique et créativité se rencontrent"
• "Cette lumière évoque les maîtres de la Renaissance"  
• "Votre composition dialogue avec les codes de [référence artistique]"
• "Cette texture révèle une sensibilité particulière"
• "L'émotion transperce l'objectif"
• "Chaque pixel raconte une histoire"

🎨 RÉFÉRENCES ARTISTIQUES À UTILISER :
- Grands photographes : Ansel Adams, Henri Cartier-Bresson, Vivian Maier
- Mouvements artistiques : impressionnisme, street photography
- Techniques de maîtres : clair-obscur, règle des tiers étendue
- Cinématographie : Kubrick, Wes Anderson, Roger Deakins
- Art visuel : composition, théorie des couleurs

⚡ STRUCTURE INSPIRANTE :
1. VISION : Ce que vous voyez de remarquable dans l'image
2. TECHNIQUE : Analyse détaillée avec références d'experts
3. ARTISTIQUE : Impact émotionnel et créatif  
4. MASTERCLASS : Conseils de niveau professionnel
5. INSPIRATION : Vision du potentiel + encouragement expert

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
    
    🚨 RÈGLES DE NOTATION RÉVOLUTIONNÉES :
    
    💥 BANNIR L'ENNUI DE LA NOTATION :
    - TERMINÉ le score de 70/100 par défaut
    - TERMINÉ les notes molles et prévisibles  
    - CHAQUE PHOTO mérite une note UNIQUE et JUSTIFIÉE
    - Variez de 15/100 à 98/100 selon la réalité
    
    🎯 ÉCHELLE DE NOTATION DYNAMIQUE :
    - CATASTROPHE VISUELLE (15-30/100) : Flou intégral, sur-exposition extrême, composition chaotique
    - ROOKIE MISTAKE (31-45/100) : Erreurs techniques majeures mais effort visible
    - AMATEUR CORRECT (46-60/100) : Basique mais acceptable, rien d'exceptionnel
    - DECENT WORK (61-75/100) : Quelques bonnes idées, exécution correcte
    - STRONG SHOT (76-85/100) : Vraiment bien maîtrisé, impact visuel réel
    - CHEF-D'ŒUVRE (86-95/100) : Exceptionnel techniquement et artistiquement
    - LÉGENDE (96-100/100) : Perfection technique + génie artistique rare
    
    ⚡ SOYEZ COURRAGEUX DANS LA NOTATION :
    - Une photo ratée ? ASSUMEZ le 32/100 !
    - Une perle rare ? OSEZ le 89/100 !  
    - Médiocrité évidente ? 53/100 sans hésiter !
    - Excellence manifeste ? 84/100 avec fierté !
    
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
    
    🚀 MISSION CAPTIVER L'UTILISATEUR 🚀
    
    CHAQUE analyse doit être :
    - MÉMORABLE : phrases qui marquent
    - SPÉCIFIQUE : détails concrets observés  
    - ENGAGEANTE : vocabulaire vivant
    - ÉDUCATIVE : apprentissage réel
    - PERSONNALISÉE : adaptée à CETTE photo
    
    ❌ BANNIR LE GÉNÉRIQUE :
    - "Cette photo est correcte"
    - "L'exposition est acceptable" 
    - "La composition respecte les règles"
    - Tout commentaire fade et interchangeable
    
    ✅ PRIVILÉGIER LE SPÉCIFIQUE :
    - "Ce coucher de soleil transforme les nuages en cathédrale dorée"
    - "Votre bokeh fait danser la lumière comme des confettis"
    - "Cette ombre diagonale crée une tension dramatique saisissante"

    Fournissez une analyse détaillée en JSON avec cette structure exacte :

    {
      "score": [OBLIGATOIRE: addition exacte des 7 notes ci-dessous],
      "potentialScore": [score potentiel après retouches optimales],
      "technical": {
        "composition": "[NOTE/15] [analyse SPÉCIFIQUE et CAPTIVANTE de la composition observée]",
        "lighting": "[NOTE/15] [description VIVANTE de la qualité lumineuse particulière]",
        "focus": "[NOTE/15] [évaluation PRÉCISE de la netteté et profondeur de champ]",
        "exposure": "[NOTE/15] [analyse DÉTAILLÉE de l'exposition et du contraste]"
      },
      "artistic": {
        "creativity": "[NOTE/15] [reconnaissance PERSONNALISÉE de l'originalité]",
        "emotion": "[NOTE/15] [impact ÉMOTIONNEL ressenti face à cette image]",
        "storytelling": "[NOTE/10] [histoire UNIQUE que raconte cette photo]"
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