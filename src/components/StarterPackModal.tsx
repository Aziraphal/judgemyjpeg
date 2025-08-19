/**
 * Modal de promotion du Starter Pack après épuisement des analyses gratuites
 */

import { useState } from 'react'
import { useRouter } from 'next/router'

interface StarterPackModalProps {
  isOpen: boolean
  onClose: () => void
  remainingDays?: number
}

export default function StarterPackModal({ isOpen, onClose, remainingDays }: StarterPackModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleStarterPack = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType: 'starter' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors du paiement')
      }

      const { url } = await response.json()
      window.location.href = url

    } catch (error) {
      console.error('Erreur:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors du paiement')
      setLoading(false)
    }
  }

  const handleGoToPricing = () => {
    router.push('/pricing')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 border-2 border-yellow-500 relative animate-pulse-glow">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-white text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Analyses épuisées !
          </h2>
          <p className="text-text-gray">
            Vous avez utilisé vos 3 analyses gratuites ce mois-ci.
            {remainingDays && (
              <span className="block mt-1 text-text-muted text-sm">
                Prochaine réinitialisation dans {remainingDays} jour{remainingDays > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Starter Pack Offer */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 mb-6 border border-yellow-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-yellow-400">🛒 Starter Pack</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">4,99€</div>
              <div className="text-xs text-text-muted">achat unique</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">✓</span>
              <span className="text-text-white">10 analyses bonus</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">✓</span>
              <span className="text-text-white">Tous les modes (Pro, Roast, Expert)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">✓</span>
              <span className="text-text-white">3 partages sociaux + 3 exports PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⚡</span>
              <span className="text-yellow-300 font-medium">Limité à 1 par compte</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleStarterPack}
            disabled={loading}
            className="w-full btn-neon-yellow"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Redirection...
              </div>
            ) : (
              '🛒 Acheter le Starter Pack'
            )}
          </button>
          
          <button
            onClick={handleGoToPricing}
            className="w-full btn-neon-secondary text-sm"
          >
            📋 Voir tous les plans
          </button>

          <button
            onClick={onClose}
            className="w-full text-text-muted hover:text-text-white text-sm transition-colors"
          >
            ⏭️ Continuer sans acheter
          </button>
        </div>

        {/* Fine print */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            Une fois épuisé, vous revenez au plan gratuit (3 analyses/mois)
          </p>
        </div>
      </div>
    </div>
  )
}