/**
 * Admin Security Dashboard
 * Tableau de bord sécurité détaillé pour les administrateurs
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface SecurityEvent {
  id: string
  eventType: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  ipAddress: string
  email?: string
  userId?: string
  metadata?: any
  success: boolean
}

interface SecurityAlert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: string
  status: 'open' | 'investigating' | 'resolved'
  assignee?: string
}

export default function AdminSecurityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('events')
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    riskLevel: '',
    eventType: '',
    timeRange: '24h',
    success: ''
  })

  useEffect(() => {
    checkAuth()
    loadSecurityData()
    
    // Actualisation automatique toutes les minutes
    const interval = setInterval(loadSecurityData, 60000)
    return () => clearInterval(interval)
  }, [filters])

  const checkAuth = () => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('admin_token')

      const [eventsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/admin/security-events?${new URLSearchParams(filters)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/security-alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (!eventsResponse.ok || !alertsResponse.ok) {
        throw new Error('Failed to load security data')
      }

      const [eventsData, alertsData] = await Promise.all([
        eventsResponse.json(),
        alertsResponse.json()
      ])

      setSecurityEvents(eventsData.data || [])
      setSecurityAlerts(alertsData.data || [])
    } catch (error) {
      console.error('Failed to load security data:', error)
      setError('Erreur lors du chargement des données de sécurité')
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const token = sessionStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/security-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'resolved' })
      })

      if (response.ok) {
        await loadSecurityData()
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      default: return 'text-green-400 bg-green-900/20 border-green-500/30'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '🟡'
      default: return '🟢'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('login')) return '🔐'
    if (eventType.includes('session')) return '💻'
    if (eventType.includes('password')) return '🔑'
    if (eventType.includes('2fa')) return '📱'
    if (eventType.includes('admin')) return '👑'
    return '📋'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const tabs = [
    { id: 'events', label: 'Événements', icon: '📋' },
    { id: 'alerts', label: 'Alertes', icon: '🚨' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ]

  return (
    <>
      <Head>
        <title>Sécurité - Admin JudgeMyJPEG</title>
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
                  <h1 className="text-xl font-bold text-text-white">Monitoring Sécurité</h1>
                  <p className="text-sm text-text-muted">
                    Événements et alertes de sécurité
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-sm text-text-gray">
                  {new Date().toLocaleTimeString('fr-FR')}
                </div>
                <button
                  onClick={loadSecurityData}
                  disabled={loading}
                  className="bg-blue-600/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex space-x-2 bg-cosmic-glass/30 p-1 rounded-xl w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-600/30 text-red-300 shadow-lg'
                      : 'text-text-gray hover:text-text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Événements Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Filtres */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-white mb-4">Filtres</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <select
                    value={filters.riskLevel}
                    onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                    className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="critical">Critique</option>
                    <option value="high">Élevé</option>
                    <option value="medium">Moyen</option>
                    <option value="low">Faible</option>
                  </select>

                  <select
                    value={filters.eventType}
                    onChange={(e) => setFilters({...filters, eventType: e.target.value})}
                    className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
                  >
                    <option value="">Tous les types</option>
                    <option value="login">Connexions</option>
                    <option value="session">Sessions</option>
                    <option value="password">Mots de passe</option>
                    <option value="2fa">2FA</option>
                    <option value="admin">Admin</option>
                  </select>

                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
                  >
                    <option value="1h">1 heure</option>
                    <option value="24h">24 heures</option>
                    <option value="7d">7 jours</option>
                    <option value="30d">30 jours</option>
                  </select>

                  <select
                    value={filters.success}
                    onChange={(e) => setFilters({...filters, success: e.target.value})}
                    className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="true">Succès</option>
                    <option value="false">Échecs</option>
                  </select>
                </div>
              </div>

              {/* Liste des événements */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-2"></div>
                    <p className="text-text-gray">Chargement...</p>
                  </div>
                ) : securityEvents.length === 0 ? (
                  <div className="text-center py-12 text-text-gray">
                    <div className="text-4xl mb-4">🔍</div>
                    <p>Aucun événement trouvé</p>
                  </div>
                ) : (
                  securityEvents.map((event) => (
                    <div key={event.id} className={`p-4 rounded-lg border ${getRiskColor(event.riskLevel)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getEventTypeIcon(event.eventType)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-text-white">
                                {event.eventType.replace(/_/g, ' ').toUpperCase()}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                event.success 
                                  ? 'bg-green-900/30 text-green-300' 
                                  : 'bg-red-900/30 text-red-300'
                              }`}>
                                {event.success ? 'Succès' : 'Échec'}
                              </span>
                            </div>
                            <p className="text-sm text-text-white mb-2">{event.description}</p>
                            <div className="text-xs text-text-gray space-y-1">
                              <p><strong>IP:</strong> {event.ipAddress}</p>
                              {event.email && <p><strong>Email:</strong> {event.email}</p>}
                              <p><strong>Horodatage:</strong> {formatDate(event.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg">{getRiskIcon(event.riskLevel)}</span>
                          <div className="text-xs text-text-muted mt-1">
                            {event.riskLevel.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      {event.metadata && (
                        <details className="mt-4 pt-4 border-t border-cosmic-glassborder">
                          <summary className="cursor-pointer text-sm text-text-gray hover:text-text-white">
                            Détails techniques
                          </summary>
                          <pre className="mt-2 text-xs bg-cosmic-glass/30 p-3 rounded overflow-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Alertes Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {securityAlerts.length === 0 ? (
                  <div className="text-center py-12 text-text-gray">
                    <div className="text-4xl mb-4">✅</div>
                    <p>Aucune alerte active</p>
                  </div>
                ) : (
                  securityAlerts.map((alert) => (
                    <div key={alert.id} className="glass-card p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-text-white">{alert.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              alert.severity === 'critical' ? 'bg-red-900/30 text-red-300' :
                              alert.severity === 'error' ? 'bg-orange-900/30 text-orange-300' :
                              alert.severity === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                              'bg-blue-900/30 text-blue-300'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              alert.status === 'resolved' ? 'bg-green-900/30 text-green-300' :
                              alert.status === 'investigating' ? 'bg-orange-900/30 text-orange-300' :
                              'bg-red-900/30 text-red-300'
                            }`}>
                              {alert.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-text-gray mb-2">{alert.description}</p>
                          <div className="text-xs text-text-muted">
                            {formatDate(alert.timestamp)}
                          </div>
                        </div>
                        
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="bg-green-600/20 text-green-300 px-4 py-2 rounded hover:bg-green-600/30 transition-colors"
                          >
                            Résoudre
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-white mb-4">📊 Analytics de sécurité</h3>
                <div className="text-center py-12 text-text-gray">
                  <p>Interface analytics en cours de développement...</p>
                  <p className="text-sm mt-2">Graphiques et métriques détaillées à venir</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}