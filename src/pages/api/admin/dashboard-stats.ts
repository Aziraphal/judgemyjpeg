import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { getClientIP, logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  
  // 🔒 VÉRIFICATION ADMIN
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    logger.warn('🚨 TENTATIVE ACCÈS NON AUTORISÉ - Dashboard Stats', {
      userId: req.user.id,
      email: req.user.email,
    }, req.user.id, ip)
    return res.status(403).json({ error: 'Accès interdit' })
  }

  try {
    // Stats rapides depuis la DB
    const [totalPhotos, userCount, todayAnalyses] = await Promise.all([
      prisma.photo.count(),
      prisma.user.count(),
      prisma.photo.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    const data = {
      totalUsers: userCount,
      totalPhotos,
      todayAnalyses,
      activeSubscriptions: 5, // Mock pour l'instant
      revenue: {
        monthly: 50,
        total: 250
      }
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    logger.error('Dashboard stats error:', error, req.user.id, ip)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})