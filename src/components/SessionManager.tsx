/**
 * Session Manager Component
 * Interface pour gérer les sessions actives de l'utilisateur
 */

import React, { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

interface SessionInfo {
  id: string
  deviceName: string
  browser: string
  os: string
  location: string
  ipAddress: string
  createdAt: string
  lastActivity: string
  isSuspicious: boolean
  riskScore: number
  deviceFingerprint: string
}

interface SessionManagerProps {
  onUpdate?: () => void
}

export default function SessionManager({ onUpdate }: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/sessions')
      const data = await response.json()

      if (data.success) {
        setSessions(data.sessions || [])
      } else {
        setError(data.message || 'Erreur lors du chargement des sessions')
      }
    } catch (err) {
      setError('Erreur de connexion')
      logger.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const invalidateSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId)
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalidate_session',
          sessionId
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadSessions() // Recharger la liste
        onUpdate?.()
      } else {
        setError(data.message || 'Erreur lors de l\'invalidation')
      }
    } catch (err) {
      setError('Erreur lors de l\'invalidation de la session')
      logger.error('Failed to invalidate session:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const invalidateAllOthers = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter tous vos autres appareils ?')) {
      return
    }

    try {
      setActionLoading('all')
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalidate_all_others'
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadSessions()
        onUpdate?.()
      } else {
        setError(data.message || 'Erreur lors de l\'invalidation')
      }
    } catch (err) {
      setError('Erreur lors de l\'invalidation des sessions')
      logger.error('Failed to invalidate all sessions:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const getRiskColor = (riskScore: number, isSuspicious: boolean) => {
    if (isSuspicious || riskScore >= 70) return 'text-red-400 bg-red-900/20'
    if (riskScore >= 40) return 'text-yellow-400 bg-yellow-900/20'
    return 'text-green-400 bg-green-900/20'
  }

  const getRiskLabel = (riskScore: number, isSuspicious: boolean) => {
    if (isSuspicious || riskScore >= 70) return 'Élevé'
    if (riskScore >= 40) return 'Moyen'
    return 'Faible'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (deviceName: string, browser: string) => {
    if (deviceName.toLowerCase().includes('phone') || deviceName.toLowerCase().includes('mobile')) {
      return '📱'
    }
    if (deviceName.toLowerCase().includes('tablet') || deviceName.toLowerCase().includes('ipad')) {
      return '📱'
    }
    if (browser.toLowerCase().includes('chrome')) return '🌐'
    if (browser.toLowerCase().includes('firefox')) return '🦊'
    if (browser.toLowerCase().includes('safari')) return '🧭'
    return '💻'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-text-white">Sessions actives</h3>
          <p className="text-text-gray text-sm mt-1">
            Gérez vos connexions sur différents appareils
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadSessions}
            disabled={loading}
            className="btn-neon-secondary text-sm px-3 py-2"
          >
            🔄 Actualiser
          </button>
          <button
            onClick={invalidateAllOthers}
            disabled={actionLoading === 'all' || sessions.length <= 1}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'all' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Invalidation...
              </div>
            ) : (
              '🚫 Déconnecter tous les autres'
            )}
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/20 text-red-300 p-4 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Liste des sessions */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          <div className="text-4xl mb-4">🔒</div>
          <p>Aucune session active trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={session.id} className="glass-card p-6 relative">
              {/* Badge de risque */}
              <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-medium ${getRiskColor(session.riskScore, session.isSuspicious)}`}>
                Risque: {getRiskLabel(session.riskScore, session.isSuspicious)}
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-grow">
                  {/* Icône d'appareil */}
                  <div className="text-3xl">
                    {getDeviceIcon(session.deviceName, session.browser)}
                  </div>

                  {/* Informations de session */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-text-white">
                        {session.deviceName}
                      </h4>
                      {session.isSuspicious && (
                        <span className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded-full">
                          ⚠️ Suspect
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-text-gray">
                      <div>
                        <p><span className="font-medium">🌐 Navigateur:</span> {session.browser}</p>
                        <p><span className="font-medium">💻 Système:</span> {session.os}</p>
                        <p><span className="font-medium">📍 Localisation:</span> {session.location}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">🌐 IP:</span> {session.ipAddress}</p>
                        <p><span className="font-medium">📅 Créée le:</span> {formatDate(session.createdAt)}</p>
                        <p><span className="font-medium">⏰ Dernière activité:</span> {formatDate(session.lastActivity)}</p>
                      </div>
                    </div>

                    {/* Score de risque détaillé */}
                    {session.riskScore > 0 && (
                      <div className="mt-3 p-2 bg-yellow-900/20 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-yellow-300">Score de risque</span>
                          <span className="text-xs text-yellow-300">{session.riskScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              session.riskScore >= 70 ? 'bg-red-500' :
                              session.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${session.riskScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4">
                  {index === 0 ? (
                    <span className="bg-green-900/20 text-green-300 text-xs px-3 py-2 rounded-full">
                      📍 Session actuelle
                    </span>
                  ) : (
                    <button
                      onClick={() => invalidateSession(session.id)}
                      disabled={actionLoading === session.id}
                      className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {actionLoading === session.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Invalidation...
                        </div>
                      ) : (
                        'Déconnecter'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-neon-cyan">{sessions.length}</div>
            <div className="text-xs text-text-gray">Sessions actives</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {sessions.filter(s => s.isSuspicious).length}
            </div>
            <div className="text-xs text-text-gray">Sessions suspectes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {sessions.filter(s => s.riskScore < 25).length}
            </div>
            <div className="text-xs text-text-gray">Sessions sûres</div>
          </div>
        </div>
      </div>
    </div>
  )
}