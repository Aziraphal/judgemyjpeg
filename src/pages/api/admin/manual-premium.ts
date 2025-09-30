import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger, getClientIP } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const ip = getClientIP(req)

  // Vérifier que l'utilisateur est admin
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true, email: true }
  })

  if (!adminUser?.isAdmin) {
    logger.warn('Unauthorized admin access attempt', { email: session.user.email }, undefined, ip)
    return res.status(403).json({ error: 'Accès non autorisé' })
  }

  if (req.method === 'POST') {
    // Accorder le premium manuel
    const { userId, reason } = req.body

    if (!userId || !reason) {
      return res.status(400).json({ error: 'userId et reason requis' })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          manualPremiumAccess: true,
          manualPremiumReason: reason,
          manualPremiumGrantedAt: new Date(),
          manualPremiumGrantedBy: adminUser.email
        },
        select: {
          id: true,
          email: true,
          manualPremiumAccess: true,
          manualPremiumReason: true,
          manualPremiumGrantedAt: true
        }
      })

      logger.info('Manual premium granted', {
        targetUserId: userId,
        targetEmail: user.email,
        reason,
        grantedBy: adminUser.email
      }, adminUser.email, ip)

      return res.status(200).json({
        success: true,
        user
      })
    } catch (error) {
      logger.error('Failed to grant manual premium', error, adminUser.email, ip)
      return res.status(500).json({ error: 'Erreur lors de l\'attribution' })
    }
  }

  if (req.method === 'DELETE') {
    // Révoquer le premium manuel
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          manualPremiumAccess: false,
          manualPremiumReason: null,
          manualPremiumGrantedAt: null,
          manualPremiumGrantedBy: null
        },
        select: {
          id: true,
          email: true,
          manualPremiumAccess: true
        }
      })

      logger.info('Manual premium revoked', {
        targetUserId: userId,
        targetEmail: user.email,
        revokedBy: adminUser.email
      }, adminUser.email, ip)

      return res.status(200).json({
        success: true,
        user
      })
    } catch (error) {
      logger.error('Failed to revoke manual premium', error, adminUser.email, ip)
      return res.status(500).json({ error: 'Erreur lors de la révocation' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
