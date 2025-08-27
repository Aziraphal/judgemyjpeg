/**
 * Admin Dashboard Stats API
 * Statistiques générales pour le dashboard admin
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdminAuth } from './auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface DashboardStatsResponse {
  success: boolean
  data?: any
  message?: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStatsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Récupérer toutes les statistiques en parallèle
    const [
      userStats,
      photoStats,
      subscriptionStats,
      revenueStats,
      activityStats
    ] = await Promise.all([
      getUserStats(),
      getPhotoStats(),
      getSubscriptionStats(),
      getRevenueStats(),
      getActivityStats()
    ])

    const data = {
      totalUsers: userStats.totalUsers,
      newUsersToday: userStats.newUsersToday,
      newUsersThisWeek: userStats.newUsersThisWeek,
      
      totalPhotos: photoStats.totalPhotos,
      photosToday: photoStats.photosToday,
      todayAnalyses: photoStats.todayAnalyses,
      averageScore: photoStats.averageScore,
      
      activeSubscriptions: subscriptionStats.activeSubscriptions,
      premiumUsers: subscriptionStats.premiumUsers,
      lifetimeUsers: subscriptionStats.lifetimeUsers,
      
      revenue: {
        monthly: revenueStats.monthlyRevenue,
        total: revenueStats.totalRevenue,
        thisMonth: revenueStats.thisMonthRevenue
      },
      
      activity: {
        dailyActiveUsers: activityStats.dailyActiveUsers,
        weeklyActiveUsers: activityStats.weeklyActiveUsers,
        topPhotos: activityStats.topPhotos,
        popularCollections: activityStats.popularCollections
      }
    }

    res.status(200).json({
      success: true,
      data
    })

  } catch (error) {
    logger.error('Dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du dashboard'
    })
  }
}

/**
 * Statistiques des utilisateurs
 */
async function getUserStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalUsers, newUsersToday, newUsersThisWeek] = await Promise.all([
    prisma.user.count(),
    
    prisma.user.count({
      where: {
        createdAt: { gte: todayStart }
      }
    }),
    
    prisma.user.count({
      where: {
        createdAt: { gte: weekStart }
      }
    })
  ])

  return {
    totalUsers,
    newUsersToday,
    newUsersThisWeek
  }
}

/**
 * Statistiques des photos
 */
async function getPhotoStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalPhotos,
    photosToday,
    averageScoreResult,
    topPhotosCount
  ] = await Promise.all([
    prisma.photo.count(),
    
    prisma.photo.count({
      where: {
        createdAt: { gte: todayStart }
      }
    }),
    
    prisma.photo.aggregate({
      where: {
        score: { not: null }
      },
      _avg: {
        score: true
      }
    }),
    
    prisma.photo.count({
      where: {
        isTopPhoto: true
      }
    })
  ])

  return {
    totalPhotos,
    photosToday,
    todayAnalyses: photosToday, // Alias
    averageScore: Math.round((averageScoreResult._avg.score || 0) * 10) / 10,
    topPhotosCount
  }
}

/**
 * Statistiques des abonnements
 */
async function getSubscriptionStats() {
  const [premiumUsers, lifetimeUsers, totalSubscribed] = await Promise.all([
    prisma.user.count({
      where: {
        subscriptionStatus: 'premium'
      }
    }),
    
    prisma.user.count({
      where: {
        subscriptionStatus: 'lifetime'
      }
    }),
    
    prisma.user.count({
      where: {
        subscriptionStatus: { in: ['premium', 'lifetime'] }
      }
    })
  ])

  return {
    activeSubscriptions: totalSubscribed,
    premiumUsers,
    lifetimeUsers
  }
}

/**
 * Statistiques de revenus (simulées car pas de vraie intégration Stripe dans cette API)
 */
async function getRevenueStats() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Estimation basée sur les abonnements
  const [premiumCount, lifetimeCount] = await Promise.all([
    prisma.user.count({
      where: {
        subscriptionStatus: 'premium',
        updatedAt: { gte: monthStart } // Supposé nouveau ce mois
      }
    }),
    
    prisma.user.count({
      where: {
        subscriptionStatus: 'lifetime',
        updatedAt: { gte: monthStart } // Supposé nouveau ce mois
      }
    })
  ])

  // Estimation des revenus (prix fictifs)
  const monthlyPrice = 9.99
  const lifetimePrice = 99.99

  const thisMonthRevenue = (premiumCount * monthlyPrice) + (lifetimeCount * lifetimePrice)
  const estimatedMonthlyRecurring = premiumCount * monthlyPrice
  const totalLifetimeRevenue = lifetimeCount * lifetimePrice

  return {
    monthlyRevenue: Math.round(estimatedMonthlyRecurring * 100) / 100,
    thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
    totalRevenue: Math.round(totalLifetimeRevenue * 100) / 100
  }
}

/**
 * Statistiques d'activité
 */
async function getActivityStats() {
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    dailyActiveUsers,
    weeklyActiveUsers,
    topPhotos,
    popularCollections
  ] = await Promise.all([
    // Utilisateurs actifs (qui ont une session récente)
    prisma.userSession.groupBy({
      by: ['userId'],
      where: {
        lastActivity: { gte: dayAgo },
        isActive: true
      }
    }).then(results => results.length),
    
    prisma.userSession.groupBy({
      by: ['userId'],
      where: {
        lastActivity: { gte: weekAgo },
        isActive: true
      }
    }).then(results => results.length),
    
    // Top photos récentes
    prisma.photo.findMany({
      where: {
        isTopPhoto: true
      },
      orderBy: { score: 'desc' },
      take: 5,
      select: {
        id: true,
        filename: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),
    
    // Collections populaires
    prisma.collection.findMany({
      where: {
        isPublic: true
      },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: {
        items: {
          _count: 'desc'
        }
      },
      take: 5
    })
  ])

  return {
    dailyActiveUsers,
    weeklyActiveUsers,
    topPhotos,
    popularCollections: popularCollections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      itemCount: collection._count.items,
      color: collection.color,
      createdAt: collection.createdAt
    }))
  }
}

export default requireAdminAuth(handler)