import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface UserInsights {
  patterns: {
    favoriteStyles: string[]
    strengths: string[]
    improvements: string[]
    preferences: string
  }
  recommendations: {
    nextPhotos: string[]
    techniques: string[]
    challenges: string[]
  }
  tutorials: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }[]
  personalizedAdvice: string
}

export async function generateUserInsights(userData: {
  photos: Array<{
    filename: string
    score: number
    analysis: any
    isFavorite: boolean
  }>
  collections: Array<{
    name: string
    description?: string
  }>
  avgScore: number
  totalPhotos: number
}): Promise<UserInsights> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Préparer les données pour l'IA
    const photosSummary = userData.photos.map(photo => ({
      filename: photo.filename,
      score: photo.score,
      isFavorite: photo.isFavorite,
      // Parser l'analyse JSON si c'est une string
      analysis: typeof photo.analysis === 'string' 
        ? JSON.parse(photo.analysis) 
        : photo.analysis
    }))

    const topPhotos = photosSummary.filter(p => p.score >= 80)
    const favoritePhotos = photosSummary.filter(p => p.isFavorite)
    
    const prompt = `
    Analysez le profil photographique de cet utilisateur et générez des insights personnalisés.

    DONNÉES UTILISATEUR:
    - Photos totales: ${userData.totalPhotos}
    - Score moyen: ${userData.avgScore}/100
    - Photos excellentes (80+): ${topPhotos.length}
    - Photos favorites: ${favoritePhotos.length}
    - Collections: ${userData.collections.map(c => c.name).join(', ')}

    ANALYSES DES PHOTOS:
    ${photosSummary.slice(0, 10).map(photo => `
    - "${photo.filename}" (Score: ${photo.score}, Favori: ${photo.isFavorite})
      Technique: ${photo.analysis?.technical ? Object.values(photo.analysis.technical).join(' | ') : 'N/A'}
      Artistique: ${photo.analysis?.artistic ? Object.values(photo.analysis.artistic).join(' | ') : 'N/A'}
    `).join('\n')}

    Fournissez une analyse en JSON avec cette structure exacte:
    
    {
      "patterns": {
        "favoriteStyles": ["style1", "style2", "style3"],
        "strengths": ["force1", "force2", "force3"],
        "improvements": ["amélioration1", "amélioration2", "amélioration3"],
        "preferences": "description des préférences détectées"
      },
      "recommendations": {
        "nextPhotos": ["suggestion photo 1", "suggestion photo 2", "suggestion photo 3"],
        "techniques": ["technique 1", "technique 2", "technique 3"],
        "challenges": ["défi 1", "défi 2", "défi 3"]
      },
      "tutorials": [
        {
          "title": "Titre du tutoriel",
          "description": "Description détaillée",
          "priority": "high",
          "category": "composition"
        }
      ],
      "personalizedAdvice": "Conseil personnalisé basé sur l'analyse complète"
    }

    INSTRUCTIONS:
    - Analysez les patterns dans les scores élevés et les favoris
    - Identifiez les forces récurrentes (composition, éclairage, etc.)
    - Proposez des améliorations spécifiques aux faiblesses détectées
    - Suggérez des types de photos qui matchent leur style
    - Recommandez des techniques pour progresser
    - Proposez des défis créatifs adaptés à leur niveau
    - Listez 3-5 tutoriels pertinents avec priorité
    - Donnez un conseil global personnalisé et motivant
    
    Soyez spécifique, constructif et encourageant. Basez-vous sur les données réelles.
    `

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Réponse Gemini invalide pour les insights')
    }

    const insights: UserInsights = JSON.parse(jsonMatch[0])
    return insights

  } catch (error) {
    // Note: logger would require user context here
    // Keep console.error for now as this is a service function
    console.error('Erreur génération insights:', error)
    
    // Fallback avec des insights basiques
    return {
      patterns: {
        favoriteStyles: ['Style moderne', 'Composition classique'],
        strengths: ['Créativité', 'Technique solide'],
        improvements: ['Éclairage', 'Composition'],
        preferences: 'Vous semblez apprécier les photos avec une bonne composition et des couleurs vives.'
      },
      recommendations: {
        nextPhotos: ['Portrait en lumière naturelle', 'Paysage urbain', 'Macro créatif'],
        techniques: ['Règle des tiers', 'Éclairage doux', 'Profondeur de champ'],
        challenges: ['Photo noir et blanc', 'Photo de nuit', 'Portrait artistique']
      },
      tutorials: [
        {
          title: 'Maîtriser la composition',
          description: 'Apprenez les règles fondamentales de composition photographique',
          priority: 'high',
          category: 'composition'
        }
      ],
      personalizedAdvice: 'Continuez à explorer différents styles ! Votre créativité est votre point fort.'
    }
  }
}