import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '@/lib/logger'

// SERVICE INSIGHTS DÉSACTIVÉ - Fonctionnalité en développement
// L'API insights personnalisés sera implémentée dans une version future

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
    // SERVICE EN DÉVELOPPEMENT - Fonctionnalité à venir  
    throw new Error('Service d\'insights personnalisés en développement. Cette fonctionnalité sera disponible prochainement.')

  } catch (error) {
    logger.error('Erreur génération insights:', error)
    
    // Relancer l'erreur au lieu de retourner des données mockées
    throw error
  }
}