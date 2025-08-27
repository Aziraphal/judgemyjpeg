import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        page = '1', 
        limit = '20', 
        status, 
        type, 
        rating,
        search 
      } = req.query

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
      
      // Construire les filtres
      const where: any = {}
      
      if (status && status !== 'all') {
        where.status = status
      }
      
      if (type && type !== 'all') {
        where.type = type
      }
      
      if (rating && rating !== 'all') {
        where.rating = parseInt(rating as string)
      }
      
      if (search) {
        where.OR = [
          { message: { contains: search as string, mode: 'insensitive' } },
          { title: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ]
      }

      // Récupérer les feedbacks avec pagination
      const [feedbacks, total] = await Promise.all([
        prisma.feedback.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                subscriptionStatus: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.feedback.count({ where })
      ])

      // Stats rapides
      const stats = await prisma.feedback.groupBy({
        by: ['type'],
        _count: { _all: true }
      })

      res.json({
        feedbacks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat.type] = stat._count._all
          return acc
        }, {} as Record<string, number>)
      })

    } catch (error) {
      logger.error('Admin feedbacks error:', error)
      res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks' })
    }
  } 
  
  else if (req.method === 'PATCH') {
    // Mettre à jour le statut d'un feedback
    try {
      const { id, status, adminNotes } = req.body

      if (!id || !status) {
        return res.status(400).json({ error: 'ID et statut requis' })
      }

      const validStatuses = ['new', 'read', 'implemented', 'ignored']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' })
      }

      const updatedFeedback = await prisma.feedback.update({
        where: { id },
        data: {
          status,
          adminNotes: adminNotes || null,
          updatedAt: new Date()
        }
      })

      res.json({ success: true, feedback: updatedFeedback })

    } catch (error) {
      logger.error('Update feedback error:', error)
      res.status(500).json({ error: 'Erreur lors de la mise à jour' })
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

export default withAdminAuth(handler)