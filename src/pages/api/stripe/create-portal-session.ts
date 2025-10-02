import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * API pour créer une session Stripe Customer Portal
 * Permet aux utilisateurs de gérer leur abonnement (annuler, changer de plan, mettre à jour la carte, etc.)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // Récupérer l'utilisateur avec son stripeCustomerId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        subscriptionStatus: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Vérifier que l'utilisateur a un Stripe Customer ID
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        error: 'Aucun compte Stripe associé. Vous devez d\'abord souscrire à un abonnement.'
      })
    }

    // Créer une session Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.NODE_ENV === 'production'
        ? 'https://www.judgemyjpeg.fr/settings?tab=subscription'
        : 'http://localhost:3008/settings?tab=subscription',
    })

    logger.info('Customer Portal session created', {
      userId: session.user.email,
      customerId: user.stripeCustomerId,
      subscriptionStatus: user.subscriptionStatus
    })

    return res.status(200).json({
      url: portalSession.url
    })

  } catch (error: any) {
    logger.error('Erreur création Customer Portal session:', error)
    return res.status(500).json({
      error: 'Erreur lors de la création de la session de gestion',
      details: error.message
    })
  }
}
