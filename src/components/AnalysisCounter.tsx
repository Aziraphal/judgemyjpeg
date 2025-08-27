import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from '@/hooks/useTranslations'
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
  const { t } = useTranslations()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        
        // Déclencher callback si limite atteinte
        if (!data.subscription.canAnalyze && onLimitReached) {
          onLimitReached()
        }
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
              {t('nav.login')} {t('analyze.title').toLowerCase()}
            </p>
            <p className="text-xs text-text-muted">
              {t('analyze.free_analyses', { count: '3' })}/mois
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
              {t('analyze.analyses_unlimited')}
            </p>
            <p className="text-xs text-text-muted">
              {t('pricing.current_plan')} {subscription.subscriptionStatus === 'annual' ? t('pricing.annual_plan') : t('pricing.premium_plan')}
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
                {t('analyze.limit_reached')}
              </p>
              <p className="text-xs text-text-muted">
                {subscription.daysUntilReset ? 
                  `Reset dans ${subscription.daysUntilReset} jour${subscription.daysUntilReset > 1 ? 's' : ''}` :
                  'Reset bientôt'
                }
              </p>
            </div>
          </div>
          {showUpgradeButton && (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-xs px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-md hover:bg-neon-pink/30 transition-colors"
            >
              {t('analyze.upgrade')}
            </button>
          )}
        </div>
        {subscription.daysUntilReset && (
          <div className="mt-2 text-xs text-center text-text-muted">
            Reset dans {subscription.daysUntilReset} jour{subscription.daysUntilReset > 1 ? 's' : ''}
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
                {t('analyze.last_analysis')}
              </p>
              <p className="text-xs text-text-muted">
                {subscription.starterPack.hasStarterPack ? 
                  `${subscription.starterPack.analysisCount} du Starter Pack` :
                  `${remainingAnalyses} analyse mensuelle`
                }
              </p>
            </div>
          </div>
          {showUpgradeButton && (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-xs px-2 py-1 bg-neon-pink/20 text-neon-pink rounded-md hover:bg-neon-pink/30 transition-colors"
            >
              {t('analyze.upgrade')}
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
              {t('analyze.analyses_remaining', { count: totalAvailable.toString() })}
            </p>
            <div className="text-xs text-text-muted">
              {subscription.starterPack.hasStarterPack ? (
                <span>
                  {remainingAnalyses} mensuelles + {subscription.starterPack.analysisCount} Starter Pack
                </span>
              ) : (
                <span>
                  Plan gratuit • Reset dans {subscription.daysUntilReset} jour{subscription.daysUntilReset && subscription.daysUntilReset > 1 ? 's' : ''}
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
            Upgrade
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

