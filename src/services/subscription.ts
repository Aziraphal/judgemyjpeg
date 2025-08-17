import { prisma } from '@/lib/prisma'

export interface UserSubscription {
  id: string
  subscriptionStatus: 'free' | 'premium' | 'lifetime'
  monthlyAnalysisCount: number
  maxMonthlyAnalyses: number
  canAnalyze: boolean
  daysUntilReset?: number
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      subscriptionStatus: true,
      monthlyAnalysisCount: true,
      lastAnalysisReset: true,
      currentPeriodEnd: true
    }
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  // Vérifier si on doit réinitialiser le compteur mensuel
  const now = new Date()
  const lastReset = new Date(user.lastAnalysisReset)
  const shouldReset = (
    now.getMonth() !== lastReset.getMonth() || 
    now.getFullYear() !== lastReset.getFullYear()
  )

  let currentCount = user.monthlyAnalysisCount

  if (shouldReset && user.subscriptionStatus === 'free') {
    // Réinitialiser le compteur pour les utilisateurs gratuits
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyAnalysisCount: 0,
        lastAnalysisReset: now
      }
    })
    currentCount = 0
  }

  // Déterminer les limites selon le plan
  const limits = {
    free: 3,
    premium: 999999, // Illimité
    lifetime: 999999  // Illimité
  }

  const maxAnalyses = limits[user.subscriptionStatus as keyof typeof limits] || 3
  const canAnalyze = ['premium', 'lifetime'].includes(user.subscriptionStatus) || currentCount < maxAnalyses

  // Calculer les jours jusqu'au reset pour les utilisateurs gratuits
  let daysUntilReset: number | undefined
  if (user.subscriptionStatus === 'free') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return {
    id: user.id,
    subscriptionStatus: user.subscriptionStatus as 'free' | 'premium' | 'lifetime',
    monthlyAnalysisCount: currentCount,
    maxMonthlyAnalyses: maxAnalyses,
    canAnalyze,
    daysUntilReset
  }
}

export async function incrementAnalysisCount(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription.canAnalyze) {
    throw new Error('Limite d\'analyses atteinte pour ce mois')
  }

  if (subscription.subscriptionStatus === 'free') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyAnalysisCount: {
          increment: 1
        }
      }
    })
  }
  // Pas besoin d'incrémenter pour les utilisateurs premium/lifetime
}

export async function updateUserSubscription(
  userId: string, 
  subscriptionStatus: 'free' | 'premium' | 'lifetime',
  stripeData?: {
    customerId?: string
    subscriptionId?: string
    currentPeriodEnd?: Date
  }
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus,
      stripeCustomerId: stripeData?.customerId,
      stripeSubscriptionId: stripeData?.subscriptionId,
      currentPeriodEnd: stripeData?.currentPeriodEnd,
      // Reset du compteur si upgrade
      ...(subscriptionStatus !== 'free' && { monthlyAnalysisCount: 0 })
    }
  })
}