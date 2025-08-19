import { prisma } from '@/lib/prisma'

export interface UserSubscription {
  id: string
  subscriptionStatus: 'free' | 'premium' | 'annual'
  monthlyAnalysisCount: number
  maxMonthlyAnalyses: number
  canAnalyze: boolean
  daysUntilReset?: number
  // Starter Pack
  starterPack: {
    hasStarterPack: boolean
    analysisCount: number
    sharesCount: number
    exportsCount: number
    activatedAt?: Date
  }
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      subscriptionStatus: true,
      monthlyAnalysisCount: true,
      lastAnalysisReset: true,
      currentPeriodEnd: true,
      // Starter Pack fields
      starterPackUsed: true,
      starterAnalysisCount: true,
      starterSharesCount: true,
      starterExportsCount: true,
      starterPackActivated: true
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
    annual: 999999   // Illimité
  }

  const maxAnalyses = limits[user.subscriptionStatus as keyof typeof limits] || 3
  
  // Vérifier si l'utilisateur peut analyser (plan premium/annual OU dans les limites OU starter pack)
  const hasStarterAnalyses = !user.starterPackUsed && user.starterAnalysisCount > 0
  const canAnalyze = ['premium', 'annual'].includes(user.subscriptionStatus) || 
                    currentCount < maxAnalyses || 
                    hasStarterAnalyses

  // Calculer les jours jusqu'au reset pour les utilisateurs gratuits
  let daysUntilReset: number | undefined
  if (user.subscriptionStatus === 'free') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return {
    id: user.id,
    subscriptionStatus: user.subscriptionStatus as 'free' | 'premium' | 'annual',
    monthlyAnalysisCount: currentCount,
    maxMonthlyAnalyses: maxAnalyses,
    canAnalyze,
    daysUntilReset,
    starterPack: {
      hasStarterPack: !user.starterPackUsed,
      analysisCount: user.starterAnalysisCount || 0,
      sharesCount: user.starterSharesCount || 0,
      exportsCount: user.starterExportsCount || 0,
      activatedAt: user.starterPackActivated || undefined
    }
  }
}

export async function incrementAnalysisCount(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription.canAnalyze) {
    throw new Error('Limite d\'analyses atteinte pour ce mois')
  }

  // Utiliser prioritairement les analyses du starter pack
  if (subscription.starterPack.hasStarterPack && subscription.starterPack.analysisCount > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        starterAnalysisCount: {
          decrement: 1
        }
      }
    })
  } else if (subscription.subscriptionStatus === 'free') {
    // Utiliser les analyses mensuelles gratuites
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyAnalysisCount: {
          increment: 1
        }
      }
    })
  }
  // Pas besoin d'incrémenter pour les utilisateurs premium/annual
}

export async function updateUserSubscription(
  userId: string, 
  subscriptionStatus: 'free' | 'premium' | 'annual',
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

// Nouvelles fonctions pour le Starter Pack
export async function canUseStarterShare(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { starterPackUsed: true, starterSharesCount: true, subscriptionStatus: true }
  })
  
  return user ? (
    ['premium', 'annual'].includes(user.subscriptionStatus) ||
    (!user.starterPackUsed && user.starterSharesCount > 0)
  ) : false
}

export async function canUseStarterExport(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { starterPackUsed: true, starterExportsCount: true, subscriptionStatus: true }
  })
  
  return user ? (
    ['premium', 'annual'].includes(user.subscriptionStatus) ||
    (!user.starterPackUsed && user.starterExportsCount > 0)
  ) : false
}

export async function useStarterShare(userId: string): Promise<void> {
  const canUse = await canUseStarterShare(userId)
  if (!canUse) {
    throw new Error('Aucun partage disponible dans votre starter pack')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      starterSharesCount: {
        decrement: 1
      }
    }
  })
}

export async function useStarterExport(userId: string): Promise<void> {
  const canUse = await canUseStarterExport(userId)
  if (!canUse) {
    throw new Error('Aucun export PDF disponible dans votre starter pack')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      starterExportsCount: {
        decrement: 1
      }
    }
  })
}