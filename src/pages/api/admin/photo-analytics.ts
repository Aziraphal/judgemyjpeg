import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { AuditLogger } from '@/lib/audit-trail'

interface PhotoAnalyticsFilters {
  minScore?: number
  maxScore?: number
  analysisTone?: 'artcritic' | 'roast' | 'professional'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  sortBy?: 'score' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

interface PhotoAnalyticsResponse {
  analytics: {
    id: string
    score: number | null // Peut être null pour analyses non terminées
    analysisTone: string | null
    createdAt: string
    userEmail: string // Masqué pour RGPD
    partialScores: string // JSON avec détail scores  
    filename: string // Sans path complet
    status: 'completed' | 'pending' | 'failed' // Statut analyse
  }[]
  totalCount: number
  stats: {
    avgScore: number
    statusCount: {
      completed: number
      pending: number
      failed: number
    }
    distribution: {
      excellent: number // 85+
      good: number     // 70-84
      average: number  // 50-69
      poor: number     // <50
    }
    toneBreakdown: {
      artcritic: number
      roast: number
      professional: number
    }
  }
}

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  
  // 🔒 DOUBLE VÉRIFICATION ADMIN - SÉCURITÉ CRITIQUE
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    const auditLogger = new AuditLogger(req, req.user.id, req.user.email)
    await auditLogger.logSecurity('admin_action', {
      description: 'Non-admin user attempted to access photo analytics',
      metadata: {
        endpoint: '/api/admin/photo-analytics',
        userId: req.user.id,
        userEmail: req.user.email,
        attemptedAction: 'view_photo_analytics'
      },
      success: false,
      riskLevel: 'high'
    })
    
    logger.warn('🚨 TENTATIVE ACCÈS NON AUTORISÉ - Photo Analytics', {
      userId: req.user.id,
      email: req.user.email,
      endpoint: '/api/admin/photo-analytics'
    }, req.user.id, ip)
    
    return res.status(403).json({ error: 'Accès interdit - Privilèges administrateur requis' })
  }

  // Log accès admin légitime  
  const auditLogger = new AuditLogger(req, req.user.id, req.user.email)
  await auditLogger.logSecurity('admin_action', {
    description: 'Admin accessed photo analytics dashboard',
    metadata: { endpoint: '/api/admin/photo-analytics' },
    success: true,
    riskLevel: 'low'
  })

  try {
    const filters: PhotoAnalyticsFilters = {
      minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined,
      maxScore: req.query.maxScore ? parseInt(req.query.maxScore as string) : undefined,
      analysisTone: req.query.analysisTone as 'artcritic' | 'roast' | 'professional' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      limit: Math.min(parseInt(req.query.limit as string) || 50, 200), // Max 200 pour perfs
      offset: parseInt(req.query.offset as string) || 0,
      sortBy: (req.query.sortBy as 'score' | 'createdAt') || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    }

    // 🔒 CONSTRUCTION SÉCURISÉE WHERE CLAUSE - TOUTES LES PHOTOS
    const whereClause: any = {
      // Plus de filtre score: { not: null } pour voir toutes les analyses
    }

    if (filters.minScore !== undefined) {
      whereClause.score = { ...whereClause.score, gte: filters.minScore }
    }
    if (filters.maxScore !== undefined) {
      whereClause.score = { ...whereClause.score, lte: filters.maxScore }
    }
    if (filters.analysisTone) {
      whereClause.analysisTone = filters.analysisTone
    }
    if (filters.startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(filters.startDate) }
    }
    if (filters.endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(filters.endDate) }
    }

    // 🚀 QUERIES PARALLÈLES OPTIMISÉES
    const [analytics, totalCount, avgScore, distribution, modeBreakdown] = await Promise.all([
      // Analytics avec JOIN sécurisé (pas d'images exposées)
      prisma.photo.findMany({
        where: whereClause,
        select: {
          id: true,
          score: true,
          analysisTone: true,
          analysis: true, // Nécessaire pour détection erreurs
          createdAt: true,
          filename: true, // Nom fichier uniquement
          partialScores: true,
          // 🔒 JOIN SÉCURISÉ - EMAIL MASQUÉ
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy: { [filters.sortBy!]: filters.sortOrder },
        take: filters.limit,
        skip: filters.offset
      }),

      // Count total pour pagination
      prisma.photo.count({ where: whereClause }),

      // Score moyen (seulement analyses terminées)
      prisma.photo.aggregate({
        where: { ...whereClause, score: { not: null } },
        _avg: { score: true }
      }),

      // Distribution optimisée avec SQL brut sécurisé
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
        WHERE score IS NOT NULL
        GROUP BY category
      ` as unknown as any[],

      // Répartition tones 
      prisma.photo.groupBy({
        by: ['analysisTone'],
        where: { score: { not: null } },
        _count: true
      })
    ])

    // 🔒 MASQUAGE EMAIL RGPD-COMPLIANT + STATUT ANALYSE AMÉLIORÉ
    const sanitizedAnalytics = analytics.map(photo => {
      let status: 'completed' | 'pending' | 'failed' = 'pending'
      
      // Analyse terminée avec succès
      if (photo.score !== null && photo.analysisTone && photo.analysis) {
        status = 'completed'
      } 
      // Détection d'erreur plus intelligente
      else {
        const ageInMinutes = (Date.now() - new Date(photo.createdAt).getTime()) / (1000 * 60)
        
        // Cas d'erreur probable:
        if (ageInMinutes > 5 && !photo.score && !photo.analysis) {
          // Plus de 5min sans aucun résultat = échoué
          status = 'failed'
        } else if (ageInMinutes > 15) {
          // Plus de 15min = définitivement échoué
          status = 'failed'  
        } else if (photo.analysis && !photo.score) {
          // A une analyse mais pas de score = erreur parsing
          status = 'failed'
        } else if (photo.score && !photo.analysis) {
          // A un score mais pas d'analyse = données incohérentes
          status = 'failed'
        }
        // Sinon reste 'pending' si récent (< 5min)
      }
      
      return {
        id: photo.id,
        score: photo.score,
        analysisTone: photo.analysisTone,
        createdAt: photo.createdAt.toISOString(),
        userEmail: maskEmail(photo.user.email!), // Masquage sécurisé
        partialScores: photo.partialScores || '{}',
        filename: sanitizeFilename(photo.filename), // Nettoyer paths
        status
      }
    })

    // Traitement distribution
    const distributionMap = (distribution as any[]).reduce((acc, row) => {
      acc[row.category] = Number(row.count)
      return acc
    }, { excellent: 0, good: 0, average: 0, poor: 0 })

    // Traitement tones
    const toneMap = modeBreakdown.reduce((acc: Record<string, number>, item) => {
      const tone = item.analysisTone as string
      if (tone && ['artcritic', 'roast', 'professional'].includes(tone)) {
        acc[tone] = item._count
      }
      return acc
    }, { artcritic: 0, roast: 0, professional: 0 })

    // Calculer stats par statut
    const statusCount = sanitizedAnalytics.reduce((acc, photo) => {
      acc[photo.status]++
      return acc
    }, { completed: 0, pending: 0, failed: 0 })

    const response: PhotoAnalyticsResponse = {
      analytics: sanitizedAnalytics,
      totalCount,
      stats: {
        avgScore: avgScore._avg.score ? Math.round(avgScore._avg.score * 10) / 10 : 0,
        statusCount,
        distribution: distributionMap,
        toneBreakdown: toneMap as { artcritic: number; roast: number; professional: number }
      }
    }

    logger.info('📊 Photo analytics retrieved', {
      resultsCount: analytics.length,
      totalAvailable: totalCount,
      avgScore: response.stats.avgScore,
      filters
    }, req.user.id, ip)

    res.status(200).json(response)

  } catch (error) {
    logger.error('❌ Photo analytics failed', error, req.user.id, ip)
    
    await auditLogger.logSecurity('admin_action', {
      description: 'Error retrieving photo analytics',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false,
      riskLevel: 'medium'
    })

    res.status(500).json({ error: 'Erreur lors de la récupération des analytics' })
  }
})

/**
 * 🔒 MASQUAGE EMAIL SÉCURISÉ RGPD
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return 'user_***'
  
  const maskedLocal = localPart.length > 3 
    ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
    : '***'
  
  const [domainName, tld] = domain.split('.')
  const maskedDomain = domainName.length > 2
    ? domainName.substring(0, 1) + '*'.repeat(domainName.length - 1) + '.' + tld
    : '**.' + tld
    
  return `${maskedLocal}@${maskedDomain}`
}

/**
 * 🔒 NETTOYAGE FILENAME (éviter path traversal)
 */
function sanitizeFilename(filename: string): string {
  if (!filename) return 'unknown'
  
  // Extraire juste le nom de fichier (pas de path)
  const cleanName = filename.split('/').pop() || filename
  
  // Limiter longueur + caractères sûrs
  return cleanName.substring(0, 50).replace(/[^\w\-_.]/g, '')
}