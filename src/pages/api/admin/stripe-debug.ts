import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Protection simple
  const adminSecret = req.headers['x-admin-secret']
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  try {
    const { userEmail } = req.query

    if (!userEmail || typeof userEmail !== 'string') {
      return res.status(400).json({ error: 'Email utilisateur requis' })
    }

    // 1. Chercher l'utilisateur en DB
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const debug: any = {
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        currentPeriodEnd: user.currentPeriodEnd
      },
      stripe: null,
      webhooks: null
    }

    // 2. Vérifier côté Stripe si on a un customer ID
    if (user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId)
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          limit: 10
        })
        const paymentIntents = await stripe.paymentIntents.list({
          customer: user.stripeCustomerId,
          limit: 10
        })

        debug.stripe = {
          customer: {
            id: customer.id,
            email: (customer as any).email,
            created: new Date((customer as any).created * 1000)
          },
          subscriptions: subscriptions.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            created: new Date(sub.created * 1000),
            current_period_end: new Date(sub.current_period_end * 1000)
          })),
          paymentIntents: paymentIntents.data.map(pi => ({
            id: pi.id,
            status: pi.status,
            amount: pi.amount,
            created: new Date(pi.created * 1000)
          }))
        }
      } catch (stripeError) {
        debug.stripe = { error: String(stripeError) }
      }
    }

    // 3. Vérifier les webhooks récents
    try {
      const events = await stripe.events.list({
        limit: 20,
        type: 'checkout.session.completed'
      })

      debug.webhooks = events.data
        .filter(event => {
          const session = event.data.object as any
          return session.customer_email === userEmail || 
                 session.metadata?.userEmail === userEmail
        })
        .map(event => ({
          id: event.id,
          type: event.type,
          created: new Date(event.created * 1000),
          data: event.data.object
        }))
    } catch (webhookError) {
      debug.webhooks = { error: String(webhookError) }
    }

    res.status(200).json({
      success: true,
      debug,
      recommendations: generateRecommendations(debug)
    })

  } catch (error) {
    logger.error('Stripe debug error:', error)
    res.status(500).json({ 
      error: 'Erreur lors du diagnostic',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}

function generateRecommendations(debug: any) {
  const recommendations = []

  if (!debug.user.stripeCustomerId) {
    recommendations.push('❌ Pas de Stripe Customer ID - Le paiement n\'a peut-être pas été initié correctement')
  }

  if (debug.user.subscriptionStatus === 'free' && debug.stripe?.paymentIntents?.length > 0) {
    recommendations.push('⚠️ Paiements détectés mais abonnement toujours gratuit - Problème de webhook')
  }

  if (debug.webhooks && Array.isArray(debug.webhooks) && debug.webhooks.length === 0) {
    recommendations.push('❌ Aucun webhook reçu pour cet utilisateur - Vérifier la configuration webhook')
  }

  if (debug.stripe?.subscriptions?.length > 0 && debug.user.subscriptionStatus === 'free') {
    recommendations.push('🔧 Abonnement actif côté Stripe mais pas en DB - Utiliser l\'API fix-subscription')
  }

  return recommendations
}