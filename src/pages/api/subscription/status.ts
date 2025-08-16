import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getUserSubscription } from '@/services/subscription'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    })

    if (!user) {
      logger.error('User not found for subscription status', { email: req.user.email }, req.user.id, ip)
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const subscription = await getUserSubscription(user.id)

    console.log('User email:', user.email)
    console.log('Subscription status:', subscription)

    res.status(200).json({ subscription })

  } catch (error) {
    logger.error('Subscription status failed', error, req.user.id, ip)
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du statut',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
})