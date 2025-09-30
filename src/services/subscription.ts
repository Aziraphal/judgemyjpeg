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
    purchased: boolean
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
      starterPackPurchased: true,
      starterPackUsed: true,
      starterAnalysisCount: true,
      starterSharesCount: true,
      starterExportsCount: true,
      starterPackActivated: true,
      // Manual premium access
      manualPremiumAccess: true
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

  // Vérifier si l'utilisateur peut analyser (premium manuel OU plan premium/annual OU dans les limites OU starter pack acheté)
  const hasStarterAnalyses = (user.starterPackPurchased ?? false) && !(user.starterPackUsed ?? false) && (user.starterAnalysisCount ?? 0) > 0
  const canAnalyze = user.manualPremiumAccess ||
                    ['premium', 'annual'].includes(user.subscriptionStatus) ||
                    currentCount < maxAnalyses ||
                    hasStarterAnalyses

  // Calculer les jours jusqu'au reset pour les utilisateurs gratuits
  let daysUntilReset: number | undefined
  if (user.subscriptionStatus === 'free') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Si l'utilisateur a un accès premium manuel, on le traite comme premium illimité
  const effectiveStatus = user.manualPremiumAccess ? 'premium' : user.subscriptionStatus as 'free' | 'premium' | 'annual'
  const effectiveMaxAnalyses = user.manualPremiumAccess ? 999999 : maxAnalyses

  return {
    id: user.id,
    subscriptionStatus: effectiveStatus,
    monthlyAnalysisCount: currentCount,
    maxMonthlyAnalyses: effectiveMaxAnalyses,
    canAnalyze,
    daysUntilReset,
    starterPack: {
      hasStarterPack: (user.starterPackPurchased ?? false) && !(user.starterPackUsed ?? false),
      purchased: user.starterPackPurchased ?? false,
      analysisCount: user.starterAnalysisCount ?? 0,
      sharesCount: user.starterSharesCount ?? 0,
      exportsCount: user.starterExportsCount ?? 0,
      activatedAt: user.starterPackActivated || undefined
    }
  }
}

export async function incrementAnalysisCount(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription.canAnalyze) {
    throw new Error('Limite d\'analyses atteinte pour ce mois')
  }

  // Utiliser prioritairement les analyses du starter pack acheté
  if (subscription.starterPack.hasStarterPack && subscription.starterPack.analysisCount > 0) {
    const newCount = subscription.starterPack.analysisCount - 1
    await prisma.user.update({
      where: { id: userId },
      data: {
        starterAnalysisCount: newCount,
        // Marquer comme épuisé si plus d'analyses, partages et exports
        starterPackUsed: newCount === 0 && subscription.starterPack.sharesCount === 0 && subscription.starterPack.exportsCount === 0
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
    select: { starterPackUsed: true, starterSharesCount: true, subscriptionStatus: true, manualPremiumAccess: true }
  })

  return user ? (
    user.manualPremiumAccess ||
    ['premium', 'annual'].includes(user.subscriptionStatus) ||
    (!user.starterPackUsed && user.starterSharesCount > 0)
  ) : false
}

export async function canUseStarterExport(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { starterPackUsed: true, starterExportsCount: true, subscriptionStatus: true, manualPremiumAccess: true }
  })

  return user ? (
    user.manualPremiumAccess ||
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

  const subscription = await getUserSubscription(userId)
  const newCount = subscription.starterPack.exportsCount - 1

  await prisma.user.update({
    where: { id: userId },
    data: {
      starterExportsCount: newCount,
      // Marquer comme épuisé si plus d'analyses, partages et exports
      starterPackUsed: subscription.starterPack.analysisCount === 0 && subscription.starterPack.sharesCount === 0 && newCount === 0
    }
  })
}

// Fonction pour activer le starter pack après achat Stripe
export async function activateStarterPack(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { starterPackPurchased: true }
  })

  if (user?.starterPackPurchased) {
    throw new Error('Starter pack déjà acheté pour ce compte')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      starterPackPurchased: true,
      starterPackUsed: false,
      starterAnalysisCount: 10,
      starterSharesCount: 3,
      starterExportsCount: 3,
      starterPackActivated: new Date()
    }
  })
}

// Vérifier si l'utilisateur peut acheter le starter pack
export async function canPurchaseStarterPack(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { starterPackPurchased: true, subscriptionStatus: true }
  })

  return user ? (!(user.starterPackPurchased ?? false) && user.subscriptionStatus === 'free') : false
}