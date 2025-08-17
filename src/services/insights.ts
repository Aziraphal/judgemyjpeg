import { GoogleGenerativeAI } from '@google/generative-ai'

// TEMPORAIREMENT DÉSACTIVÉ - API key invalide cause crashes
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
    // TEMPORAIREMENT DÉSACTIVÉ - Retourne le fallback directement
    throw new Error('Gemini temporairement désactivé')

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