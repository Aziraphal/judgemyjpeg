import { useState } from 'react'
import { logger } from '@/lib/logger'

interface SecurityActionsPanelProps {
  suspiciousSessionsList?: Array<{
    id: string
    userEmail: string
    riskScore: number
    ipAddress: string
    location: string
    browser: string
    lastActivity: Date
  }>
  recentSecurityEvents?: Array<{
    id: string
    type: string
    description: string
    email: string
    ip: string
    timestamp: Date
  }>
  onActionComplete?: () => void
}

export default function SecurityActionsPanel({
  suspiciousSessionsList = [],
  recentSecurityEvents = [],
  onActionComplete
}: SecurityActionsPanelProps) {
  const [loading, setLoading] = useState(false)
  const [banIPForm, setBanIPForm] = useState({ show: false, ipAddress: '', reason: '', duration: '' })

  const handleAction = async (action: string, target: any) => {
    if (!confirm(`Confirmer cette action: ${action} ?`)) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/security-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Action réussie: ${action}`)
        onActionComplete?.()
      } else {
        alert(`❌ Erreur: ${data.error || 'Action échouée'}`)
      }
    } catch (error) {
      logger.error('Security action failed:', error)
      alert('❌ Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleBanIP = async () => {
    if (!banIPForm.ipAddress || !banIPForm.reason) {
      alert('⚠️ IP et raison obligatoires')
      return
    }

    await handleAction('ban_ip', {
      ipAddress: banIPForm.ipAddress,
      reason: banIPForm.reason,
      duration: banIPForm.duration ? parseInt(banIPForm.duration) : null
    })

    setBanIPForm({ show: false, ipAddress: '', reason: '', duration: '' })
  }

  return (
    <div className="space-y-6">
      {/* Sessions suspectes */}
      {suspiciousSessionsList.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
            <span className="text-red-400 mr-2">🚨</span>
            Sessions suspectes ({suspiciousSessionsList.length})
          </h3>
          <div className="space-y-3">
            {suspiciousSessionsList.map((session) => (
              <div key={session.id} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-text-gray">Utilisateur:</span>
                    <span className="text-text-white ml-2 font-mono">{session.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-text-gray">Risk Score:</span>
                    <span className={`ml-2 font-bold ${session.riskScore >= 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {session.riskScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-text-gray">IP:</span>
                    <span className="text-text-white ml-2 font-mono">{session.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-text-gray">Localisation:</span>
                    <span className="text-text-white ml-2">{session.location}</span>
                  </div>
                  <div>
                    <span className="text-text-gray">Navigateur:</span>
                    <span className="text-text-white ml-2">{session.browser}</span>
                  </div>
                  <div>
                    <span className="text-text-gray">Dernière activité:</span>
                    <span className="text-text-white ml-2">{new Date(session.lastActivity).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAction('invalidate_session', { sessionId: session.id, reason: 'Session suspecte détectée' })}
                    disabled={loading}
                    className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded hover:bg-yellow-600/30 transition-colors text-sm disabled:opacity-50"
                  >
                    🔒 Invalider session
                  </button>
                  <button
                    onClick={() => {
                      setBanIPForm({ show: true, ipAddress: session.ipAddress, reason: 'Activité suspecte', duration: '24' })
                    }}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors text-sm disabled:opacity-50"
                  >
                    🚫 Bannir IP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bannir IP manuellement */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-text-white mb-4">🚫 Bannir une adresse IP</h3>
        {!banIPForm.show ? (
          <button
            onClick={() => setBanIPForm({ ...banIPForm, show: true })}
            className="w-full py-2 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors"
          >
            + Bannir une IP
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-gray mb-1">Adresse IP *</label>
              <input
                type="text"
                value={banIPForm.ipAddress}
                onChange={(e) => setBanIPForm({ ...banIPForm, ipAddress: e.target.value })}
                placeholder="192.168.1.1"
                className="w-full px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-text-gray mb-1">Raison *</label>
              <input
                type="text"
                value={banIPForm.reason}
                onChange={(e) => setBanIPForm({ ...banIPForm, reason: e.target.value })}
                placeholder="Ex: Tentatives de hack répétées"
                className="w-full px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-text-gray mb-1">Durée (heures, vide = permanent)</label>
              <input
                type="number"
                value={banIPForm.duration}
                onChange={(e) => setBanIPForm({ ...banIPForm, duration: e.target.value })}
                placeholder="24"
                className="w-full px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBanIP}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'En cours...' : '🚫 Bannir'}
              </button>
              <button
                onClick={() => setBanIPForm({ show: false, ipAddress: '', reason: '', duration: '' })}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Événements récents avec actions rapides */}
      {recentSecurityEvents.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-white mb-4">📋 Événements récents ({recentSecurityEvents.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentSecurityEvents.map((event) => (
              <div key={event.id} className="bg-cosmic-glass/50 border border-cosmic-glassborder rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-yellow-400 font-mono text-xs">{event.type}</span>
                    <p className="text-text-white mt-1">{event.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-text-gray">
                      <span>📧 {event.email}</span>
                      <span>🌐 {event.ip}</span>
                      <span>🕐 {new Date(event.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setBanIPForm({ show: true, ipAddress: event.ip, reason: `Événement: ${event.type}`, duration: '24' })
                    }}
                    disabled={loading}
                    className="ml-2 px-2 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/30 transition-colors text-xs"
                  >
                    🚫 Ban IP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
