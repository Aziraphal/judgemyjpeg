import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { UserSubscription } from '@/services/subscription'
import { logger } from '@/lib/logger'

interface SubscriptionStatusProps {
  compact?: boolean
}

export default function SubscriptionStatus({ compact = false }: SubscriptionStatusProps) {
  const router = useRouter()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        // L'API retourne les données directement, pas dans data.subscription
        setSubscription(data)
      }
    } catch (error) {
      logger.error('Erreur chargement abonnement:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-cosmic-glass h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-cosmic-glass rounded w-3/4"></div>
            <div className="h-4 bg-cosmic-glass rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="glass-card p-4 border border-red-500/50">
        <p className="text-red-400">Impossible de charger le statut d'abonnement</p>
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (subscription.subscriptionStatus) {
      case 'annual':
        return {
          icon: '📅',
          label: 'Annuel',
          color: 'text-neon-cyan',
          bgColor: 'bg-neon-cyan/10',
          borderColor: 'border-neon-cyan/50'
        }
      case 'premium':
        return {
          icon: '💎',
          label: 'Premium',
          color: 'text-neon-pink',
          bgColor: 'bg-neon-pink/10',
          borderColor: 'border-neon-pink/50'
        }
      default:
        return {
          icon: '🆓',
          label: 'Gratuit',
          color: 'text-text-gray',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/50'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const isLimited = subscription.subscriptionStatus === 'free'
  const remainingAnalyses = subscription.maxMonthlyAnalyses - subscription.monthlyAnalysisCount

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <span className="text-lg">{statusConfig.icon}</span>
        <span className={`text-sm font-semibold ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
        {isLimited && (
          <span className="text-xs text-text-muted">
            {remainingAnalyses}/{subscription.maxMonthlyAnalyses}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`glass-card p-6 border ${statusConfig.borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{statusConfig.icon}</span>
          <div>
            <h3 className={`text-lg font-bold ${statusConfig.color}`}>
              Plan {statusConfig.label}
            </h3>
            {subscription.subscriptionStatus === 'free' && (
              <p className="text-text-muted text-sm">
                {remainingAnalyses} analyses restantes ce mois
              </p>
            )}
          </div>
        </div>

        {subscription.subscriptionStatus === 'free' && (
          <button
            onClick={() => router.push('/pricing')}
            className="btn-neon-pink text-sm"
          >
            Upgrade 🚀
          </button>
        )}
      </div>

      {/* Barre de progression pour les utilisateurs gratuits */}
      {isLimited && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-gray">Analyses utilisées</span>
            <span className="text-text-white">
              {subscription.monthlyAnalysisCount}/{subscription.maxMonthlyAnalyses}
            </span>
          </div>
          
          <div className="w-full bg-cosmic-glass rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                remainingAnalyses > 1 
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-pink' 
                  : 'bg-gradient-to-r from-red-500 to-neon-pink'
              }`}
              style={{ 
                width: `${(subscription.monthlyAnalysisCount / subscription.maxMonthlyAnalyses) * 100}%` 
              }}
            />
          </div>

          {remainingAnalyses === 0 && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">
                ⚠️ Limite atteinte ! Plus d'analyses jusqu'au {subscription.daysUntilReset} jours.
              </p>
            </div>
          )}

          {remainingAnalyses === 1 && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-400 text-sm">
                🔔 Dernière analyse gratuite ! Pensez à passer Premium.
              </p>
            </div>
          )}

          {subscription.daysUntilReset && (
            <div className="mt-3 text-xs text-text-muted text-center">
              ⏰ Réinitialisation dans {subscription.daysUntilReset} jour{subscription.daysUntilReset > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Comparaison des plans */}
      <div className="space-y-6">
        {subscription.subscriptionStatus === 'free' ? (
          <>
            {/* Plan actuel */}
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-neon-cyan mb-2">🆓 Plan Gratuit</h4>
              <p className="text-text-muted">Parfait pour découvrir l'IA photo</p>
            </div>

            {/* Comparaison des plans en grille */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Plan Gratuit */}
              <div className="bg-cosmic-glass border border-gray-500/50 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h5 className="text-lg font-bold text-neon-cyan">🆓 Gratuit</h5>
                  <div className="text-3xl font-bold text-neon-cyan mt-2 mb-1">0€</div>
                  <div className="text-text-muted text-sm">Pour toujours</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-gray text-sm">3 analyses/mois</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-gray text-sm">Mode Pro & Cassant</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-gray text-sm">6 langues</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400">✗</span>
                    <span className="text-text-muted text-sm">Images partageables</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400">✗</span>
                    <span className="text-text-muted text-sm">Insights avancés</span>
                  </div>
                </div>
                
                <div className="mt-4 p-2 bg-neon-cyan/10 rounded text-center">
                  <span className="text-neon-cyan font-bold text-sm">PLAN ACTUEL</span>
                </div>
              </div>

              {/* Plan Premium */}
              <div className="bg-gradient-to-b from-neon-pink/20 to-neon-cyan/20 border border-neon-pink/50 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-neon-pink text-black px-3 py-1 rounded-full text-xs font-bold">POPULAIRE</span>
                </div>
                
                <div className="text-center mb-4">
                  <h5 className="text-lg font-bold text-neon-pink">💎 Premium</h5>
                  <div className="text-3xl font-bold text-neon-pink mt-2 mb-1">9,99€</div>
                  <div className="text-text-muted text-sm">par mois</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm font-semibold">Analyses illimitées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Images Stories personnalisées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Insights IA avancés</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Export de données</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Support prioritaire</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full mt-4 btn-neon-pink"
                >
                  Choisir Premium
                </button>
              </div>

              {/* Plan Annuel */}
              <div className="bg-gradient-to-b from-neon-cyan/20 to-neon-pink/20 border border-neon-cyan/50 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-neon-cyan text-black px-3 py-1 rounded-full text-xs font-bold">MEILLEURE VALEUR</span>
                </div>
                
                <div className="text-center mb-4">
                  <h5 className="text-lg font-bold text-neon-cyan">📅 Annuel</h5>
                  <div className="text-3xl font-bold text-neon-cyan mt-2 mb-1">79€</div>
                  <div className="text-text-muted text-sm">par an</div>
                  <div className="text-xs text-neon-cyan mt-1 font-semibold">Économie de 40€/an</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm font-semibold">Tout Premium +</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Analyses illimitées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Engagement annuel</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Facturation annuelle</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan">✓</span>
                    <span className="text-text-white text-sm">Support prioritaire</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full mt-4 btn-neon-cyan"
                >
                  Choisir Annuel
                </button>
              </div>
            </div>

            {/* Call to action */}
            <div className="mt-8 text-center p-6 bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 rounded-lg border border-neon-pink/30">
              <h5 className="text-xl font-bold text-neon-pink mb-3">🎯 Pourquoi passer Premium ?</h5>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">⚡</span>
                  <span className="text-text-white font-semibold">Analyses illimitées</span>
                  <span className="text-text-gray">Plus jamais de limite</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">🎨</span>
                  <span className="text-text-white font-semibold">Images pour réseaux</span>
                  <span className="text-text-gray">Stories Instagram, posts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">🧠</span>
                  <span className="text-text-white font-semibold">IA avancée</span>
                  <span className="text-text-gray">Insights détaillés, export</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-neon-pink mb-2">
                💎 Plan {statusConfig.label}
              </h4>
              <p className="text-text-gray">Vous profitez de toute la puissance de l'IA</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-lg font-bold text-neon-cyan">🎉 Vos avantages actuels</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan text-lg">✓</span>
                    <span className="text-text-white font-semibold">Analyses illimitées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan text-lg">✓</span>
                    <span className="text-text-white">Images Stories personnalisées</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan text-lg">✓</span>
                    <span className="text-text-white">Insights IA avancés</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan text-lg">✓</span>
                    <span className="text-text-white">Export données + collections</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan text-lg">✓</span>
                    <span className="text-text-white">Support prioritaire 24/7</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-cyan text-lg">✓</span>
                    <span className="text-text-white">Accès anticipé nouvelles features</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-lg font-bold text-neon-pink">🎯 Pourquoi Premium ?</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-pink text-lg">⚡</span>
                    <span className="text-text-white">Plus de limites d'analyses</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-pink text-lg">🎨</span>
                    <span className="text-text-white">Images pour réseaux sociaux</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-pink text-lg">📊</span>
                    <span className="text-text-white">Export de données avancé</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-neon-pink text-lg">🛠️</span>
                    <span className="text-text-white">Support prioritaire</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-neon-cyan/10 to-neon-pink/10 rounded-lg border border-neon-cyan/30">
              <div className="text-center">
                <h5 className="font-bold text-neon-cyan mb-2">🎉 Merci d'être Premium !</h5>
                <p className="text-text-gray text-sm">
                  Vous soutenez le développement de nouvelles features IA
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}