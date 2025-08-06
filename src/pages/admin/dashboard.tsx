/**
 * Admin Dashboard - Tableau de bord d'administration
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface SecurityStats {
  totalUsers: number
  activeUsers: number
  totalSessions: number
  suspiciousSessions: number
  recentSecurityEvents: any[]
  criticalAlerts: any[]
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical'
    uptime: string
    lastCleanup: string
  }
}

interface DashboardStats {
  totalPhotos: number
  todayAnalyses: number
  activeSubscriptions: number
  revenue: {
    monthly: number
    total: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = () => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('admin_token')

      const [securityResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/security-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (!securityResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const [securityData, statsData] = await Promise.all([
        securityResponse.json(),
        statsResponse.json()
      ])

      setSecurityStats(securityData.data)
      setDashboardStats(statsData.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      setError('Erreur lors du chargement du dashboard')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'security', label: 'Sécurité', icon: '🛡️' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'system', label: 'Système', icon: '⚙️' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-text-gray">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">❌ {error}</p>
          <button onClick={loadDashboardData} className="btn-neon-secondary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard Admin - JudgeMyJPEG</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-cosmic-overlay">
        {/* Header */}
        <header className="border-b border-cosmic-glassborder bg-cosmic-glass/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-white">Administration JudgeMyJPEG</h1>
                  <p className="text-sm text-text-muted">Dashboard de monitoring et gestion</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-text-gray">
                  {new Date().toLocaleString('fr-FR')}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* System Status Banner */}
          {securityStats?.systemHealth.status !== 'healthy' && (
            <div className={`mb-6 p-4 rounded-lg border ${
              securityStats?.systemHealth.status === 'critical' 
                ? 'bg-red-900/20 border-red-500/30 text-red-300'
                : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
            }`}>
              <div className="flex items-center space-x-3">
                <span className="text-xl">
                  {securityStats?.systemHealth.status === 'critical' ? '🚨' : '⚠️'}
                </span>
                <div>
                  <p className="font-medium">
                    Statut système: {securityStats?.systemHealth.status?.toUpperCase()}
                  </p>
                  {(securityStats?.criticalAlerts?.length ?? 0) > 0 && (
                    <p className="text-sm mt-1">
                      {securityStats?.criticalAlerts?.length} alertes critiques nécessitent votre attention
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center">
                  <div className="text-3xl font-bold text-neon-cyan mb-2">
                    {(dashboardStats as any)?.totalUsers || 0}
                  </div>
                  <div className="text-sm text-text-gray">Utilisateurs totaux</div>
                  <div className="text-xs text-green-400 mt-1">
                    {securityStats?.activeUsers || 0} actifs
                  </div>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="text-3xl font-bold text-neon-pink mb-2">
                    {dashboardStats?.totalPhotos || 0}
                  </div>
                  <div className="text-sm text-text-gray">Photos analysées</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {dashboardStats?.todayAnalyses || 0} aujourd'hui
                  </div>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {securityStats?.totalSessions || 0}
                  </div>
                  <div className="text-sm text-text-gray">Sessions actives</div>
                  <div className="text-xs text-red-400 mt-1">
                    {securityStats?.suspiciousSessions || 0} suspectes
                  </div>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {dashboardStats?.activeSubscriptions || 0}
                  </div>
                  <div className="text-sm text-text-gray">Abonnements actifs</div>
                  <div className="text-xs text-green-300 mt-1">
                    €{dashboardStats?.revenue?.monthly || 0}/mois
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Événements de sécurité récents
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {securityStats?.recentSecurityEvents?.slice(0, 10).map((event, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded bg-cosmic-glass/30">
                        <span className={`w-2 h-2 rounded-full ${
                          event.riskLevel === 'critical' ? 'bg-red-500' :
                          event.riskLevel === 'high' ? 'bg-orange-500' :
                          event.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-white truncate">{event.description}</p>
                          <p className="text-xs text-text-muted">
                            {new Date(event.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
                    <span className="mr-2">🚨</span>
                    Alertes critiques
                  </h3>
                  {securityStats?.criticalAlerts?.length > 0 ? (
                    <div className="space-y-3">
                      {securityStats.criticalAlerts.map((alert, index) => (
                        <div key={index} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-300 font-medium">{alert.title}</p>
                          <p className="text-xs text-red-400 mt-1">{alert.description}</p>
                          <div className="mt-2">
                            <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                              Traiter
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-gray">
                      <div className="text-3xl mb-2">✅</div>
                      <p>Aucune alerte critique</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-white mb-6">🛡️ Monitoring de sécurité</h3>
                <div className="text-center text-text-gray">
                  <p>Interface de sécurité détaillée en cours de développement...</p>
                  <p className="text-sm mt-2">Sessions suspectes: {securityStats?.suspiciousSessions || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-white mb-6">👥 Gestion des utilisateurs</h3>
                <div className="text-center text-text-gray">
                  <p>Interface de gestion utilisateurs en cours de développement...</p>
                  <p className="text-sm mt-2">Utilisateurs actifs: {securityStats?.activeUsers || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-white mb-6">⚙️ État du système</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-text-white mb-3">Santé du système</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-gray">Statut</span>
                        <span className={`${
                          securityStats?.systemHealth.status === 'healthy' ? 'text-green-400' :
                          securityStats?.systemHealth.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {securityStats?.systemHealth.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-gray">Uptime</span>
                        <span className="text-text-white">{securityStats?.systemHealth.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-gray">Dernier nettoyage</span>
                        <span className="text-text-white">{securityStats?.systemHealth.lastCleanup}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-white mb-3">Actions système</h4>
                    <div className="space-y-2">
                      <button className="w-full bg-blue-600/20 text-blue-300 px-4 py-2 rounded hover:bg-blue-600/30 transition-colors text-sm">
                        🧹 Forcer le nettoyage des sessions
                      </button>
                      <button className="w-full bg-yellow-600/20 text-yellow-300 px-4 py-2 rounded hover:bg-yellow-600/30 transition-colors text-sm">
                        🔄 Rafraîchir les statistiques
                      </button>
                      <button className="w-full bg-red-600/20 text-red-300 px-4 py-2 rounded hover:bg-red-600/30 transition-colors text-sm">
                        🚨 Déclencher alerte test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}