/**
 * Composant Manager 2FA - Gestion 2FA dans les paramètres utilisateur
 */

import { useState, useEffect } from 'react'
import TwoFactorSetup from './TwoFactorSetup'

interface TwoFactorStats {
  enabled: boolean
  verifiedAt: string | null
  backupCodesRemaining: number
}

export default function TwoFactorManager() {
  const [stats, setStats] = useState<TwoFactorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Données pour désactivation
  const [disableData, setDisableData] = useState({
    currentPassword: '',
    verificationCode: ''
  })

  // Charger les stats 2FA
  const loadStats = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      } else {
        setError('Erreur lors du chargement')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Désactiver 2FA
  const handleDisable = async () => {
    if (!disableData.currentPassword) {
      setError('Mot de passe requis')
      return
    }

    if (stats?.enabled && !disableData.verificationCode) {
      setError('Code 2FA requis')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disableData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message)
        setShowDisable(false)
        setDisableData({ currentPassword: '', verificationCode: '' })
        await loadStats() // Recharger les stats
      } else {
        setError(data.message || 'Erreur lors de la désactivation')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Régénérer codes de récupération
  const handleRegenerateCodes = async () => {
    const code = prompt('Entrez votre code 2FA actuel pour régénérer les codes de récupération :')
    
    if (!code) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/regenerate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode: code })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Afficher les nouveaux codes
        const codesText = data.backupCodes.join('\n')
        const shouldCopy = confirm(
          `Nouveaux codes générés !\n\n${codesText}\n\nVoulez-vous les copier dans le presse-papier ?`
        )
        
        if (shouldCopy) {
          navigator.clipboard.writeText(codesText)
        }
        
        setSuccess(data.message)
        await loadStats()
      } else {
        setError(data.message || 'Erreur lors de la régénération')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading && !stats) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="spinner-neon w-8 h-8 mx-auto mb-2"></div>
        <p className="text-text-gray text-sm">Chargement des paramètres 2FA...</p>
      </div>
    )
  }

  // Affichage du setup
  if (showSetup) {
    return (
      <TwoFactorSetup
        onSuccess={() => {
          setShowSetup(false)
          setSuccess('2FA activé avec succès !')
          loadStats()
        }}
        onCancel={() => setShowSetup(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {/* Status actuel */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div>
                <h3 className="text-lg font-semibold text-text-white">
                  Authentification à deux facteurs (2FA)
                </h3>
                <p className="text-text-gray text-sm">
                  Protection supplémentaire pour votre compte
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${stats?.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm font-medium ${stats?.enabled ? 'text-green-400' : 'text-red-400'}`}>
                {stats?.enabled ? 'Activé' : 'Désactivé'}
              </span>
            </div>

            {stats?.enabled && stats.verifiedAt && (
              <p className="text-xs text-text-muted">
                Activé le {new Date(stats.verifiedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="text-right space-y-2">
            {!stats?.enabled ? (
              <button
                onClick={() => setShowSetup(true)}
                className="btn-neon-primary text-sm"
              >
                🔐 Activer 2FA
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setShowDisable(true)}
                  className="btn-neon-secondary text-sm block"
                >
                  ❌ Désactiver 2FA
                </button>
                
                <button
                  onClick={handleRegenerateCodes}
                  className="btn-neon-secondary text-sm block"
                  disabled={loading}
                >
                  🔄 Nouveaux codes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Infos codes de récupération */}
        {stats?.enabled && (
          <div className="mt-4 pt-4 border-t border-cosmic-glassborder">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-gray">Codes de récupération restants :</span>
              <span className={`font-semibold ${
                (stats.backupCodesRemaining || 0) > 4 
                  ? 'text-green-400' 
                  : (stats.backupCodesRemaining || 0) > 2
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}>
                {stats.backupCodesRemaining || 0}/8
              </span>
            </div>
            
            {(stats.backupCodesRemaining || 0) <= 2 && (
              <p className="text-yellow-400 text-xs mt-2">
                ⚠️ Il vous reste peu de codes de récupération. Pensez à en régénérer.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de désactivation */}
      {showDisable && stats?.enabled && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-cosmic-overlay border border-cosmic-glassborder rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-lg font-semibold text-text-white mt-2">
                Désactiver 2FA
              </h3>
              <p className="text-text-gray text-sm mt-2">
                Votre compte sera moins sécurisé sans 2FA
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-text-white text-sm mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={disableData.currentPassword}
                  onChange={(e) => setDisableData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white"
                  placeholder="Votre mot de passe"
                />
              </div>

              <div>
                <label className="block text-text-white text-sm mb-2">
                  Code 2FA actuel
                </label>
                <input
                  type="text"
                  value={disableData.verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setDisableData(prev => ({ ...prev, verificationCode: value }))
                  }}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white text-center font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowDisable(false)
                    setDisableData({ currentPassword: '', verificationCode: '' })
                    setError('')
                  }}
                  className="btn-neon-secondary flex-1"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleDisable}
                  disabled={loading || !disableData.currentPassword || !disableData.verificationCode}
                  className="btn-neon-pink flex-1"
                >
                  {loading ? 'Désactivation...' : 'Désactiver 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}