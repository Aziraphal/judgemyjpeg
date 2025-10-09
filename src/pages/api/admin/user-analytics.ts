import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Vérifier que l'utilisateur est admin
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non autorisé' })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' })
    }

    // Récupérer le filtre de période
    const { period = 'today' } = req.query

    let startDate: Date
    const now = new Date()

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0))
    }

    // Récupérer les nouveaux utilisateurs avec leurs données
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        monthlyAnalysisCount: true,
        photos: {
          select: {
            id: true
          }
        },
        accounts: {
          select: {
            provider: true,
            type: true
          },
          take: 1
        },
        sessions: {
          select: {
            lastActivity: true,
            deviceName: true,
            browser: true,
            os: true
          },
          orderBy: {
            lastActivity: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater les données
    const analytics = users.map(user => ({
      id: user.id,
      email: user.email || 'N/A',
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      monthlyAnalysisCount: user.monthlyAnalysisCount,
      totalPhotos: user.photos.length,
      provider: user.accounts[0]?.provider || null,
      lastActivity: user.sessions[0]?.lastActivity?.toISOString() || null,
      deviceInfo: user.sessions[0]
        ? `${user.sessions[0].deviceName} - ${user.sessions[0].browser} (${user.sessions[0].os})`
        : null
    }))

    // Calculer les stats
    const totalNewUsers = analytics.length
    const usersWithAnalyses = analytics.filter(u => u.totalPhotos > 0).length
    const usersWithoutAnalyses = totalNewUsers - usersWithAnalyses
    const conversionRate = totalNewUsers > 0 ? (usersWithAnalyses / totalNewUsers) * 100 : 0

    const stats = {
      totalNewUsers,
      usersWithAnalyses,
      usersWithoutAnalyses,
      conversionRate
    }

    return res.status(200).json({
      users: analytics,
      stats
    })
  } catch (error) {
    console.error('Erreur user analytics:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
