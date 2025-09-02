/**
 * Admin Login Page - Authentification sécurisée avec métriques intégrées
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Head from 'next/head'
import { logger } from '@/lib/logger'

interface BusinessMetrics {
  analyses: {
    total: number
    success_rate: number
    avg_processing_time: number
    errors_last_hour: number
  }
  subscriptions: {
    active_premium: number
    new_signups_today: number
    churn_rate_7d: number
    mrr: number
  }
  api_health: {
    openai_status: 'healthy' | 'degraded' | 'down'
    stripe_status: 'healthy' | 'degraded' | 'down'  
    db_response_time: number
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [showMetrics, setShowMetrics] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy')
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [isTestingAlerts, setIsTestingAlerts] = useState(false)
  const [alertStatus, setAlertStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Vérifier si utilisateur est admin
  const isAdmin = session?.user?.email && 
    ['admin@judgemyjpeg.com', 'contact@judgemyjpeg.com', 'cyril.paquier@gmail.com'].includes(session.user.email)

  useEffect(() => {
    if (isAdmin) {
      setShowMetrics(true)
      fetchMetrics()
      const interval = setInterval(fetchMetrics, 30000) // Auto-refresh
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true)
    try {
      const response = await fetch('/api/admin/business-metrics')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      setMetrics(data.metrics)
      setHealthStatus(data.health_summary.overall_status)
      setLastUpdate(new Date(data.timestamp).toLocaleTimeString('fr-FR'))
      setError(null)
    } catch (error) {
      console.error('Erreur chargement métriques:', error)
      setError('Erreur chargement des métriques admin')
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const testAlertSystem = async () => {
    setIsTestingAlerts(true)
    setAlertStatus('')
    try {
      const response = await fetch('/api/admin/alerts/check', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setAlertStatus(`✅ Test réussi: ${data.test_alerts} alertes envoyées par email`)
      } else {
        setAlertStatus('❌ Test échoué')
      }
    } catch (error) {
      console.error('Erreur test alertes:', error)
      setAlertStatus('❌ Erreur lors du test')
    } finally {
      setIsTestingAlerts(false)
    }
  }

  const handleLogin = () => {
    signIn('google', { callbackUrl: '/admin/login' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400' 
      case 'down': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/30'
      case 'degraded': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'down': return 'bg-red-500/10 border-red-500/30'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'critical': return 'bg-red-500/10 border-red-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  // Affichage conditionnel : login ou métriques
  if (!session) {
    // Pas connecté - afficher login
    return (
      <>
        <Head>
          <title>Admin Login - JudgeMyJPEG</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-space-dark via-cosmic-dark to-space-dark"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-glow-pink rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-glow-cyan rounded-full blur-2xl opacity-15 animate-pulse"></div>

          <div className="relative z-10 w-full max-w-md px-6">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🛡️
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text mb-4">
                Administration
              </h1>
              <p className="text-text-gray mb-6">Connectez-vous avec votre compte admin</p>
              
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
              >
                🔐 Se connecter avec Google
              </button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-text-gray hover:text-text-white text-sm transition-colors"
                >
                  ← Retour à l'application
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!isAdmin) {
    // Connecté mais pas admin
    return (
      <>
        <Head>
          <title>Accès refusé - JudgeMyJPEG</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-xl font-bold text-red-400 mb-2">Accès non autorisé</h1>
            <p className="text-text-gray mb-6">Votre compte ({session.user?.email}) n'a pas les permissions admin.</p>
            <button
              onClick={() => router.push('/')}
              className="btn-neon-cyan"
            >
              Retour à l'application
            </button>
          </div>
        </div>
      </>
    )
  }

  // Admin connecté - afficher métriques
  return (
    <>
      <Head>
        <title>Admin Metrics - JudgeMyJPEG</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-cosmic-dark text-text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📊 Admin Metrics</h1>
              <p className="text-text-gray">Connecté: {session.user?.email} • MàJ: {lastUpdate}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchMetrics}
                disabled={isLoadingMetrics}
                className="btn-neon-cyan"
              >
                {isLoadingMetrics ? '⏳' : '🔄'} Actualiser
              </button>
              <button
                onClick={testAlertSystem}
                disabled={isTestingAlerts}
                className="btn-neon-pink"
              >
                {isTestingAlerts ? '⏳' : '🚨'} Test Alertes
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="btn-ghost"
              >
                📋 Dashboard
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6">
              ❌ {error}
            </div>
          )}

          {alertStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              alertStatus.includes('✅') 
                ? 'bg-green-900/20 border border-green-500/30 text-green-300'
                : 'bg-red-900/20 border border-red-500/30 text-red-300'
            }`}>
              {alertStatus}
            </div>
          )}

          {metrics ? (
            <>
              {/* Statut global */}
              <div className={`p-6 rounded-xl border ${getStatusBg(healthStatus)} mb-8`}>
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl ${getStatusColor(healthStatus)}`}>
                    {healthStatus === 'healthy' && '✅'}
                    {healthStatus === 'warning' && '⚠️'}
                    {healthStatus === 'critical' && '🚨'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Statut Global: {healthStatus === 'healthy' ? 'Sain' : healthStatus === 'warning' ? 'Attention' : 'Critique'}
                    </h2>
                    <p className="text-text-gray">Système opérationnel</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Analyses */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📸 Analyses IA</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-gray">Total</span>
                      <span className="font-bold text-neon-cyan">{metrics.analyses.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">Taux succès</span>
                      <span className={`font-bold ${metrics.analyses.success_rate > 0.95 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {(metrics.analyses.success_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">Temps moyen</span>
                      <span className="font-bold text-white">{Math.round(metrics.analyses.avg_processing_time / 1000)}s</span>
                    </div>
                  </div>
                </div>

                {/* Business */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">💰 Business</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-gray">Premium actifs</span>
                      <span className="font-bold text-neon-pink">{metrics.subscriptions.active_premium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">Signups (24h)</span>
                      <span className="font-bold text-green-400">{metrics.subscriptions.new_signups_today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">MRR estimé</span>
                      <span className="font-bold text-yellow-400">€{Math.round(metrics.subscriptions.mrr)}</span>
                    </div>
                  </div>
                </div>

                {/* APIs */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🔌 APIs</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-gray">OpenAI</span>
                      <span className={`font-bold ${getStatusColor(metrics.api_health.openai_status)}`}>
                        {metrics.api_health.openai_status === 'healthy' ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">Stripe</span>
                      <span className={`font-bold ${getStatusColor(metrics.api_health.stripe_status)}`}>
                        {metrics.api_health.stripe_status === 'healthy' ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-gray">DB</span>
                      <span className="font-bold text-green-400">{metrics.api_health.db_response_time}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Alertes Automatiques */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  🚨 <span className="ml-2">Système d'Alertes Automatiques</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 font-semibold mb-2">📧 Notifications Email</h4>
                      <p className="text-sm text-text-gray">
                        Alertes critiques envoyées automatiquement à<br/>
                        <strong className="text-blue-300">contact.judgemyjpeg@gmail.com</strong>
                      </p>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h4 className="text-yellow-300 font-semibold mb-2">⚡ Seuils Surveillés</h4>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Taux succès analyses &lt; 85%</li>
                        <li>• Temps réponse &gt; 30s</li>
                        <li>• Erreurs &gt; 20/heure</li>
                        <li>• APIs externes en panne</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-sm text-green-300 flex items-center">
                      <span className="mr-2">✅</span>
                      <strong>Surveillance active:</strong> Vérification automatique toutes les 30s lors de l'accès aux métriques
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
              <p className="text-text-gray">Chargement des métriques...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}