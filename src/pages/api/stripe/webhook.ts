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

    // 🚨 LOGGING CRITIQUE pour debugging
    console.log('=== WEBHOOK STRIPE REÇU ===')
    console.log('Event ID:', event.id)
    console.log('Event Type:', event.type)
    console.log('Event Created:', new Date(event.created * 1000).toISOString())
    console.log('Data Object:', JSON.stringify(event.data.object, null, 2))
    
    logger.info('Stripe webhook received', { 
      eventId: event.id,
      eventType: event.type, 
      created: event.created 
    }, undefined, ip)

    // ✅ RÉPONDRE 200 IMMÉDIATEMENT (bonne pratique Stripe)
    res.status(200).json({ received: true, eventId: event.id })

    // ⚡ TRAITEMENT ASYNCHRONE (évite timeouts)
    setImmediate(async () => {
      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object
            const userId = session.metadata?.userId

            if (!userId) {
              logger.error('userId missing in metadata', { sessionId: session.id }, undefined, ip)
              return
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
              // Paiement unique - déterminer le type selon le price_id
              const priceType = session.metadata?.priceType || 'unknown'
              
              if (priceType === 'starter') {
                // Activer le starter pack
                const { activateStarterPack } = await import('@/services/subscription')
                await activateStarterPack(userId)
                logger.info('Starter Pack activated', { userId, amount: session.amount_total }, userId, ip)
              } else {
                // Paiement unique (annual)
                await updateUserSubscription(userId, 'annual', {
                  customerId: session.customer as string
                })
                logger.info('Annual subscription activated', { userId }, userId, ip)
              }
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
              return
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
              return
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
      } catch (asyncError) {
        console.error('=== ERREUR TRAITEMENT WEBHOOK ASYNC ===')
        console.error('Event ID:', event.id)
        console.error('Event Type:', event.type)
        console.error('Error:', asyncError)
        logger.error('Async webhook processing error', { 
          eventId: event.id, 
          eventType: event.type, 
          error: asyncError 
        }, undefined, ip)
      }
    })

  } catch (error) {
    logger.error('Stripe webhook error', error, undefined, ip)
    res.status(500).json({ 
      error: 'Erreur traitement webhook',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}