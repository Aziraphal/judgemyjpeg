import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { generateUserInsights } from '@/services/insights'
import { logger, getClientIP } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Récupérer les données utilisateur pour l'analyse
    const [photos, collections, avgScoreResult] = await Promise.all([
      // Photos avec analyses et favoris
      prisma.photo.findMany({
        where: { 
          userId: user.id,
          analysis: { not: null },
          score: { not: null }
        },
        include: {
          favorites: {
            where: { userId: user.id }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Analyser les 50 dernières photos max
      }),
      
      // Collections
      prisma.collection.findMany({
        where: { userId: user.id },
        select: { name: true, description: true }
      }),
      
      // Score moyen
      prisma.photo.aggregate({
        where: { 
          userId: user.id,
          score: { not: null }
        },
        _avg: { score: true }
      })
    ])

    if (photos.length === 0) {
      return res.status(400).json({ 
        error: 'Pas assez de données pour générer des insights',
        message: 'Analysez au moins quelques photos pour obtenir des recommandations personnalisées'
      })
    }

    // Formater les données pour l'IA
    const userData = {
      photos: photos.map(photo => ({
        filename: photo.filename,
        score: photo.score!,
        analysis: photo.analysis,
        isFavorite: photo.favorites.length > 0
      })),
      collections: collections.map(collection => ({
        name: collection.name,
        description: collection.description || undefined
      })),
      avgScore: avgScoreResult._avg.score || 0,
      totalPhotos: photos.length
    }

    // Générer les insights avec Gemini
    const insights = await generateUserInsights(userData)

    // Optionnel: Sauvegarder les insights en cache
    // (pour éviter de re-générer trop souvent)

    res.status(200).json({ insights })

  } catch (error) {
    const ip = getClientIP(req)
    const session = await getServerSession(req, res, authOptions)
    const userId = session?.user?.id as string | undefined
    logger.error('Erreur génération insights', error, userId, ip)
    
    if (error instanceof Error && error.message.includes('pas assez de données')) {
      return res.status(400).json({ 
        error: error.message,
        message: 'Analysez plus de photos pour obtenir des insights personnalisés'
      })
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de la génération des insights',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}