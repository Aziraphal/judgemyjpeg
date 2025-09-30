/**
 * Admin Dashboard - Tableau de bord d'administration
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import { logger } from '@/lib/logger'
import { withAdminProtection } from '@/lib/withAdminProtection'
import UserActionsModal from '@/components/admin/UserActionsModal'

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

interface PhotoAnalytic {
  id: string
  score: number
  analysisTone: string
  createdAt: string
  userEmail: string
  partialScores: string
  filename: string
}

interface PhotoAnalyticsData {
  analytics: PhotoAnalytic[]
  totalCount: number
  stats: {
    avgScore: number
    distribution: {
      excellent: number
      good: number
      average: number
      poor: number
    }
    toneBreakdown: {
      learning: number
      roast: number
      professional: number
    }
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [photoAnalytics, setPhotoAnalytics] = useState<PhotoAnalyticsData | null>(null)
  const [usersData, setUsersData] = useState<any>(null)
  const [feedbacksData, setFeedbacksData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtres Photo Analytics
  const [photoFilters, setPhotoFilters] = useState({
    minScore: '',
    maxScore: '',
    analysisTone: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0,
    sortBy: 'createdAt' as 'score' | 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  // Filtres utilisateurs
  const [userFilters, setUserFilters] = useState({
    search: '',
    status: '',
    subscription: '',
    page: 1,
    limit: 20
  })

  // Modal actions utilisateur
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      loadDashboardData()
    }
  }, [status])

  useEffect(() => {
    if (activeTab === 'photos') {
      loadPhotoAnalytics()
    }
  }, [activeTab, photoFilters])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsersData()
    }
  }, [activeTab, userFilters])

  useEffect(() => {
    if (activeTab === 'feedbacks') {
      loadFeedbacksData()
    }
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [securityResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/security-stats'),
        fetch('/api/admin/dashboard-stats')
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
      logger.error('Failed to load dashboard:', error)
      setError('Erreur lors du chargement du dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadPhotoAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      
      // 🔒 SÉCURITÉ: Validation et nettoyage des filtres côté client
      if (photoFilters.minScore && !isNaN(Number(photoFilters.minScore))) {
        params.append('minScore', photoFilters.minScore)
      }
      if (photoFilters.maxScore && !isNaN(Number(photoFilters.maxScore))) {
        params.append('maxScore', photoFilters.maxScore)
      }
      if (photoFilters.analysisTone && ['learning', 'roast', 'professional'].includes(photoFilters.analysisTone)) {
        params.append('analysisTone', photoFilters.analysisTone)
      }
      if (photoFilters.startDate) {
        params.append('startDate', photoFilters.startDate)
      }
      if (photoFilters.endDate) {
        params.append('endDate', photoFilters.endDate)
      }
      params.append('limit', Math.min(photoFilters.limit, 200).toString()) // Max sécurisé
      params.append('offset', Math.max(photoFilters.offset, 0).toString())
      params.append('sortBy', photoFilters.sortBy)
      params.append('sortOrder', photoFilters.sortOrder)

      const response = await fetch(`/api/admin/photo-analytics?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setPhotoAnalytics(data)
      
    } catch (error) {
      logger.error('Failed to load photo analytics:', error)
      setError('Erreur lors du chargement des analytics photos')
    }
  }

  const loadUsersData = async () => {
    try {
      const params = new URLSearchParams()

      if (userFilters.search) {
        params.append('search', userFilters.search)
      }
      if (userFilters.status) {
        params.append('status', userFilters.status)
      }
      if (userFilters.subscription) {
        params.append('subscription', userFilters.subscription)
      }
      params.append('page', userFilters.page.toString())
      params.append('limit', userFilters.limit.toString())

      const response = await fetch(`/api/admin/users?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setUsersData(data.data)

    } catch (error) {
      console.error('Failed to load users data:', error)
      setError('Erreur lors du chargement des utilisateurs')
    }
  }

  const loadFeedbacksData = async () => {
    try {
      const response = await fetch('/api/admin/feedbacks?limit=50')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setFeedbacksData(data)

    } catch (error) {
      console.error('Failed to load feedbacks:', error)
      setError('Erreur lors du chargement des feedbacks')
    }
  }

  const logout = () => {
    signOut({ callbackUrl: '/' })
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'photos', label: 'Photo Analytics', icon: '📸' },
    { id: 'security', label: 'Sécurité', icon: '🛡️' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'feedbacks', label: 'Feedbacks', icon: '💬' },
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
                  {(securityStats?.criticalAlerts?.length ?? 0) > 0 ? (
                    <div className="space-y-3">
                      {securityStats?.criticalAlerts?.map((alert, index) => (
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

          {/* Photo Analytics Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-8">
              {/* Filtres et Stats */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-white mb-6 flex items-center">
                  📸 <span className="ml-2">Photo Analytics</span>
                  <span className="ml-auto text-sm text-text-gray">
                    {photoAnalytics?.totalCount || 0} analyses totales
                  </span>
                </h3>

                {/* Filtres haute visibilité */}
                <div className="grid md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-900/90 border-2 border-white/40 rounded-lg shadow-lg">
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Score Min</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={photoFilters.minScore}
                      onChange={(e) => setPhotoFilters(prev => ({...prev, minScore: e.target.value}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Score Max</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={photoFilters.maxScore}
                      onChange={(e) => setPhotoFilters(prev => ({...prev, maxScore: e.target.value}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Tone IA</label>
                    <select
                      value={photoFilters.analysisTone}
                      onChange={(e) => setPhotoFilters(prev => ({...prev, analysisTone: e.target.value}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                    >
                      <option value="">Tous</option>
                      <option value="learning">📚 Learning</option>
                      <option value="roast">🔥 Roast</option>
                      <option value="professional">👨‍🎓 Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Date début</label>
                    <input
                      type="date"
                      value={photoFilters.startDate}
                      onChange={(e) => setPhotoFilters(prev => ({...prev, startDate: e.target.value}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Limite</label>
                    <select
                      value={photoFilters.limit}
                      onChange={(e) => setPhotoFilters(prev => ({...prev, limit: Number(e.target.value), offset: 0}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                {/* Tri et Actions */}
                <div className="flex justify-between items-center mb-6 p-4 bg-blue-900/30 border border-blue-500/40 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-white font-bold">Trier par:</label>
                      <select
                        value={photoFilters.sortBy}
                        onChange={(e) => setPhotoFilters(prev => ({...prev, sortBy: e.target.value as 'score' | 'createdAt', offset: 0}))}
                        className="px-3 py-1 bg-white text-gray-900 border border-gray-300 rounded text-sm font-medium focus:border-blue-500 focus:outline-none"
                      >
                        <option value="createdAt">📅 Date</option>
                        <option value="score">📊 Score</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-white font-bold">Ordre:</label>
                      <select
                        value={photoFilters.sortOrder}
                        onChange={(e) => setPhotoFilters(prev => ({...prev, sortOrder: e.target.value as 'asc' | 'desc', offset: 0}))}
                        className="px-3 py-1 bg-white text-gray-900 border border-gray-300 rounded text-sm font-medium focus:border-blue-500 focus:outline-none"
                      >
                        <option value="desc">⬇️ Décroissant</option>
                        <option value="asc">⬆️ Croissant</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setPhotoFilters(prev => ({
                        ...prev,
                        minScore: '',
                        maxScore: '',
                        analysisTone: '',
                        startDate: '',
                        endDate: '',
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                        offset: 0
                      }))
                    }}
                    className="px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/40 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                  >
                    🔄 Reset filtres
                  </button>
                </div>

                {/* Stats Status */}
                {photoAnalytics?.stats && (
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {(photoAnalytics.stats as any).statusCount?.completed || 0}
                      </div>
                      <div className="text-xs text-green-300">✅ Analyses terminées</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {(photoAnalytics.stats as any).statusCount?.pending || 0}
                      </div>
                      <div className="text-xs text-yellow-300">⏳ En cours</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {(photoAnalytics.stats as any).statusCount?.failed || 0}
                      </div>
                      <div className="text-xs text-red-300">❌ Échouées</div>
                    </div>
                  </div>
                )}

                {/* Stats Distribution */}
                {photoAnalytics?.stats && (
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {photoAnalytics.stats.distribution.excellent}
                      </div>
                      <div className="text-xs text-green-300">Excellent (85+)</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {photoAnalytics.stats.distribution.good}
                      </div>
                      <div className="text-xs text-blue-300">Bon (70-84)</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {photoAnalytics.stats.distribution.average}
                      </div>
                      <div className="text-xs text-yellow-300">Moyen (50-69)</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {photoAnalytics.stats.distribution.poor}
                      </div>
                      <div className="text-xs text-red-300">Faible (&lt;50)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tableau des Scores */}
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-text-white">📊 Analyses Récentes</h4>
                  <div className="text-sm text-text-gray">
                    Score moyen: <span className="font-bold text-neon-cyan">{photoAnalytics?.stats.avgScore || 0}/100</span>
                  </div>
                </div>

                {photoAnalytics?.analytics && photoAnalytics.analytics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-cosmic-glassborder text-text-gray">
                          <th className="text-left py-3 px-2">Score</th>
                          <th className="text-left py-3 px-2">Tone</th>
                          <th className="text-left py-3 px-2">Utilisateur</th>
                          <th className="text-left py-3 px-2">Détails</th>
                          <th className="text-left py-3 px-2">Fichier</th>
                          <th className="text-left py-3 px-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {photoAnalytics.analytics.map((analysis) => {
                          // Parser partialScores pour extraire détails
                          let scoreDetails = 'N/A'
                          try {
                            const partial = JSON.parse(analysis.partialScores)
                            if (partial.technical !== undefined && partial.artistic !== undefined) {
                              scoreDetails = `T:${partial.technical} A:${partial.artistic}`
                            }
                          } catch (e) {
                            scoreDetails = 'Parse error'
                          }

                          return (
                          <tr key={analysis.id} className="border-b border-cosmic-glassborder/30 hover:bg-cosmic-glass/10">
                            <td className="py-3 px-2">
                              {(analysis as any).score !== null ? (
                                <span className={`font-bold ${
                                  (analysis as any).score >= 85 ? 'text-green-400' :
                                  (analysis as any).score >= 70 ? 'text-blue-400' :
                                  (analysis as any).score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {(analysis as any).score}/100
                                </span>
                              ) : (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  (analysis as any).status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                  (analysis as any).status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {(analysis as any).status === 'pending' ? '⏳ En cours' :
                                   (analysis as any).status === 'failed' ? '❌ Échouée' : '⚪ N/A'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {(analysis as any).analysisTone ? (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  (analysis as any).analysisTone === 'learning' ? 'bg-green-500/20 text-green-300' :
                                  (analysis as any).analysisTone === 'roast' ? 'bg-red-500/20 text-red-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {(analysis as any).analysisTone === 'learning' ? '📚 Learning' :
                                   (analysis as any).analysisTone === 'roast' ? '🔥 Roast' : '👨‍🎓 Pro'}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-300">
                                  ⚪ N/A
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-text-gray font-mono text-xs">
                              {analysis.userEmail}
                            </td>
                            <td className="py-3 px-2 text-text-white text-xs">
                              {scoreDetails}
                            </td>
                            <td className="py-3 px-2 text-text-gray text-xs truncate max-w-32">
                              {analysis.filename}
                            </td>
                            <td className="py-3 px-2 text-text-gray text-xs">
                              {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-gray">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Aucune analyse trouvée avec ces filtres</p>
                  </div>
                )}

                {/* Pagination sécurisée */}
                {photoAnalytics && photoAnalytics.totalCount > photoFilters.limit && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={() => setPhotoFilters(prev => ({...prev, offset: Math.max(0, prev.offset - prev.limit)}))}
                      disabled={photoFilters.offset === 0}
                      className="px-3 py-1 bg-cosmic-glass/20 text-text-white rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ← Précédent
                    </button>
                    <span className="text-text-gray text-sm">
                      {Math.floor(photoFilters.offset / photoFilters.limit) + 1} / {Math.ceil(photoAnalytics.totalCount / photoFilters.limit)}
                    </span>
                    <button
                      onClick={() => setPhotoFilters(prev => ({...prev, offset: prev.offset + prev.limit}))}
                      disabled={photoFilters.offset + photoFilters.limit >= photoAnalytics.totalCount}
                      className="px-3 py-1 bg-cosmic-glass/20 text-text-white rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Aperçu sécurité */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-white mb-4">🛡️ État de sécurité</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-gray">Sessions suspectes</span>
                      <span className="text-red-400 font-bold">{securityStats?.suspiciousSessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">Événements récents</span>
                      <span className="text-yellow-400 font-bold">{securityStats?.recentSecurityEvents?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">Alertes critiques</span>
                      <span className="text-red-400 font-bold">{securityStats?.criticalAlerts?.length || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/admin/security')}
                    className="w-full mt-4 bg-red-600/20 text-red-300 px-4 py-2 rounded hover:bg-red-600/30 transition-colors"
                  >
                    🔍 Voir tous les événements
                  </button>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-white mb-4">📋 Actions rapides</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/admin/security?tab=events')}
                      className="w-full bg-blue-600/20 text-blue-300 px-4 py-2 rounded hover:bg-blue-600/30 transition-colors text-left"
                    >
                      📋 Événements de sécurité
                    </button>
                    <button
                      onClick={() => router.push('/admin/security?tab=alerts')}
                      className="w-full bg-yellow-600/20 text-yellow-300 px-4 py-2 rounded hover:bg-yellow-600/30 transition-colors text-left"
                    >
                      🚨 Alertes en temps réel
                    </button>
                    <button
                      onClick={() => router.push('/admin/security?tab=analytics')}
                      className="w-full bg-green-600/20 text-green-300 px-4 py-2 rounded hover:bg-green-600/30 transition-colors text-left"
                    >
                      📊 Analytics de sécurité
                    </button>
                    <button
                      onClick={() => router.push('/admin/metrics')}
                      className="w-full bg-neon-cyan/20 text-neon-cyan px-4 py-2 rounded hover:bg-neon-cyan/30 transition-colors text-left"
                    >
                      📈 Métriques Business
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-white mb-6 flex items-center">
                  👥 <span className="ml-2">Gestion des utilisateurs</span>
                  <span className="ml-auto text-sm text-text-gray">
                    {usersData?.pagination?.total || 0} utilisateurs totaux
                  </span>
                </h3>

                {/* Filtres utilisateurs */}
                <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-900/90 border-2 border-white/40 rounded-lg shadow-lg">
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Recherche</label>
                    <input
                      type="text"
                      value={userFilters.search}
                      onChange={(e) => setUserFilters(prev => ({...prev, search: e.target.value, page: 1}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                      placeholder="Email ou nom..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Statut</label>
                    <select
                      value={userFilters.status}
                      onChange={(e) => setUserFilters(prev => ({...prev, status: e.target.value, page: 1}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                    >
                      <option value="">Tous</option>
                      <option value="active">✅ Actifs</option>
                      <option value="inactive">⏳ Inactifs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Abonnement</label>
                    <select
                      value={userFilters.subscription}
                      onChange={(e) => setUserFilters(prev => ({...prev, subscription: e.target.value, page: 1}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                    >
                      <option value="">Tous</option>
                      <option value="free">🆓 Gratuit</option>
                      <option value="premium">💎 Premium</option>
                      <option value="lifetime">♾️ Lifetime</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white font-bold mb-2 drop-shadow-lg">Par page</label>
                    <select
                      value={userFilters.limit}
                      onChange={(e) => setUserFilters(prev => ({...prev, limit: Number(e.target.value), page: 1}))}
                      className="w-full px-3 py-2 bg-white text-gray-900 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none focus:bg-blue-50"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Bouton reset filtres */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      setUserFilters({
                        search: '',
                        status: '',
                        subscription: '',
                        page: 1,
                        limit: 20
                      })
                    }}
                    className="px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/40 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                  >
                    🔄 Reset filtres
                  </button>
                </div>

                {/* Tableau utilisateurs */}
                {usersData?.users && usersData.users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-cosmic-glassborder text-left">
                          <th className="py-3 px-2 text-text-white font-semibold">Email</th>
                          <th className="py-3 px-2 text-text-white font-semibold">Nom</th>
                          <th className="py-3 px-2 text-text-white font-semibold">Statut</th>
                          <th className="py-3 px-2 text-text-white font-semibold">Abonnement</th>
                          <th className="py-3 px-2 text-text-white font-semibold">Analyses</th>
                          <th className="py-3 px-2 text-text-white font-semibold">Inscrit</th>
                          <th className="py-3 px-2 text-text-white font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.users.map((user: any) => (
                          <tr key={user.id} className="border-b border-cosmic-glassborder/30 hover:bg-cosmic-glass/10">
                            <td className="py-3 px-2 text-text-white text-sm font-mono">
                              {user.email}
                            </td>
                            <td className="py-3 px-2 text-text-gray text-sm">
                              {user.name || 'N/A'}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {user.status === 'active' ? '✅ Actif' : '❌ Inactif'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                user.subscription?.type === 'lifetime' ? 'bg-purple-500/20 text-purple-300' :
                                user.subscription?.type === 'premium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {user.subscription?.type === 'lifetime' ? '♾️ Lifetime' :
                                 user.subscription?.type === 'premium' ? '💎 Premium' : '🆓 Gratuit'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-text-white text-sm">
                              {user.stats?.totalAnalyses || 0}
                            </td>
                            <td className="py-3 px-2 text-text-gray text-xs">
                              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowUserModal(true)
                                  }}
                                  className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-xs hover:bg-blue-600/30 font-medium"
                                  title="Gérer l'utilisateur"
                                >
                                  ⚙️ Actions
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-gray">
                    <div className="text-4xl mb-2">👤</div>
                    <p>Aucun utilisateur trouvé avec ces filtres</p>
                  </div>
                )}

                {/* Pagination */}
                {usersData?.pagination && usersData.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={() => setUserFilters(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                      disabled={userFilters.page === 1}
                      className="px-3 py-1 bg-cosmic-glass/20 text-text-white rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ← Précédent
                    </button>
                    <span className="text-text-gray text-sm">
                      {userFilters.page} / {usersData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setUserFilters(prev => ({...prev, page: Math.min(usersData.pagination.totalPages, prev.page + 1)}))}
                      disabled={userFilters.page === usersData.pagination.totalPages}
                      className="px-3 py-1 bg-cosmic-glass/20 text-text-white rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-text-white mb-6 flex items-center">
                  💬 <span className="ml-2">Feedbacks utilisateurs</span>
                  <span className="ml-auto text-sm text-text-gray">
                    {feedbacksData?.data?.length || 0} feedbacks
                  </span>
                </h3>

                {/* Stats rapides */}
                {feedbacksData?.stats && (
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {feedbacksData.stats.byType?.feature || 0}
                      </div>
                      <div className="text-xs text-green-300">💡 Suggestions</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {feedbacksData.stats.byType?.bug || 0}
                      </div>
                      <div className="text-xs text-red-300">🐛 Bugs</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {feedbacksData.stats.byType?.love || 0}
                      </div>
                      <div className="text-xs text-blue-300">❤️ Compliments</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {feedbacksData.stats.byStatus?.new || 0}
                      </div>
                      <div className="text-xs text-yellow-300">🆕 Nouveaux</div>
                    </div>
                  </div>
                )}

                {/* Liste des feedbacks */}
                {feedbacksData?.data && feedbacksData.data.length > 0 ? (
                  <div className="space-y-4">
                    {feedbacksData.data.map((feedback: any) => (
                      <div key={feedback.id} className="bg-cosmic-glass/30 border border-cosmic-glassborder rounded-lg p-4 hover:bg-cosmic-glass/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {feedback.type === 'bug' ? '🐛' :
                               feedback.type === 'feature' ? '💡' :
                               feedback.type === 'love' ? '❤️' :
                               feedback.type === 'hate' ? '😕' : '💬'}
                            </span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-text-white font-semibold">
                                  {feedback.title || 'Sans titre'}
                                </span>
                                {feedback.category && (
                                  <span className="px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan rounded text-xs">
                                    {feedback.category}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted mt-1">
                                {feedback.email || 'Anonyme'} • {new Date(feedback.createdAt).toLocaleString('fr-FR')}
                              </div>
                            </div>
                          </div>

                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            feedback.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                            feedback.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {feedback.status === 'resolved' ? '✅ Résolu' :
                             feedback.status === 'in_progress' ? '⏳ En cours' : '🆕 Nouveau'}
                          </span>
                        </div>

                        <p className="text-text-gray text-sm mb-3 pl-11">
                          {feedback.message}
                        </p>

                        {feedback.rating && (
                          <div className="flex items-center space-x-1 pl-11 mb-2">
                            <span className="text-xs text-text-muted">Note:</span>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        )}

                        {feedback.page && (
                          <div className="text-xs text-text-muted pl-11">
                            📍 Page: <span className="font-mono">{feedback.page}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-gray">
                    <div className="text-4xl mb-2">💬</div>
                    <p>Aucun feedback pour le moment</p>
                  </div>
                )}
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

        {/* Modal actions utilisateur */}
        <UserActionsModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            loadUsersData()
            loadDashboardData()
          }}
        />
      </div>
    </>
  )
}

// Protection admin obligatoire
export const getServerSideProps = withAdminProtection()