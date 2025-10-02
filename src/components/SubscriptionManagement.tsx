import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'

export default function SubscriptionManagement() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    loadSubscriptionStatus()
  }, [])

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      logger.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setRedirecting(true)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'ouverture du portail de gestion')
        setRedirecting(false)
      }
    } catch (error) {
      logger.error('Error opening portal:', error)
      alert('Erreur de connexion. Réessayez plus tard.')
      setRedirecting(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="spinner-neon w-8 h-8 mx-auto"></div>
        <p className="text-text-gray mt-4">Chargement...</p>
      </div>
    )
  }

  const subscription = subscriptionData?.subscription
  const isPremium = subscription?.subscriptionStatus === 'premium' || subscription?.subscriptionStatus === 'annual'
  const isLifetime = subscription?.subscriptionStatus === 'lifetime'
  const isFree = subscription?.subscriptionStatus === 'free'
  const hasStarterPack = subscription?.starterPackPurchased

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-white mb-2">
          💳 Gestion de l'abonnement
        </h2>
        <p className="text-text-gray">
          Gérez votre abonnement, changez de plan ou annulez votre souscription
        </p>
      </div>

      {/* Current Subscription Status */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
          <span className="text-xl mr-2">📊</span>
          Statut actuel
        </h3>

        <div className="space-y-4">
          {/* Plan Badge */}
          <div className="flex items-center justify-between p-4 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
            <div>
              <p className="text-text-muted text-sm">Plan actuel</p>
              <p className="text-text-white font-bold text-xl">
                {isLifetime && '💎 Lifetime Access'}
                {isPremium && !isLifetime && '⭐ Premium'}
                {isFree && !hasStarterPack && '🆓 Gratuit'}
                {isFree && hasStarterPack && '📦 Starter Pack'}
              </p>
            </div>
            {(isPremium || isLifetime) && (
              <div className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg">
                <p className="text-white font-semibold">Actif</p>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          {isFree && (
            <div className="p-4 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-gray">Analyses ce mois-ci</span>
                    <span className="text-text-white font-medium">
                      {subscription?.monthlyAnalysisCount || 0} / 3
                    </span>
                  </div>
                  <div className="w-full bg-cosmic-glass rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-neon-pink to-neon-cyan h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((subscription?.monthlyAnalysisCount || 0) / 3) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {hasStarterPack && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-gray">Analyses Starter Pack</span>
                        <span className="text-text-white font-medium">
                          {subscription?.starterAnalysisCount || 0} / 10
                        </span>
                      </div>
                      <div className="w-full bg-cosmic-glass rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((subscription?.starterAnalysisCount || 0) / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-gray">Exports Starter Pack</span>
                        <span className="text-text-white font-medium">
                          {subscription?.starterExportsCount || 0} / 3
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-gray">Partages Starter Pack</span>
                        <span className="text-text-white font-medium">
                          {subscription?.starterSharesCount || 0} / 3
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {subscription?.lastAnalysisReset && (
                  <p className="text-text-muted text-xs mt-2">
                    🔄 Réinitialisation : {new Date(subscription.lastAnalysisReset).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long'
                    })} de chaque mois
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manage Subscription with Stripe */}
      {(isPremium || isLifetime || subscription?.stripeCustomerId) && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
            <span className="text-xl mr-2">⚙️</span>
            Gérer via Stripe
          </h3>

          <p className="text-text-gray text-sm mb-4">
            Accédez au portail Stripe pour :
          </p>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-cyan mr-2">•</span>
              <span>Annuler votre abonnement</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-cyan mr-2">•</span>
              <span>Changer de plan (mensuel ↔ annuel)</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-cyan mr-2">•</span>
              <span>Mettre à jour votre carte bancaire</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-cyan mr-2">•</span>
              <span>Télécharger vos factures</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-cyan mr-2">•</span>
              <span>Voir l'historique de paiements</span>
            </li>
          </ul>

          <button
            onClick={handleManageSubscription}
            disabled={redirecting}
            className="btn-neon-pink w-full flex items-center justify-center space-x-2"
          >
            {redirecting ? (
              <>
                <div className="spinner-neon w-4 h-4"></div>
                <span>Redirection...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>Ouvrir le portail Stripe</span>
              </>
            )}
          </button>

          <p className="text-text-muted text-xs mt-3 text-center">
            Vous serez redirigé vers une page sécurisée Stripe
          </p>
        </div>
      )}

      {/* Upgrade for Free Users */}
      {isFree && !hasStarterPack && (
        <div className="glass-card p-6 border-2 border-neon-pink/30">
          <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
            <span className="text-xl mr-2">⭐</span>
            Passer à Premium
          </h3>

          <p className="text-text-gray text-sm mb-4">
            Débloquez toutes les fonctionnalités :
          </p>

          <ul className="space-y-2 mb-6">
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-pink mr-2">✓</span>
              <span>Analyses illimitées</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-pink mr-2">✓</span>
              <span>Exports PDF illimités</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-pink mr-2">✓</span>
              <span>Collections personnalisées</span>
            </li>
            <li className="flex items-start text-text-gray text-sm">
              <span className="text-neon-pink mr-2">✓</span>
              <span>Support prioritaire</span>
            </li>
          </ul>

          <button
            onClick={() => window.location.href = '/pricing'}
            className="btn-gradient-pink w-full"
          >
            Voir les plans
          </button>
        </div>
      )}

      {/* RGPD Notice */}
      <div className="glass-card p-4 bg-blue-900/10 border border-blue-500/20">
        <p className="text-blue-300 text-sm flex items-start">
          <span className="mr-2 flex-shrink-0">ℹ️</span>
          <span>
            Conformément au RGPD, vous pouvez annuler votre abonnement à tout moment sans frais.
            L'annulation prend effet à la fin de la période de facturation en cours.
          </span>
        </p>
      </div>
    </div>
  )
}
