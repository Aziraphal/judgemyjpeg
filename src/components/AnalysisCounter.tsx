import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'

declare global {
  interface Window {
    refreshAnalysisCounter?: () => void
  }
}

interface AnalysisCounterProps {
  onLimitReached?: () => void
  className?: string
  showUpgradeButton?: boolean
}

interface SubscriptionData {
  subscriptionStatus: 'free' | 'premium' | 'annual'
  monthlyAnalysisCount: number
  maxMonthlyAnalyses: number
  canAnalyze: boolean
  daysUntilReset?: number
  starterPack: {
    hasStarterPack: boolean
    purchased: boolean
    analysisCount: number
    sharesCount: number
    exportsCount: number
  }
}

export default function AnalysisCounter({
  onLimitReached,
  className = "",
  showUpgradeButton = false
}: AnalysisCounterProps) {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // L'API retourne directement les données, pas dans un objet "subscription"
      setSubscription(data)

      // Déclencher callback si limite atteinte
      if (!data.canAnalyze && onLimitReached) {
        onLimitReached()
      }
    } catch (error) {
      logger.error('Erreur chargement statut analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }
    fetchSubscription()
  }, [session?.user])

  // Actualiser après une analyse
  const refreshCounter = () => {
    fetchSubscription()
  }

  // Expose la fonction refresh pour utilisation externe
  useEffect(() => {
    window.refreshAnalysisCounter = refreshCounter
    return () => {
      delete window.refreshAnalysisCounter
    }
  }, [])

  if (loading) {
    return (
      <div className={`glass-card p-3 ${className}`}>
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-cosmic-glass rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-cosmic-glass rounded w-3/4 mb-1"></div>
            <div className="h-2 bg-cosmic-glass rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className={`glass-card p-3 border border-neon-cyan/30 ${className}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-sm font-semibold text-neon-cyan">
              {t.counter.freePlan}
            </p>
            <p className="text-xs text-text-muted">
              3/mois
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return null
  }

  // Calculer les analyses restantes
  const remainingAnalyses = subscription.maxMonthlyAnalyses - subscription.monthlyAnalysisCount
  const totalAvailable = remainingAnalyses + (subscription.starterPack.hasStarterPack ? subscription.starterPack.analysisCount : 0)

  // Utilisateurs premium/annuel
  if (['premium', 'annual'].includes(subscription.subscriptionStatus)) {
    return (
      <div className={`glass-card p-3 border border-neon-pink/50 bg-neon-pink/5 ${className}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {subscription.subscriptionStatus === 'annual' ? '📅' : '💎'}
          </span>
          <div>
            <p className="text-sm font-semibold text-neon-pink">
              {t.counter.unlimitedAnalyses}
            </p>
            <p className="text-xs text-text-muted">
              {t.counter.currentPlan}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Utilisateurs gratuits - cas critique (0 analyses)
  if (totalAvailable === 0 || !subscription.canAnalyze) {
    return (
      <div className={`glass-card p-3 border border-red-500/50 bg-red-500/10 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-400">
                {t.counter.monthlyAnalyses} (0/{subscription.maxMonthlyAnalyses})
              </p>
              <p className="text-xs text-text-muted">
                {subscription.daysUntilReset ?
                  `${t.counter.resetIn} ${subscription.daysUntilReset} ${t.counter.days}` :
                  `${t.counter.resetIn} 0 ${t.counter.days}`
                }
              </p>
            </div>
          </div>
          {showUpgradeButton && (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-xs px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-md hover:bg-neon-pink/30 transition-colors"
            >
              {t.counter.upgrade}
            </button>
          )}
        </div>
        {subscription.daysUntilReset && (
          <div className="mt-2 text-xs text-center text-text-muted">
            {t.counter.resetIn} {subscription.daysUntilReset} {t.counter.days}
          </div>
        )}
      </div>
    )
  }

  // Utilisateurs gratuits - dernière analyse
  if (totalAvailable === 1) {
    return (
      <div className={`glass-card p-3 border border-yellow-500/50 bg-yellow-500/10 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-sm font-semibold text-yellow-400">
                {t.counter.monthlyAnalyses} (1/{subscription.maxMonthlyAnalyses})
              </p>
              <p className="text-xs text-text-muted">
                {subscription.starterPack.hasStarterPack ?
                  `${subscription.starterPack.analysisCount} ${t.counter.starterPack}` :
                  t.counter.freePlan
                }
              </p>
            </div>
          </div>
          {showUpgradeButton && (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-xs px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-md hover:bg-neon-pink/30 transition-colors"
            >
              {t.counter.upgrade}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Utilisateurs gratuits - analyses restantes
  const progressPercentage = ((subscription.monthlyAnalysisCount) / subscription.maxMonthlyAnalyses) * 100

  return (
    <div className={`glass-card p-3 border border-neon-cyan/30 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="text-sm font-semibold text-neon-cyan">
              {t.counter.monthlyAnalyses} ({subscription.monthlyAnalysisCount}/{subscription.maxMonthlyAnalyses})
            </p>
            <div className="text-xs text-text-muted">
              {subscription.starterPack.hasStarterPack ? (
                <span>
                  {remainingAnalyses} + {subscription.starterPack.analysisCount} {t.counter.starterPack}
                </span>
              ) : (
                <span>
                  {t.counter.freePlan} • {t.counter.resetIn} {subscription.daysUntilReset} {t.counter.days}
                </span>
              )}
            </div>
          </div>
        </div>
        {showUpgradeButton && totalAvailable <= 2 && (
          <button
            onClick={() => window.location.href = '/pricing'}
            className="text-xs px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-md hover:bg-neon-pink/30 transition-colors"
          >
            {t.counter.upgrade}
          </button>
        )}
      </div>
      
      {/* Barre de progression pour analyses mensuelles seulement */}
      {!subscription.starterPack.hasStarterPack && (
        <div className="mt-2">
          <div className="w-full bg-cosmic-glass rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                remainingAnalyses > 1 
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-pink' 
                  : 'bg-gradient-to-r from-yellow-500 to-red-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

