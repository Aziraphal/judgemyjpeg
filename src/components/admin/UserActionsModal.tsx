/**
 * Modal pour actions admin sur un utilisateur
 */

import { useState } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  email: string
  name?: string
  subscriptionStatus: string
  monthlyAnalysisCount: number
  createdAt: string
}

interface UserActionsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UserActionsModal({ user, isOpen, onClose, onSuccess }: UserActionsModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'upgrade' | 'downgrade' | 'reset' | 'delete' | null>(null)
  const [newPlan, setNewPlan] = useState<'free' | 'premium' | 'annual'>('premium')
  const [confirmDelete, setConfirmDelete] = useState('')
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  if (!isOpen || !user) return null

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/admin/users/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subscriptionStatus: newPlan
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: `✅ Abonnement changé vers ${newPlan}` })
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setResult({ type: 'error', message: `❌ ${data.error}` })
      }
    } catch (error) {
      setResult({ type: 'error', message: `❌ Erreur: ${error}` })
    } finally {
      setLoading(false)
    }
  }

  const handleResetAnalyses = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/admin/users/reset-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: '✅ Compteur d\'analyses réinitialisé' })
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setResult({ type: 'error', message: `❌ ${data.error}` })
      }
    } catch (error) {
      setResult({ type: 'error', message: `❌ Erreur: ${error}` })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (confirmDelete !== 'SUPPRIMER DÉFINITIVEMENT') {
      setResult({ type: 'error', message: '❌ Tapez exactement "SUPPRIMER DÉFINITIVEMENT"' })
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: '✅ Utilisateur supprimé' })
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setResult({ type: 'error', message: `❌ ${data.error}` })
      }
    } catch (error) {
      setResult({ type: 'error', message: `❌ Erreur: ${error}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-8 border border-neon-cyan/30">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-white mb-2">
              Actions Utilisateur
            </h2>
            <p className="text-text-gray text-sm font-mono">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-gray hover:text-text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Info utilisateur */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-cosmic-glass/30 rounded-lg">
          <div>
            <div className="text-text-muted text-xs">Nom</div>
            <div className="text-text-white">{user.name || 'N/A'}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs">Statut</div>
            <div className="text-text-white capitalize">{user.subscriptionStatus}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs">Analyses ce mois</div>
            <div className="text-text-white">{user.monthlyAnalysisCount}</div>
          </div>
          <div>
            <div className="text-text-muted text-xs">Inscrit</div>
            <div className="text-text-white">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        {/* Actions */}
        {!action && (
          <div className="space-y-3">
            <button
              onClick={() => setAction('upgrade')}
              className="w-full bg-green-600/20 text-green-300 px-6 py-3 rounded-lg hover:bg-green-600/30 transition-colors text-left flex items-center space-x-3"
            >
              <span className="text-xl">⬆️</span>
              <div>
                <div className="font-semibold">Changer d'abonnement</div>
                <div className="text-xs text-green-400">Upgrade ou downgrade le plan</div>
              </div>
            </button>

            <button
              onClick={() => setAction('reset')}
              className="w-full bg-blue-600/20 text-blue-300 px-6 py-3 rounded-lg hover:bg-blue-600/30 transition-colors text-left flex items-center space-x-3"
            >
              <span className="text-xl">🔄</span>
              <div>
                <div className="font-semibold">Réinitialiser les analyses</div>
                <div className="text-xs text-blue-400">Remettre le compteur mensuel à 0</div>
              </div>
            </button>

            <button
              onClick={() => setAction('delete')}
              className="w-full bg-red-600/20 text-red-300 px-6 py-3 rounded-lg hover:bg-red-600/30 transition-colors text-left flex items-center space-x-3"
            >
              <span className="text-xl">🗑️</span>
              <div>
                <div className="font-semibold">Supprimer l'utilisateur</div>
                <div className="text-xs text-red-400">⚠️ Action irréversible</div>
              </div>
            </button>
          </div>
        )}

        {/* Upgrade form */}
        {action === 'upgrade' && (
          <div className="space-y-4">
            <div>
              <label className="block text-text-white mb-2">Nouveau plan :</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as any)}
                className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white"
              >
                <option value="free">🆓 Gratuit</option>
                <option value="premium">💎 Premium</option>
                <option value="annual">📅 Annuel</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 btn-neon-pink"
              >
                {loading ? 'Changement...' : 'Confirmer'}
              </button>
              <button
                onClick={() => setAction(null)}
                className="flex-1 btn-neon-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Reset form */}
        {action === 'reset' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                Cela remettra le compteur d'analyses mensuelles à 0 pour cet utilisateur.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleResetAnalyses}
                disabled={loading}
                className="flex-1 btn-neon-cyan"
              >
                {loading ? 'Réinitialisation...' : 'Confirmer'}
              </button>
              <button
                onClick={() => setAction(null)}
                className="flex-1 btn-neon-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Delete form */}
        {action === 'delete' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold mb-2">⚠️ ATTENTION : ACTION IRRÉVERSIBLE</p>
              <p className="text-red-200 text-sm">
                Cela supprimera DÉFINITIVEMENT l'utilisateur et TOUTES ses données (photos, collections, favoris, etc.)
              </p>
            </div>

            <div>
              <label className="block text-text-white mb-2">
                Tapez "SUPPRIMER DÉFINITIVEMENT" pour confirmer :
              </label>
              <input
                type="text"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className="w-full p-3 bg-cosmic-glass border border-red-500/30 rounded-lg text-text-white"
                placeholder="SUPPRIMER DÉFINITIVEMENT"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteUser}
                disabled={loading || confirmDelete !== 'SUPPRIMER DÉFINITIVEMENT'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Suppression...' : '🗑️ SUPPRIMER'}
              </button>
              <button
                onClick={() => {
                  setAction(null)
                  setConfirmDelete('')
                }}
                className="flex-1 btn-neon-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Result message */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <p className={result.type === 'success' ? 'text-green-300' : 'text-red-300'}>
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}