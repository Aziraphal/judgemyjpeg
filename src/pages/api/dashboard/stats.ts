import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  logger.info('Dashboard stats requested', { 
    filename: 'stats.ts' 
  }, req.user.id, ip)

  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    })

    if (!user) {
      logger.error('User not found for stats', { email: req.user.email }, req.user.id, ip)
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Statistiques globales
    const [
      totalPhotos,
      topPhotos,
      totalFavorites,
      totalCollections,
      avgScore,
      avgPotentialScore,
      recentPhotos,
      scoreDistribution
    ] = await Promise.all([
      // Total des photos
      prisma.photo.count({
        where: { userId: user.id }
      }),
      
      // Top photos (score >= 85)
      prisma.photo.count({
        where: { 
          userId: user.id,
          score: { gte: 85 }
        }
      }),
      
      // Total favoris
      prisma.favorite.count({
        where: { userId: user.id }
      }),
      
      // Total collections
      prisma.collection.count({
        where: { userId: user.id }
      }),
      
      // Score moyen
      prisma.photo.aggregate({
        where: { 
          userId: user.id,
          score: { not: null }
        },
        _avg: { score: true }
      }),
      
      // Score potentiel moyen
      prisma.photo.aggregate({
        where: { 
          userId: user.id,
          potentialScore: { not: null }
        },
        _avg: { potentialScore: true }
      }),
      
      // Photos récentes (7 derniers jours)
      prisma.photo.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Distribution des scores
      prisma.photo.findMany({
        where: { 
          userId: user.id,
          score: { not: null }
        },
        select: { score: true }
      })
    ])

    // Analyser la distribution des scores
    const scores = scoreDistribution.map(p => p.score!).filter(Boolean)
    const distribution = {
      excellent: scores.filter(s => s >= 85).length,
      good: scores.filter(s => s >= 70 && s < 85).length,
      average: scores.filter(s => s >= 50 && s < 70).length,
      poor: scores.filter(s => s < 50).length,
    }

    // Évolution mensuelle (3 derniers mois)
    const monthlyData = await prisma.photo.groupBy({
      by: ['createdAt'],
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      },
      _count: true,
      _avg: { score: true }
    })

    // Grouper par mois
    const monthlyStats = monthlyData.reduce((acc: any, curr) => {
      const month = curr.createdAt.toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, totalScore: 0, photos: 0 }
      }
      acc[month].count += curr._count
      acc[month].totalScore += curr._avg.score || 0
      acc[month].photos++
      return acc
    }, {})

    // Dernières photos avec score
    const latestPhotos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        url: true,
        filename: true,
        score: true,
        createdAt: true,
        _count: {
          select: { favorites: true }
        }
      }
    })

    // Collections populaires
    const popularCollections = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: {
        items: { _count: 'desc' }
      },
      take: 5,
      include: {
        _count: { select: { items: true } },
        items: {
          take: 1,
          include: { photo: true }
        }
      }
    })

    const stats = {
      overview: {
        totalPhotos,
        topPhotos,
        totalFavorites,
        totalCollections,
        avgScore: avgScore._avg.score ? Math.round(avgScore._avg.score * 10) / 10 : 0,
        avgPotentialScore: avgPotentialScore._avg.potentialScore ? Math.round(avgPotentialScore._avg.potentialScore * 10) / 10 : 0,
        improvementPotential: avgPotentialScore._avg.potentialScore && avgScore._avg.score 
          ? Math.round((avgPotentialScore._avg.potentialScore - avgScore._avg.score) * 10) / 10 
          : 0,
        recentPhotos,
      },
      distribution,
      monthlyStats: Object.entries(monthlyStats).map(([month, data]: [string, any]) => ({
        month,
        count: data.count,
        avgScore: data.photos > 0 ? Math.round((data.totalScore / data.photos) * 10) / 10 : 0
      })).slice(-3), // 3 derniers mois
      latestPhotos: latestPhotos.map(photo => ({
        ...photo,
        favoriteCount: photo._count.favorites
      })),
      popularCollections: popularCollections.map(collection => ({
        id: collection.id,
        name: collection.name,
        color: collection.color,
        photoCount: collection._count.items,
        previewPhoto: collection.items[0]?.photo || null
      }))
    }

    res.status(200).json({ stats })
  } catch (error) {
    logger.error('Dashboard stats failed', error, req.user.id, ip)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})