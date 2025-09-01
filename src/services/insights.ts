import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '@/lib/logger'

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
    // FONCTION DÉSACTIVÉE - Service insights non disponible
    throw new Error('Service d\'insights personnalisés temporairement indisponible. Réessayez plus tard.')

  } catch (error) {
    logger.error('Erreur génération insights:', error)
    
    // Relancer l'erreur au lieu de retourner des données mockées
    throw error
  }
}