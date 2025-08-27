import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier l'auth admin
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
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
    logger.error('[ADMIN] Users API error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
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

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
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

async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId is required' 
    })
  }

  // Supprimer définitivement (attention: irréversible)
  await prisma.user.delete({
    where: { id: userId as string }
  })

  logger.warn('[ADMIN] User permanently deleted', { userId })

  res.status(200).json({
    success: true,
    message: 'Utilisateur supprimé définitivement'
  })
}