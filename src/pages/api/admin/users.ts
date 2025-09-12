import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logger, getClientIP } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { AuditLogger } from '@/lib/audit-trail'

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const ip = getClientIP(req)
  
  // 🔒 VÉRIFICATION ADMIN
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    logger.warn('🚨 TENTATIVE ACCÈS NON AUTORISÉ - Users API', {
      userId: req.user.id,
      email: req.user.email,
    }, req.user.id, ip)
    return res.status(403).json({ success: false, message: 'Accès interdit' })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res)
      case 'PATCH':
        return await handleUpdateUser(req, res)
      case 'DELETE':
        return await handleDeleteUser(req, res)
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('[ADMIN] Users API error:', error, req.user.id, ip)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
})

async function handleGetUsers(req: AuthenticatedRequest, res: NextApiResponse) {
  const { search, status, subscription, page = '1', limit = '20' } = req.query
  
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  // Construire les filtres
  const where: any = {}
  
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { name: { contains: search as string, mode: 'insensitive' } }
    ]
  }

  if (status === 'active') {
    where.emailVerified = { not: null }
  } else if (status === 'inactive') {
    where.emailVerified = null
  }

  // Récupérer les utilisateurs avec leurs abonnements
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripeSubscriptionId: true,
        photos: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            photos: true,
            sessions: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ])

  // Enrichir avec des statistiques
  const enrichedUsers = users.map(user => {
    const isActive = user.emailVerified !== null
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || 'Utilisateur anonyme',
      avatar: user.image,
      status: isActive ? 'active' : 'inactive',
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
      lastActive: user.updatedAt,
      subscription: user.subscriptionStatus !== 'free' ? {
        type: user.subscriptionStatus,
        status: user.stripeSubscriptionId ? 'active' : 'inactive',
        expiresAt: user.currentPeriodEnd,
        priceId: user.stripeSubscriptionId
      } : null,
      stats: {
        totalAnalyses: user._count.photos,
        activeSessions: user._count.sessions
      }
    }
  })

  logger.info('[ADMIN] Users retrieved', { 
    count: users.length,
    total: totalCount,
    filters: { search, status, subscription }
  })

  res.status(200).json({
    success: true,
    data: {
      users: enrichedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    }
  })
}

async function handleUpdateUser(req: AuthenticatedRequest, res: NextApiResponse) {
  const { userId, action, data } = req.body

  if (!userId || !action) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId and action are required' 
    })
  }

  switch (action) {
    case 'suspend':
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: null }
      })
      
      logger.info('[ADMIN] User suspended', { userId })
      break

    case 'reactivate':
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() }
      })
      
      logger.info('[ADMIN] User reactivated', { userId })
      break

    case 'verify_email':
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() }
      })
      
      logger.info('[ADMIN] Email verified for user', { userId })
      break

    case 'update_profile':
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data?.name,
          email: data?.email
        }
      })
      
      logger.info('[ADMIN] User profile updated', { userId, data })
      break

    default:
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action' 
      })
  }

  res.status(200).json({
    success: true,
    message: 'Action executée avec succès'
  })
}

async function handleDeleteUser(req: AuthenticatedRequest, res: NextApiResponse) {
  const auditLogger = new AuditLogger(req)
  
  // Rate limiting strict pour suppression utilisateur (1 par minute)
  const rateLimitResult = await rateLimit(req, res, {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100,
    maxRequests: 1
  })

  if (!rateLimitResult.success) {
    const clientIP = getClientIP(req)
    
    await auditLogger.logSecurity('rate_limit_exceeded', {
      userId: undefined,
      email: 'unknown',
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown',
      eventType: 'rate_limit_exceeded',
      description: 'Tentative de suppression utilisateur - rate limit dépassé',
      riskLevel: 'high',
      success: false,
      metadata: { 
        resetTime: rateLimitResult.resetTime,
        timestamp: new Date().toISOString(),
        action: 'user_deletion'
      }
    })

    return res.status(429).json({ 
      success: false, 
      message: 'Trop de tentatives. Attendez 1 minute.',
      resetTime: rateLimitResult.resetTime
    })
  }

  const { email, secret } = req.body
  const clientIP = getClientIP(req)

  // Validation des champs requis
  if (!email || !secret) {
    await auditLogger.logSecurity('admin_action', {
      userId: undefined,
      email: email || 'unknown',
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown',
      eventType: 'admin_action',
      description: 'Tentative suppression utilisateur - données manquantes',
      riskLevel: 'high',
      success: false,
      metadata: { 
        missingFields: { email: !email, secret: !secret },
        timestamp: new Date().toISOString(),
        action: 'user_deletion_invalid_request'
      }
    })

    return res.status(400).json({ 
      success: false, 
      message: 'Email et secret admin requis' 
    })
  }

  // Validation du secret admin
  if (secret !== process.env.ADMIN_SECRET) {
    await auditLogger.logSecurity('admin_action', {
      userId: undefined,
      email,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown',
      eventType: 'admin_action',
      description: 'Tentative suppression utilisateur - secret admin invalide',
      riskLevel: 'critical',
      success: false,
      metadata: { 
        targetEmail: email,
        timestamp: new Date().toISOString(),
        action: 'user_deletion_unauthorized'
      }
    })

    return res.status(401).json({ 
      success: false, 
      message: 'Secret admin invalide' 
    })
  }

  try {
    // Vérifier que l'utilisateur existe et récupérer ses données pour audit
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: {
          select: {
            photos: true,
            collections: true,
            favorites: true,
            sessions: true,
            accounts: true
          }
        }
      }
    })

    if (!targetUser) {
      await auditLogger.logSecurity('admin_action', {
        userId: undefined,
        email,
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'] || 'unknown',
        eventType: 'admin_action',
        description: 'Tentative suppression utilisateur inexistant',
        riskLevel: 'medium',
        success: false,
        metadata: { 
          targetEmail: email,
          timestamp: new Date().toISOString(),
          action: 'user_deletion_not_found'
        }
      })

      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      })
    }

    // Log de l'état avant suppression pour audit
    await auditLogger.logSecurity('admin_action', {
      userId: targetUser.id,
      email: targetUser.email!,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown',
      eventType: 'admin_action',
      description: 'Début de suppression définitive utilisateur',
      riskLevel: 'critical',
      success: true,
      metadata: { 
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
        subscriptionStatus: targetUser.subscriptionStatus,
        userCreatedAt: targetUser.createdAt,
        dataToDelete: targetUser._count,
        timestamp: new Date().toISOString(),
        action: 'user_deletion_attempt'
      }
    })

    // Suppression définitive de l'utilisateur
    // Grâce aux relations onDelete: Cascade dans le schema Prisma,
    // toutes les données liées seront automatiquement supprimées
    const deletedUser = await prisma.user.delete({
      where: { id: targetUser.id }
    })

    // Log de confirmation de suppression
    await auditLogger.logSecurity('admin_action', {
      userId: undefined, // User supprimé
      email: deletedUser.email!,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown',
      eventType: 'admin_action',
      description: 'Suppression définitive utilisateur réussie',
      riskLevel: 'critical',
      success: true,
      metadata: { 
        deletedUserId: deletedUser.id,
        deletedUserEmail: deletedUser.email,
        dataDeletedCounts: targetUser._count,
        timestamp: new Date().toISOString(),
        action: 'user_deletion_success'
      }
    })

    logger.warn('[ADMIN] User permanently deleted with full audit trail', { 
      userId: targetUser.id,
      email: targetUser.email,
      dataDeleted: targetUser._count
    })

    return res.status(200).json({
      success: true,
      message: `✅ Utilisateur ${email} supprimé définitivement`,
      deletedData: {
        user: deletedUser.email,
        photosDeleted: targetUser._count.photos,
        collectionsDeleted: targetUser._count.collections,
        favoritesDeleted: targetUser._count.favorites,
        sessionsDeleted: targetUser._count.sessions,
        accountsDeleted: targetUser._count.accounts
      }
    })

  } catch (error) {
    logger.error('[ADMIN] Error deleting user:', error)
    
    await auditLogger.logSecurity('admin_action', {
      userId: undefined,
      email,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown',
      eventType: 'admin_action',
      description: 'Erreur lors de la suppression utilisateur',
      riskLevel: 'high',
      success: false,
      metadata: { 
        error: error instanceof Error ? error.message : String(error),
        targetEmail: email,
        timestamp: new Date().toISOString(),
        action: 'user_deletion_error'
      }
    })

    return res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur' 
    })
  }
}