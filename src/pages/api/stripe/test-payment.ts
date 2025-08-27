import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { updateUserSubscription } from '@/services/subscription'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // N'autoriser qu'en développement
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Non autorisé en production' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const { subscriptionType } = req.body

    if (!subscriptionType || !['premium', 'lifetime'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Type d\'abonnement invalide' })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Simuler l'activation de l'abonnement
    await updateUserSubscription(user.id, subscriptionType, {
      customerId: `test_customer_${user.id}`,
      subscriptionId: subscriptionType === 'premium' ? `test_sub_${user.id}` : undefined,
      currentPeriodEnd: subscriptionType === 'premium' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
        : undefined
    })

    logger.debug(`TEST: ${subscriptionType} subscription activated for user ${user.id}`)

    res.status(200).json({ 
      success: true,
      message: `Abonnement ${subscriptionType} activé (test)`,
      subscriptionType
    })

  } catch (error) {
    logger.error('Test payment error:', error)
    res.status(500).json({ 
      error: 'Erreur lors du test de paiement',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}