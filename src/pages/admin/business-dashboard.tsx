/**
 * Dashboard Business Metrics - Admin Panel
 * Visualisation temps réel des KPIs critiques
 */
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface DashboardData {
  timestamp: string
  timeRange: string
  overview: {
    totalUsers: number
    totalAnalyses: number
    analysesThisPeriod: number
    activePremium: number
    newSignupsToday: number
    mrr: number
    successRate: string
    avgProcessingTime: string
  }
  health: {
    apis: {
      openai_status: string
      stripe_status: string
      db_response_time: number
    }
    status: 'healthy' | 'degraded' | 'critical'
    alerts: string[]
  }
  analytics: {
    scoreDistribution: { [key: string]: number }
    toneDistribution: Array<{ tone: string; count: number; percentage: string }>
    topPhotoTypes: Array<{ type: string; count: number }>
    topLanguages: Array<{ language: string; count: number }>
  }
  revenue: {
    totalRevenue: string
    newPayments: number
    avgRevenuePerUser: string
  }
  retention: {
    day7: string
    day30: string
  }
  conversionFunnel: {
    visitors: number
    signups: number
    firstAnalysis: number
    premium: number
    conversionRate: string
  }
}

export default function BusinessDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Vérification admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // TODO: Vérifier rôle admin via session
  }, [status, router])

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const token = process.env.NEXT_PUBLIC_ADMIN_METRICS_TOKEN || 'admin-secret-token'

      const response = await fetch(`/api/admin/business-dashboard?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchDashboard()

    if (autoRefresh) {
      const interval = setInterval(fetchDashboard, 60000) // Refresh chaque minute
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 Business Dashboard</h1>
            <p className="text-gray-400">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded ${
                autoRefresh ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchDashboard}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              🔃 Refresh Now
            </button>
          </div>
        </div>

        {/* Health Status Banner */}
        {data.health.status !== 'healthy' && (
          <div className={`mb-6 p-4 rounded-lg ${
            data.health.status === 'critical' ? 'bg-red-900/50' : 'bg-yellow-900/50'
          }`}>
            <h3 className="text-xl font-bold mb-2">
              {data.health.status === 'critical' ? '🚨 CRITICAL ALERTS' : '⚠️ WARNINGS'}
            </h3>
            <ul className="list-disc list-inside">
              {data.health.alerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={data.overview.totalUsers.toLocaleString()}
            icon="👥"
            subtitle={`${data.overview.newSignupsToday} signups today`}
          />
          <MetricCard
            title="Total Analyses"
            value={data.overview.totalAnalyses.toLocaleString()}
            icon="📸"
            subtitle={`${data.overview.analysesThisPeriod} this period`}
          />
          <MetricCard
            title="Active Premium"
            value={data.overview.activePremium.toLocaleString()}
            icon="⭐"
            subtitle={`Conversion: ${data.conversionFunnel.conversionRate}`}
          />
          <MetricCard
            title="MRR"
            value={`€${data.overview.mrr.toFixed(2)}`}
            icon="💰"
            subtitle={`€${data.revenue.totalRevenue} this period`}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Success Rate"
            value={data.overview.successRate}
            icon="✅"
            color="green"
          />
          <MetricCard
            title="Avg Processing"
            value={data.overview.avgProcessingTime}
            icon="⚡"
            color="blue"
          />
          <MetricCard
            title="DB Response"
            value={`${data.health.apis.db_response_time}ms`}
            icon="🗄️"
            color={data.health.apis.db_response_time > 1000 ? 'yellow' : 'green'}
          />
        </div>

        {/* API Health */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔌 API Health</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatusBadge
              label="OpenAI"
              status={data.health.apis.openai_status}
            />
            <StatusBadge
              label="Stripe"
              status={data.health.apis.stripe_status}
            />
            <StatusBadge
              label="Database"
              status={data.health.apis.db_response_time < 500 ? 'healthy' : 'degraded'}
            />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Distribution */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📊 Score Distribution</h3>
            <div className="space-y-2">
              {Object.entries(data.analytics.scoreDistribution).map(([range, count]) => (
                <div key={range} className="flex justify-between items-center">
                  <span className="text-gray-300">{range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full"
                        style={{
                          width: `${(count / data.overview.analysesThisPeriod) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-white font-mono">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tone Distribution */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🎭 Mode Popularity</h3>
            <div className="space-y-3">
              {data.analytics.toneDistribution.map((tone) => (
                <div key={tone.tone} className="flex justify-between items-center">
                  <span className="capitalize text-gray-300">
                    {tone.tone === 'roast' && '🔥 Roast'}
                    {tone.tone === 'professional' && '👨‍🎓 Professional'}
                    {tone.tone === 'learning' && '📚 Learning'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono">{tone.count}</span>
                    <span className="text-gray-400">({tone.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Photo Types */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📸 Top Photo Types</h3>
            <div className="space-y-2">
              {data.analytics.topPhotoTypes.map((pt) => (
                <div key={pt.type} className="flex justify-between">
                  <span className="text-gray-300 capitalize">{pt.type}</span>
                  <span className="text-white font-mono">{pt.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Languages */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🌍 Top Languages</h3>
            <div className="space-y-2">
              {data.analytics.topLanguages.map((lang) => (
                <div key={lang.language} className="flex justify-between">
                  <span className="text-gray-300 uppercase">{lang.language}</span>
                  <span className="text-white font-mono">{lang.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retention */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📈 Retention Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 mb-1">D7 Retention</p>
              <p className="text-3xl font-bold">{data.retention.day7}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">D30 Retention</p>
              <p className="text-3xl font-bold">{data.retention.day30}</p>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🎯 Conversion Funnel</h2>
          <div className="space-y-4">
            <FunnelStep label="Visitors" value={data.conversionFunnel.visitors} />
            <FunnelStep label="Signups" value={data.conversionFunnel.signups} />
            <FunnelStep label="First Analysis" value={data.conversionFunnel.firstAnalysis} />
            <FunnelStep label="Premium Users" value={data.conversionFunnel.premium} />
            <div className="text-center text-xl mt-4">
              Final Conversion Rate: <span className="font-bold text-green-400">{data.conversionFunnel.conversionRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Components
function MetricCard({ title, value, icon, subtitle, color = 'blue' }: any) {
  const colors = {
    blue: 'bg-blue-900/30 border-blue-700',
    green: 'bg-green-900/30 border-green-700',
    yellow: 'bg-yellow-900/30 border-yellow-700',
    red: 'bg-red-900/30 border-red-700'
  }

  return (
    <div className={`rounded-lg p-6 border ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function StatusBadge({ label, status }: any) {
  const statusColors = {
    healthy: 'bg-green-600',
    degraded: 'bg-yellow-600',
    down: 'bg-red-600'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
      <span className="text-gray-300">{label}</span>
      <span className="text-xs text-gray-500 uppercase">{status}</span>
    </div>
  )
}

function FunnelStep({ label, value }: any) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-700 rounded">
      <span className="text-gray-300">{label}</span>
      <span className="text-xl font-bold">{value.toLocaleString()}</span>
    </div>
  )
}