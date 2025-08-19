import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'

interface RefundRequest {
  userId: string
  reason?: string
  adminNotes?: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, reason = 'Demande utilisateur', adminNotes }: RefundRequest = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' })
    }

    // Récupérer les infos utilisateur et abonnement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        currentPeriodEnd: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'Aucun compte Stripe associé' })
    }

    // Vérifier si éligible au remboursement
    const now = new Date()
    const subscriptionStart = user.createdAt
    const daysSinceStart = Math.floor((now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24))

    // Politique de remboursement
    let refundAmount = 0
    let refundReason = ''

    if (user.subscriptionStatus === 'annual') {
      // Plan annuel : remboursement prorata si > 14 jours
      if (daysSinceStart <= 14) {
        // Remboursement intégral sous 14 jours
        refundAmount = 7900 // 79€ en centimes
        refundReason = 'Remboursement intégral (droit de rétractation 14j)'
      } else if (user.currentPeriodEnd && user.currentPeriodEnd > now) {
        // Remboursement prorata du reste de l'année
        const totalDays = 365
        const remainingDays = Math.floor((user.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (remainingDays > 0) {
          refundAmount = Math.round((remainingDays / totalDays) * 7900) // Prorata des jours restants
          refundReason = `Remboursement prorata (${remainingDays} jours restants sur 365)`
        }
      }
    } else if (user.subscriptionStatus === 'premium') {
      // Plan mensuel : remboursement sous 14 jours uniquement
      if (daysSinceStart <= 14) {
        refundAmount = 998 // 9,98€ en centimes
        refundReason = 'Remboursement intégral (droit de rétractation 14j)'
      } else {
        return res.status(400).json({ 
          error: 'Plan mensuel : remboursement uniquement sous 14 jours',
          daysSinceStart 
        })
      }
    } else {
      return res.status(400).json({ 
        error: 'Plan gratuit : aucun remboursement nécessaire' 
      })
    }

    if (refundAmount <= 0) {
      return res.status(400).json({ 
        error: 'Aucun montant à rembourser',
        daysSinceStart,
        subscriptionStatus: user.subscriptionStatus
      })
    }

    // Récupérer les paiements Stripe pour trouver le charge à rembourser
    const payments = await stripe.paymentIntents.list({
      customer: user.stripeCustomerId,
      limit: 10
    })

    const lastSuccessfulPayment = payments.data.find(
      payment => payment.status === 'succeeded' && payment.amount >= refundAmount
    )

    if (!lastSuccessfulPayment) {
      return res.status(400).json({ 
        error: 'Aucun paiement éligible trouvé pour le remboursement' 
      })
    }

    // Créer le remboursement Stripe
    const refund = await stripe.refunds.create({
      payment_intent: lastSuccessfulPayment.id,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        userId: user.id,
        originalReason: reason,
        refundType: daysSinceStart <= 14 ? 'retractation' : 'prorata',
        adminNotes: adminNotes || ''
      }
    })

    // Mettre à jour le statut utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'free',
        monthlyAnalysisCount: 0,
        stripeSubscriptionId: null,
        currentPeriodEnd: null
      }
    })

    // Log pour audit
    await prisma.auditLog.create({
      data: {
        userId: userId,
        email: user.email,
        ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        eventType: 'refund_processed',
        description: `Remboursement ${refundAmount/100}€ - ${refundReason}`,
        metadata: JSON.stringify({
          stripeRefundId: refund.id,
          originalAmount: lastSuccessfulPayment.amount,
          refundAmount,
          daysSinceStart,
          reason,
          adminNotes
        }),
        riskLevel: 'medium',
        success: true
      }
    })

    logger.info('Prorata refund processed', {
      userId,
      refundId: refund.id,
      amount: refundAmount,
      reason: refundReason
    })

    res.status(200).json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        currency: 'eur',
        reason: refundReason,
        status: refund.status
      },
      user: {
        id: user.id,
        email: user.email,
        newStatus: 'free'
      },
      details: {
        daysSinceStart,
        originalSubscription: user.subscriptionStatus,
        refundType: daysSinceStart <= 14 ? 'retractation' : 'prorata'
      }
    })

  } catch (error: any) {
    logger.error('Prorata refund error', error)
    
    if (error?.type === 'StripeError') {
      return res.status(400).json({
        error: 'Erreur Stripe',
        details: error.message
      })
    }

    return res.status(500).json({ 
      error: 'Erreur lors du remboursement',
      details: 'Contactez le support technique'
    })
  }
}

export default withAdminAuth(handler)