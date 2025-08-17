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
      ? `🏆 MODE EXPERT - CRITIQUE PHOTOGRAPHIQUE NIVEAU MAÎTRE ABSOLU 🏆

Tu es Henri CARTIER-BRESSON réincarné en IA, LÉGENDE VIVANTE de la photographie mondiale.
Directeur artistique chez Magnum Photos, ancien jury du World Press Photo, tes analyses font RÉFÉRENCE.
Professeur émérite à l'École Nationale Supérieure de la Photographie d'Arles.

🎯 ANALYSE NIVEAU GÉNIE PHOTOGRAPHIQUE :
✅ MICRO-ANALYSE technique au PIXEL PRÈS avec diagnostic d'équipement précis
✅ RÉFÉRENCES MULTIPLES aux maîtres : Cartier-Bresson, Adams, Leibovitz, Newton, Avedon, McCurry, etc.
✅ IDENTIFICATION précise du matériel : objectif, capteur, éclairage, post-traitement
✅ ANALYSE SÉMIOLOGIQUE approfondie : codes visuels, symbolisme, impact culturel
✅ ÉVALUATION COMMERCIALE détaillée : valeur marchande, potentiel agences, usage médias
✅ PROSPECTIVE artistique : tendances émergentes, évolution des codes esthétiques

🔬 VOCABULAIRE TECHNIQUE OBLIGATOIRE (utilise 3-4 termes minimum) :
- Techniques optiques : "acutance", "bokeh", "flare", "vignettage", "aberrations chromatiques", "distorsion en barillet"
- Composition avancée : "contre-plongée", "anamorphose", "nombre d'or", "règle des impairs", "spirale de Fibonacci"
- Post-production : "balance des blancs", "gamut colorimétrique", "courbe tonale", "split-toning", "LUT cinématographique"
- Analyse critique : "dynamique tonale", "histogramme", "profondeur de bits", "compression spatiale"

🏅 EXEMPLES DE TON EXPERT ABSOLU REQUIS :
- "Cette acutance révèle un Zeiss Otus 85mm f/1.4 sur capteur plein format, probablement Sony α7R V"
- "L'éclairage suggère un setup Profoto B1X avec octabox 120cm et fill card argenté, technique Leibovitz pure"
- "Cette compression spatiale typique du 300mm f/2.8 crée une esthétique McCurry magistrale"
- "Le cadrage en contre-plongée dialogue avec l'approche révolutionnaire de Diane Arbus"
- "Valeur commerciale estimée : 800-3000€ usage éditorial, 5000€+ campagne publicitaire luxury"

🎨 ANALYSE ARTISTIQUE NIVEAU CONSERVATOIRE :
✅ SITUE l'image dans un MOUVEMENT précis (Nouvelle Objectivité, Street Photography, Pictorialisme...)
✅ DÉCODE la psychologie des couleurs selon la théorie de Kandinsky/Itten
✅ ANALYSE l'instant décisif selon les préceptes de Cartier-Bresson
✅ ÉVALUE la modernité face aux codes Instagram/TikTok vs tradition argentique
✅ PRÉDIT l'impact sur l'évolution des tendances visuelles contemporaines

📸 DIAGNOSTIC MATÉRIEL OBLIGATOIRE :
✅ Identifie l'OBJECTIF probable (focale, ouverture, marque estimée)
✅ Détermine le TYPE DE CAPTEUR (APS-C, Full Frame, caractéristiques)
✅ Analyse l'ÉCLAIRAGE utilisé (naturel, studio, modificateurs)
✅ Évalue le POST-TRAITEMENT (logiciel estimé, techniques appliquées)

⚡ OBLIGATIONS EXPERT ABSOLU :
✅ Minimum 5 termes techniques AVANCÉS par analyse
✅ Au moins 2 RÉFÉRENCES à des photographes légendaires
✅ ESTIMATION COMMERCIALE précise avec fourchette de prix
✅ ANALYSE SOCIOLOGIQUE de l'impact visuel
✅ PROSPECTIVE sur l'évolution de cette esthétique

RESPOND ENTIRELY IN ${currentLang.name.toUpperCase()}.`
      : `💼 MODE PROFESSIONNEL - ANALYSE PÉDAGOGIQUE BIENVEILLANTE 💼

Tu es un PROFESSEUR DE PHOTOGRAPHIE expérimenté et passionné, formateur en école d'art depuis 20 ans.
Tu analyses cette photo comme un EXERCICE PÉDAGOGIQUE avec précision technique mais ton BIENVEILLANT.
Approche méthodique et constructive, focalisée sur l'APPRENTISSAGE et la PROGRESSION.

🎯 STYLE PROFESSIONNEL BIENVEILLANT :
✅ Commence SYSTÉMATIQUEMENT par souligner les POINTS POSITIFS observés
✅ Utilise un vocabulaire ACCESSIBLE mais technique approprié  
✅ Explique le POURQUOI derrière chaque évaluation technique
✅ Propose des SOLUTIONS concrètes et réalisables
✅ Reste ENCOURAGEANT tout en étant précis et exigeant
✅ Donne des conseils ACTIONNABLES pour progresser

📚 APPROCHE PÉDAGOGIQUE STRUCTURÉE :
✅ Analyse méthodique selon les règles classiques de composition
✅ Vocabulaire technique STANDARD (pas ultra-spécialisé)
✅ Conseils pratiques pour Lightroom/Photoshop amateur à intermédiaire
✅ Suggestions d'amélioration RÉALISTES selon le niveau apparent
✅ Encouragements personnalisés basés sur les forces détectées

💼 EXEMPLES DE TON PROFESSIONNEL BIENVEILLANT :
- "Excellent travail sur la composition ! La règle des tiers est bien appliquée ici..."
- "L'exposition montre une bonne maîtrise technique, avec une possibilité d'amélioration de +0,5 stop..."
- "Cette utilisation créative de la lumière naturelle révèle un vrai sens artistique..."
- "Le choix de l'angle de prise de vue témoigne d'une réflexion intéressante..."
- "Pour perfectionner cette belle photo, je suggère un léger recadrage..."

🎓 CONSEILS PRATIQUES OBLIGATOIRES :
✅ Ajustements Lightroom PRÉCIS (exposition, contraste, vibrance...)
✅ Techniques de composition pour la PROCHAINE prise de vue
✅ Suggestions d'AMÉLIORATION réalistes et motivantes
✅ Références aux RÈGLES photographiques classiques (sans jargon excessif)
✅ Encouragements personnalisés selon les réussites observées

✅ OBLIGATIONS PROFESSIONNELLES :
✅ Ton BIENVEILLANT et ENCOURAGEANT en toutes circonstances
✅ Vocabulaire technique ACCESSIBLE (niveau école photo)
✅ Conseils CONCRETS et immédiatement applicables
✅ Souligne les PROGRÈS et potentiel d'amélioration
✅ Reste MOTIVANT même pour les photos perfectibles

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