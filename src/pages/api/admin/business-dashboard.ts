/**
 * API endpoint pour le dashboard business metrics
 * Fournit les métriques temps réel pour monitoring admin
 */
import { NextApiRequest, NextApiResponse } from 'next'
import { collectBusinessMetrics } from '@/lib/business-metrics'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérification admin (token simple pour MVP)
  const adminToken = req.headers.authorization?.replace('Bearer ', '')
  if (adminToken !== process.env.ADMIN_METRICS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { timeRange = '24h' } = req.query

    // Calculer dates selon timeRange
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Collecter métriques business principales
    const baseMetrics = await collectBusinessMetrics()

    // Métriques additionnelles pour dashboard
    const [
      totalUsers,
      analysesCount,
      topPhotoTypes,
      topLanguages,
      revenueData,
      retentionData
    ] = await Promise.all([
      // Total utilisateurs
      prisma.user.count(),

      // Analyses par période
      prisma.photo.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Top 5 types de photos
      prisma.photo.groupBy({
        by: ['photoType'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: true,
        orderBy: { _count: { photoType: 'desc' } },
        take: 5
      }).then(results => results.filter(r => r.photoType !== null)),

      // Top langues utilisées
      prisma.photo.groupBy({
        by: ['analysisLanguage'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: true,
        orderBy: { _count: { analysisLanguage: 'desc' } },
        take: 5
      }).then(results => results.filter(r => r.analysisLanguage !== null)),

      // Revenue metrics
      getRevenueMetrics(startDate),

      // Retention metrics
      getRetentionMetrics()
    ])

    // Distribution des scores (buckets de 10)
    const scoreDistribution = await prisma.photo.groupBy({
      by: ['score'],
      where: {
        createdAt: { gte: startDate },
        score: { not: null }
      },
      _count: true
    }).then(results => {
      const buckets: { [key: string]: number } = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      }

      results.forEach(({ score, _count }) => {
        if (score === null) return
        if (score <= 20) buckets['0-20'] += _count
        else if (score <= 40) buckets['21-40'] += _count
        else if (score <= 60) buckets['41-60'] += _count
        else if (score <= 80) buckets['61-80'] += _count
        else buckets['81-100'] += _count
      })

      return buckets
    })

    // Modes d'analyse popularité
    const tonePriority = { roast: 0, professional: 1, learning: 2 }
    const toneDistribution = await prisma.photo.groupBy({
      by: ['analysisTone'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true,
      orderBy: { _count: { analysisTone: 'desc' } }
    }).then(results =>
      results.filter(r => r.analysisTone !== null).sort((a, b) => {
        const priorityA = tonePriority[a.analysisTone as keyof typeof tonePriority] ?? 999
        const priorityB = tonePriority[b.analysisTone as keyof typeof tonePriority] ?? 999
        return priorityA - priorityB
      })
    )

    // Construire réponse complète
    const dashboard = {
      timestamp: new Date().toISOString(),
      timeRange,

      // Métriques principales
      overview: {
        totalUsers,
        totalAnalyses: baseMetrics.analyses.total,
        analysesThisPeriod: analysesCount,
        activePremium: baseMetrics.subscriptions.active_premium,
        newSignupsToday: baseMetrics.subscriptions.new_signups_today,
        mrr: baseMetrics.subscriptions.mrr,
        successRate: (baseMetrics.analyses.success_rate * 100).toFixed(1) + '%',
        avgProcessingTime: (baseMetrics.analyses.avg_processing_time / 1000).toFixed(1) + 's'
      },

      // Santé du système
      health: {
        apis: baseMetrics.api_health,
        status: determineOverallHealth(baseMetrics.api_health),
        alerts: baseMetrics.analyses.errors_last_hour > 5 ? ['High error rate detected'] : []
      },

      // Analyses détaillées
      analytics: {
        scoreDistribution,
        toneDistribution: toneDistribution.map(t => ({
          tone: t.analysisTone,
          count: t._count,
          percentage: ((t._count / analysesCount) * 100).toFixed(1) + '%'
        })),
        topPhotoTypes: topPhotoTypes.map(pt => ({
          type: pt.photoType,
          count: pt._count
        })),
        topLanguages: topLanguages.map(l => ({
          language: l.analysisLanguage,
          count: l._count
        }))
      },

      // Revenue & Growth
      revenue: revenueData,

      // Retention
      retention: retentionData,

      // Conversion funnel
      conversionFunnel: {
        visitors: analysesCount, // Proxy via analyses anonymes
        signups: baseMetrics.subscriptions.new_signups_today,
        firstAnalysis: analysesCount > 0 ? analysesCount : 0,
        premium: baseMetrics.subscriptions.active_premium,
        conversionRate: totalUsers > 0
          ? ((baseMetrics.subscriptions.active_premium / totalUsers) * 100).toFixed(2) + '%'
          : '0%'
      }
    }

    logger.info('📊 Dashboard metrics collectés', {
      timeRange,
      analysesCount,
      timestamp: dashboard.timestamp
    })

    res.status(200).json(dashboard)

  } catch (error) {
    logger.error('❌ Erreur dashboard metrics:', error)
    res.status(500).json({
      error: 'Failed to collect dashboard metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Calcule métriques revenue
 */
async function getRevenueMetrics(startDate: Date) {
  const payments = await prisma.user.findMany({
    where: {
      subscriptionStatus: { in: ['premium', 'annual', 'starter'] },
      updatedAt: { gte: startDate }
    },
    select: {
      subscriptionStatus: true,
      createdAt: true
    }
  })

  const pricing = {
    starter: 4.99,
    premium: 9.99,
    annual: 79.00
  }

  const totalRevenue = payments.reduce((sum, payment) => {
    const price = pricing[payment.subscriptionStatus as keyof typeof pricing] || 0
    return sum + price
  }, 0)

  return {
    totalRevenue: totalRevenue.toFixed(2),
    newPayments: payments.length,
    avgRevenuePerUser: payments.length > 0
      ? (totalRevenue / payments.length).toFixed(2)
      : '0.00'
  }
}

/**
 * Calcule métriques retention
 */
async function getRetentionMetrics() {
  const now = new Date()
  const day7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [users7DaysAgo, activeRecently7d, users30DaysAgo, activeRecently30d] = await Promise.all([
    prisma.user.count({ where: { createdAt: { lte: day7Ago } } }),
    prisma.user.count({
      where: {
        createdAt: { lte: day7Ago },
        photos: {
          some: {
            createdAt: { gte: day7Ago }
          }
        }
      }
    }),
    prisma.user.count({ where: { createdAt: { lte: day30Ago } } }),
    prisma.user.count({
      where: {
        createdAt: { lte: day30Ago },
        photos: {
          some: {
            createdAt: { gte: day30Ago }
          }
        }
      }
    })
  ])

  return {
    day7: users7DaysAgo > 0
      ? ((activeRecently7d / users7DaysAgo) * 100).toFixed(1) + '%'
      : 'N/A',
    day30: users30DaysAgo > 0
      ? ((activeRecently30d / users30DaysAgo) * 100).toFixed(1) + '%'
      : 'N/A'
  }
}

/**
 * Détermine statut global santé
 */
function determineOverallHealth(apiHealth: any): 'healthy' | 'degraded' | 'critical' {
  if (apiHealth.openai_status === 'down' || apiHealth.stripe_status === 'down') {
    return 'critical'
  }
  if (apiHealth.db_response_time > 2000) {
    return 'degraded'
  }
  return 'healthy'
}