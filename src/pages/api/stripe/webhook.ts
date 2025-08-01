import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { updateUserSubscription } from '@/services/subscription'
import { logger, getClientIP } from '@/lib/logger'
import { buffer } from 'micro'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)

  try {
    const body = await buffer(req)
    const signature = req.headers['stripe-signature'] as string

    if (!STRIPE_CONFIG.WEBHOOK_SECRET) {
      logger.error('STRIPE_WEBHOOK_SECRET missing', {}, undefined, ip)
      return res.status(500).json({ error: 'Configuration webhook manquante' })
    }

    // Vérifier la signature Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    )

    logger.info('Stripe webhook received', { eventType: event.type }, undefined, ip)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (!userId) {
          logger.error('userId missing in metadata', { sessionId: session.id }, undefined, ip)
          return res.status(400).json({ error: 'userId manquant' })
        }

        if (session.mode === 'subscription') {
          // Abonnement mensuel
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          await updateUserSubscription(userId, 'premium', {
            customerId: session.customer as string,
            subscriptionId: subscription.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          })

          logger.info('Premium subscription activated', { userId }, userId, ip)
        } else {
          // Paiement unique (lifetime)
          await updateUserSubscription(userId, 'lifetime', {
            customerId: session.customer as string
          })

          logger.info('Lifetime subscription activated', { userId }, userId, ip)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Trouver l'utilisateur par customer ID
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId }
        })

        if (!user) {
          logger.error('User not found for customer', { customerId }, undefined, ip)
          return res.status(404).json({ error: 'Utilisateur non trouvé' })
        }

        // Mettre à jour les informations d'abonnement
        await updateUserSubscription(user.id, 'premium', {
          customerId,
          subscriptionId: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        })

        logger.info('Subscription updated', { userId: user.id }, user.id, ip)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Trouver l'utilisateur par customer ID
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId }
        })

        if (!user) {
          logger.error('User not found for customer', { customerId }, undefined, ip)
          return res.status(404).json({ error: 'Utilisateur non trouvé' })
        }

        // Rétrograder vers gratuit
        await updateUserSubscription(user.id, 'free')

        logger.info('Subscription cancelled', { userId: user.id }, user.id, ip)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        logger.warn('Payment failed', { customerId }, undefined, ip)
        // Ici on pourrait envoyer un email de notification
        break
      }

      default:
        logger.warn('Unhandled webhook event', { eventType: event.type }, undefined, ip)
    }

    res.status(200).json({ received: true })

  } catch (error) {
    logger.error('Stripe webhook error', error, undefined, ip)
    res.status(500).json({ 
      error: 'Erreur traitement webhook',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}