import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { updateUserSubscription } from '@/services/subscription'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Protection simple
  const adminSecret = req.headers['x-admin-secret']
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  try {
    const { userEmail, subscriptionType, manual = false } = req.body

    if (!userEmail || !subscriptionType) {
      return res.status(400).json({ error: 'Email et type d\'abonnement requis' })
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    console.log('=== DIAGNOSTIC SUBSCRIPTION ===')
    console.log('User found:', {
      id: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      currentPeriodEnd: user.currentPeriodEnd
    })

    // Forcer l'activation de l'abonnement
    if (manual) {
      await updateUserSubscription(user.id, subscriptionType, {
        customerId: user.stripeCustomerId || `manual_${user.id}`,
        subscriptionId: subscriptionType === 'premium' ? `manual_sub_${user.id}` : undefined,
        currentPeriodEnd: subscriptionType === 'premium' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
          : undefined
      })

      console.log(`MANUAL ACTIVATION: ${subscriptionType} for user ${user.id}`)
    }

    // Re-récupérer l'utilisateur après update
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    res.status(200).json({
      success: true,
      message: manual ? `Abonnement ${subscriptionType} activé manuellement` : 'Diagnostic terminé',
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        subscriptionStatus: updatedUser?.subscriptionStatus,
        stripeCustomerId: updatedUser?.stripeCustomerId,
        stripeSubscriptionId: updatedUser?.stripeSubscriptionId,
        currentPeriodEnd: updatedUser?.currentPeriodEnd
      }
    })

  } catch (error) {
    console.error('Fix subscription error:', error)
    res.status(500).json({ 
      error: 'Erreur lors de la correction',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}