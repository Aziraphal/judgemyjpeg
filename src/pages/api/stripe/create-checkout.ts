import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, createStripeCustomer, STRIPE_CONFIG } from '@/lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const { priceType } = req.body

    if (!priceType || !['starter', 'monthly', 'annual'].includes(priceType)) {
      return res.status(400).json({ error: 'Type de prix invalide' })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Vérifications selon le type de plan
    if (priceType === 'starter') {
      // Utiliser la fonction de service pour vérifier l'éligibilité
      const { canPurchaseStarterPack } = await import('@/services/subscription')
      const canPurchase = await canPurchaseStarterPack(user.id)
      
      if (!canPurchase) {
        if (user.subscriptionStatus !== 'free') {
          return res.status(400).json({ error: 'Le Starter Pack n\'est disponible que pour les comptes gratuits' })
        }
        if (user.starterPackPurchased ?? false) {
          return res.status(400).json({ error: 'Vous avez déjà acheté le Starter Pack (limité à 1 par compte)' })
        }
      }
    } else {
      // Vérifier qu'il n'est pas déjà premium/annual
      if (user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'annual') {
        return res.status(400).json({ error: 'Vous avez déjà un abonnement actif' })
      }
    }

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await createStripeCustomer(
        session.user.email,
        session.user.name || undefined
      )
      customerId = customer.id

      // Sauvegarder l'ID customer
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Déterminer le prix selon le type
    let priceId: string
    switch (priceType) {
      case 'starter':
        priceId = STRIPE_CONFIG.STARTER_PRICE_ID
        break
      case 'monthly':
        priceId = STRIPE_CONFIG.MONTHLY_PRICE_ID
        break
      case 'annual':
        priceId = STRIPE_CONFIG.ANNUAL_PRICE_ID
        break
      default:
        return res.status(400).json({ error: 'Type de prix non supporté' })
    }

    // Créer la session de checkout
    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      {
        userId: user.id,
        priceType,
        userEmail: session.user.email
      }
    )

    res.status(200).json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('Erreur création checkout:', error)
    res.status(500).json({ 
      error: 'Erreur lors de la création de la session de paiement',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}