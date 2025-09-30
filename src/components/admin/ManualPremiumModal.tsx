/**
 * Modal pour accorder/révoquer un accès premium manuel
 */

import { useState } from 'react'
import { logger } from '@/lib/logger'

interface ManualPremiumModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    email: string
    name?: string
    manualPremiumAccess?: boolean
    manualPremiumReason?: string
  } | null
  onSuccess: () => void
}

export default function ManualPremiumModal({ isOpen, onClose, user, onSuccess }: ManualPremiumModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !user) return null

  const handleGrant = async () => {
    if (!reason.trim()) {
      setError('Veuillez saisir une raison')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/manual-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reason: reason.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'attribution')
      }

      logger.info('Manual premium granted via admin UI', { userId: user.id })
      onSuccess()
      onClose()
      setReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!confirm(`Voulez-vous vraiment révoquer l'accès premium manuel de ${user.email} ?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/manual-premium', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la révocation')
      }

      logger.info('Manual premium revoked via admin UI', { userId: user.id })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neon-cyan mb-2">
              {user.manualPremiumAccess ? '✅ Premium Manuel Actif' : '🎁 Accorder Premium Lifetime'}
            </h2>
            <p className="text-text-muted text-sm">
              {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Statut actuel */}
        {user.manualPremiumAccess && user.manualPremiumReason && (
          <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-text-white mb-1">
              <strong>Raison actuelle :</strong>
            </p>
            <p className="text-text-muted text-sm">
              {user.manualPremiumReason}
            </p>
          </div>
        )}

        {/* Formulaire */}
        {!user.manualPremiumAccess && (
          <div className="mb-6">
            <label className="block text-text-white font-semibold mb-2">
              Raison de l'attribution *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Testeur beta - early adopter"
              className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan transition-colors"
              disabled={loading}
            />
            <p className="text-text-muted text-xs mt-2">
              💡 Exemples : "Testeur beta", "Contributeur open-source", "Partenaire média"
            </p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {user.manualPremiumAccess ? (
            <>
              <button
                onClick={handleRevoke}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {loading ? 'Révocation...' : '🗑️ Révoquer l\'accès'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-neon-secondary"
              >
                Fermer
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 btn-neon-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleGrant}
                disabled={loading || !reason.trim()}
                className="flex-1 btn-neon-cyan"
              >
                {loading ? 'Attribution...' : '✅ Accorder Premium'}
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
          <p className="text-text-muted text-xs">
            ℹ️ L'accès premium manuel est <strong>permanent</strong> et ne sera pas affecté par les webhooks Stripe.
            L'utilisateur bénéficiera d'analyses illimitées à vie.
          </p>
        </div>
      </div>
    </div>
  )
}
