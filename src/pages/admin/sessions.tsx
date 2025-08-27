/**
 * Admin Sessions Management
 * Gestion avancée des sessions pour les administrateurs
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { logger } from '@/lib/logger'

interface Session {
  id: string
  userId: string
  userEmail: string
  userName?: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  location: string
  createdAt: string
  lastActivity: string
  isActive: boolean
  isSuspicious: boolean
  riskScore: number
  deviceFingerprint: string
}

interface SessionsFilter {
  suspicious: boolean
  highRisk: boolean
  recentOnly: boolean
  searchTerm: string
}

export default function AdminSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<SessionsFilter>({
    suspicious: false,
    highRisk: false,
    recentOnly: false,
    searchTerm: ''
  })

  useEffect(() => {
    checkAuth()
    loadSessions()
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(loadSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [sessions, filters])

  const checkAuth = () => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const loadSessions = async () => {
    try {
      const token = sessionStorage.getItem('admin_token')
      const response = await fetch('/api/admin/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await response.json()
      setSessions(data.data || [])
    } catch (error) {
      logger.error('Failed to load sessions:', error)
      setError('Erreur lors du chargement des sessions')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...sessions]

    if (filters.suspicious) {
      filtered = filtered.filter(s => s.isSuspicious)
    }

    if (filters.highRisk) {
      filtered = filtered.filter(s => s.riskScore >= 50)
    }

    if (filters.recentOnly) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter(s => new Date(s.lastActivity) > oneDayAgo)
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        s.userEmail.toLowerCase().includes(term) ||
        s.userName?.toLowerCase().includes(term) ||
        s.ipAddress.includes(term) ||
        s.location.toLowerCase().includes(term) ||
        s.deviceName.toLowerCase().includes(term)
      )
    }

    setFilteredSessions(filtered)
  }

  const invalidateSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId)
      const token = sessionStorage.getItem('admin_token')
      
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        await loadSessions()
      } else {
        throw new Error('Erreur lors de l\'invalidation')
      }
    } catch (error) {
      logger.error('Failed to invalidate session:', error)
      setError('Erreur lors de l\'invalidation de la session')
    } finally {
      setActionLoading(null)
    }
  }

  const invalidateSelectedSessions = async () => {
    if (selectedSessions.size === 0) return

    if (!confirm(`Invalider ${selectedSessions.size} sessions sélectionnées ?`)) {
      return
    }

    try {
      setActionLoading('bulk')
      const token = sessionStorage.getItem('admin_token')
      
      const response = await fetch('/api/admin/sessions/bulk', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sessionIds: Array.from(selectedSessions)
        })
      })

      if (response.ok) {
        setSelectedSessions(new Set())
        await loadSessions()
      } else {
        throw new Error('Erreur lors de l\'invalidation en masse')
      }
    } catch (error) {
      logger.error('Failed to bulk invalidate:', error)
      setError('Erreur lors de l\'invalidation en masse')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleSessionSelection = (sessionId: string) => {
    const newSelected = new Set(selectedSessions)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedSessions(newSelected)
  }

  const selectAllVisible = () => {
    const allVisible = new Set(filteredSessions.map(s => s.id))
    setSelectedSessions(allVisible)
  }

  const clearSelection = () => {
    setSelectedSessions(new Set())
  }

  const getRiskColor = (riskScore: number, isSuspicious: boolean) => {
    if (isSuspicious || riskScore >= 70) return 'text-red-400'
    if (riskScore >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-text-gray">Chargement des sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion des Sessions - Admin JudgeMyJPEG</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-cosmic-overlay">
        {/* Header */}
        <header className="border-b border-cosmic-glassborder bg-cosmic-glass/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="text-text-gray hover:text-text-white"
                >
                  ← Dashboard
                </button>
                <div>
                  <h1 className="text-xl font-bold text-text-white">Gestion des Sessions</h1>
                  <p className="text-sm text-text-muted">
                    {filteredSessions.length} sessions ({sessions.filter(s => s.isSuspicious).length} suspectes)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={loadSessions}
                  disabled={loading}
                  className="bg-blue-600/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  🔄 Actualiser
                </button>
                
                {selectedSessions.size > 0 && (
                  <button
                    onClick={invalidateSelectedSessions}
                    disabled={actionLoading === 'bulk'}
                    className="bg-red-600/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    🚫 Invalider ({selectedSessions.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Filtres */}
          <div className="glass-card p-6 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Rechercher (email, IP, appareil...)"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="w-full px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white placeholder-text-muted"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.suspicious}
                    onChange={(e) => setFilters({...filters, suspicious: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span className="text-text-white">Suspectes uniquement</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.highRisk}
                    onChange={(e) => setFilters({...filters, highRisk: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span className="text-text-white">Risque élevé</span>
                </label>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={selectAllVisible}
                  className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded hover:bg-blue-600/30"
                >
                  Sélectionner tout
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs bg-gray-600/20 text-gray-300 px-3 py-1 rounded hover:bg-gray-600/30"
                >
                  Désélectionner
                </button>
              </div>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 text-red-300 p-4 rounded-lg mb-6">
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
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-text-gray">
                <div className="text-4xl mb-4">🔍</div>
                <p>Aucune session trouvée avec ces filtres</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div key={session.id} className="glass-card p-4 relative">
                  {/* Checkbox de sélection */}
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={selectedSessions.has(session.id)}
                      onChange={() => toggleSessionSelection(session.id)}
                      className="form-checkbox"
                    />
                  </div>

                  {/* Badge de statut */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {session.isSuspicious && (
                      <span className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded-full">
                        ⚠️ Suspect
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.riskScore >= 70 ? 'bg-red-900/30 text-red-300' :
                      session.riskScore >= 40 ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-green-900/30 text-green-300'
                    }`}>
                      Risque: {session.riskScore}/100
                    </span>
                  </div>

                  <div className="ml-8 mr-32">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Informations utilisateur */}
                      <div>
                        <h4 className="font-semibold text-text-white mb-2 flex items-center">
                          👤 {session.userName || 'Utilisateur'}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-text-gray">Email:</span> <span className="text-text-white">{session.userEmail}</span></p>
                          <p><span className="text-text-gray">Appareil:</span> <span className="text-text-white">{session.deviceName}</span></p>
                          <p><span className="text-text-gray">Navigateur:</span> <span className="text-text-white">{session.browser} ({session.os})</span></p>
                        </div>
                      </div>

                      {/* Informations de session */}
                      <div>
                        <h4 className="font-semibold text-text-white mb-2 flex items-center">
                          🌐 Session
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-text-gray">IP:</span> <span className="text-text-white">{session.ipAddress}</span></p>
                          <p><span className="text-text-gray">Localisation:</span> <span className="text-text-white">{session.location}</span></p>
                          <p><span className="text-text-gray">Créée:</span> <span className="text-text-white">{formatDate(session.createdAt)}</span></p>
                          <p><span className="text-text-gray">Dernière activité:</span> <span className="text-text-white">{formatDate(session.lastActivity)}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-cosmic-glassborder">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-text-muted">
                          Session ID: {session.id.slice(0, 8)}...
                        </div>
                        <button
                          onClick={() => invalidateSession(session.id)}
                          disabled={actionLoading === session.id}
                          className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === session.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Invalidation...
                            </div>
                          ) : (
                            'Invalider la session'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}