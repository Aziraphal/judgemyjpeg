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
    // Utiliser directement l'ID du middleware auth (éviter query user inutile)
    const userId = req.user.id

    // Statistiques globales optimisées
    const [
      totalPhotos,
      topPhotos,
      totalFavorites,
      totalCollections,
      avgScore,
      recentPhotos,
      scoreDistribution
    ] = await Promise.all([
      // Total des photos
      prisma.photo.count({
        where: { userId }
      }),
      
      // Top photos (score >= 85)  
      prisma.photo.count({
        where: { 
          userId,
          score: { gte: 85 }
        }
      }),
      
      // Total favoris
      prisma.favorite.count({
        where: { userId }
      }),
      
      // Total collections
      prisma.collection.count({
        where: { userId }
      }),
      
      // Score moyen + distribution en une seule query optimisée
      prisma.photo.aggregate({
        where: { 
          userId,
          score: { not: null }
        },
        _avg: { score: true },
        _count: true
      }),
      
      // Photos récentes (7 derniers jours)
      prisma.photo.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Distribution des scores avec groupBy optimisé
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN score >= 85 THEN 'excellent'
            WHEN score >= 70 THEN 'good' 
            WHEN score >= 50 THEN 'average'
            ELSE 'poor'
          END as category,
          COUNT(*) as count
        FROM "Photo" 
        WHERE "userId" = ${userId} AND score IS NOT NULL
        GROUP BY category
      `
    ])

    // Traiter la distribution optimisée depuis raw query
    const distribution = (scoreDistribution as any[]).reduce((acc, row) => {
      acc[row.category] = Number(row.count)
      return acc
    }, { excellent: 0, good: 0, average: 0, poor: 0 })

    // Évolution mensuelle optimisée avec SQL direct
    const monthlyStatsRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        AVG(score) as avg_score
      FROM "Photo" 
      WHERE "userId" = ${userId} 
        AND "createdAt" >= ${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 3
    ` as any[]

    // Dernières photos optimisées avec JOIN au lieu de _count
    const latestPhotos = await prisma.$queryRaw`
      SELECT 
        p.id, p.url, p.filename, p.score, p."createdAt",
        COUNT(f.id) as favorite_count
      FROM "Photo" p
      LEFT JOIN "Favorite" f ON f."photoId" = p.id
      WHERE p."userId" = ${userId}
      GROUP BY p.id, p.url, p.filename, p.score, p."createdAt"
      ORDER BY p."createdAt" DESC
      LIMIT 6
    ` as any[]

    // Collections populaires optimisées
    const popularCollections = await prisma.$queryRaw`
      SELECT 
        c.id, c.name, c.color,
        COUNT(ci.id) as photo_count,
        (SELECT json_build_object('id', p.id, 'url', p.url, 'filename', p.filename)
         FROM "CollectionItem" ci2 
         JOIN "Photo" p ON p.id = ci2."photoId"
         WHERE ci2."collectionId" = c.id 
         LIMIT 1) as preview_photo
      FROM "Collection" c
      LEFT JOIN "CollectionItem" ci ON ci."collectionId" = c.id
      WHERE c."userId" = ${userId}
      GROUP BY c.id, c.name, c.color
      ORDER BY photo_count DESC
      LIMIT 5
    ` as any[]

    const stats = {
      overview: {
        totalPhotos,
        topPhotos,
        totalFavorites,
        totalCollections,
        avgScore: avgScore._avg.score ? Math.round(avgScore._avg.score * 10) / 10 : 0,
        recentPhotos,
      },
      distribution,
      monthlyStats: monthlyStatsRaw.map(row => ({
        month: new Date(row.month).toISOString().slice(0, 7),
        count: Number(row.count),
        avgScore: row.avg_score ? Math.round(Number(row.avg_score) * 10) / 10 : 0
      })),
      latestPhotos: latestPhotos.map(photo => ({
        id: photo.id,
        url: photo.url,
        filename: photo.filename,
        score: photo.score,
        createdAt: photo.createdAt,
        favoriteCount: Number(photo.favorite_count)
      })),
      popularCollections: popularCollections.map(collection => ({
        id: collection.id,
        name: collection.name,
        color: collection.color,
        photoCount: Number(collection.photo_count),
        previewPhoto: collection.preview_photo
      }))
    }

    res.status(200).json({ stats })
  } catch (error) {
    logger.error('Dashboard stats failed', error, req.user.id, ip)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})