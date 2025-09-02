import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

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

export default function AdminMetricsPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy')
  const [criticalIssues, setCriticalIssues] = useState<Array<{severity: string, message: string}>>([])

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const adminToken = sessionStorage.getItem('admin_token')
      if (!adminToken) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/admin/business-metrics', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setMetrics(data.metrics)
      setHealthStatus(data.health_summary.overall_status)
      setCriticalIssues(data.health_summary.critical_issues)
      setLastUpdate(new Date(data.timestamp).toLocaleTimeString('fr-FR'))
    } catch (error) {
      console.error('Erreur chargement métriques:', error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-text-white">Chargement métriques...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-cosmic-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Erreur chargement métriques</p>
          <button 
            onClick={fetchMetrics}
            className="mt-4 btn-neon-cyan"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cosmic-dark text-text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Business Metrics</h1>
            <p className="text-text-gray">Monitoring en temps réel • Dernière MàJ: {lastUpdate}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={fetchMetrics}
              className="btn-neon-cyan"
            >
              🔄 Actualiser
            </button>
            <Link href="/admin/dashboard" className="btn-ghost">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Statut global */}
        <div className={`p-6 rounded-xl border ${getStatusBg(healthStatus)} mb-8`}>
          <div className="flex items-center justify-between">
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
                <p className="text-text-gray">
                  {criticalIssues.length > 0 ? `${criticalIssues.length} problème(s) détecté(s)` : 'Tous systèmes opérationnels'}
                </p>
              </div>
            </div>
          </div>

          {/* Alertes critiques */}
          {criticalIssues.length > 0 && (
            <div className="mt-4 space-y-2">
              {criticalIssues.map((issue, index) => (
                <div key={index} className={`p-3 rounded-lg ${issue.severity === 'critical' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                  <span className={`text-sm ${issue.severity === 'critical' ? 'text-red-300' : 'text-yellow-300'}`}>
                    {issue.severity === 'critical' ? '🚨' : '⚠️'} {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Métriques Analyses */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              📸 <span className="ml-2">Analyses IA</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Total</span>
                  <span className="font-bold text-neon-cyan">{metrics.analyses.total.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Taux de succès</span>
                  <span className={`font-bold ${metrics.analyses.success_rate > 0.95 ? 'text-green-400' : metrics.analyses.success_rate > 0.90 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {(metrics.analyses.success_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Temps moyen</span>
                  <span className="font-bold text-white">{Math.round(metrics.analyses.avg_processing_time / 1000)}s</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Erreurs (1h)</span>
                  <span className={`font-bold ${metrics.analyses.errors_last_hour > 10 ? 'text-red-400' : metrics.analyses.errors_last_hour > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {metrics.analyses.errors_last_hour}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Métriques Business */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              💰 <span className="ml-2">Business</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Premium actifs</span>
                  <span className="font-bold text-neon-pink">{metrics.subscriptions.active_premium}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">Signups (24h)</span>
                  <span className="font-bold text-green-400">{metrics.subscriptions.new_signups_today}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">MRR estimé</span>
                  <span className="font-bold text-yellow-400">€{Math.round(metrics.subscriptions.mrr)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Santé APIs */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              🔌 <span className="ml-2">APIs Externes</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-text-gray">OpenAI</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(metrics.api_health.openai_status)}`}>
                    {metrics.api_health.openai_status === 'healthy' ? '✅ OK' : '❌ DOWN'}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-text-gray">Stripe</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(metrics.api_health.stripe_status)}`}>
                    {metrics.api_health.stripe_status === 'healthy' ? '✅ OK' : '❌ DOWN'}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-gray">DB réponse</span>
                  <span className={`font-bold ${metrics.api_health.db_response_time > 2000 ? 'text-red-400' : metrics.api_health.db_response_time > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {metrics.api_health.db_response_time}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 p-6 glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">⚡ Actions Rapides</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/admin/security" className="btn-ghost text-center">
              🛡️ Sécurité
            </Link>
            <Link href="/admin/users" className="btn-ghost text-center">
              👥 Utilisateurs  
            </Link>
            <button onClick={() => window.open('https://sentry.io', '_blank')} className="btn-ghost text-center">
              📊 Sentry
            </button>
            <button onClick={() => window.open('https://railway.app', '_blank')} className="btn-ghost text-center">
              🚂 Railway
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}