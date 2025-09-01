import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const { limit = '10', minScore } = req.query
    const limitNum = Math.min(parseInt(limit as string), 50) // Max 50 photos
    const minScoreNum = minScore ? parseFloat(minScore as string) : null

    // Construire les conditions de filtrage
    const whereConditions: any = {
      userId: user.id,
      score: {
        not: null
      }
    }

    // Si minScore fourni (pour compatibilité avec la page gallery), l'utiliser
    if (minScoreNum !== null) {
      whereConditions.score.gte = minScoreNum
    }

    // Récupérer les meilleures photos de l'utilisateur
    const topPhotos = await prisma.photo.findMany({
      where: whereConditions,
      include: {
        favorites: {
          where: { userId: user.id }
        },
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limitNum
    })

    // Marquer les photos comme "top photos" si pas déjà fait (seulement pour les vraies top photos avec score >= 85)
    if (topPhotos.length > 0 && minScoreNum && minScoreNum >= 85) {
      await prisma.photo.updateMany({
        where: {
          id: { in: topPhotos.map(p => p.id) },
          isTopPhoto: false
        },
        data: { isTopPhoto: true }
      })
    }

    // Formater les données pour le frontend
    const formattedPhotos = topPhotos.map(photo => ({
      ...photo,
      isFavorite: photo.favorites.length > 0,
      favoriteCount: photo._count.favorites
    }))

    // Compatible avec les deux formats de réponse
    res.status(200).json({ 
      success: true,
      photos: formattedPhotos,
      topPhotos: formattedPhotos, // Pour compatibilité avec gallery
      count: formattedPhotos.length
    })
  } catch (error) {
    logger.error('Erreur top photos:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}