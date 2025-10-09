import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { withAdminProtection } from '@/lib/withAdminProtection'

interface UserAnalytic {
  id: string
  email: string
  name: string | null
  createdAt: string
  monthlyAnalysisCount: number
  totalPhotos: number
  provider: string | null
  lastActivity: string | null
  deviceInfo: string | null
}

export default function UserAnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<UserAnalytic[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today')
  const [stats, setStats] = useState({
    totalNewUsers: 0,
    usersWithAnalyses: 0,
    usersWithoutAnalyses: 0,
    conversionRate: 0
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeFilter])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/user-analytics?period=${timeFilter}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur chargement analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTimeSince = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffHours < 1) return `il y a ${diffMins} min`
    if (diffHours < 24) return `il y a ${diffHours}h`
    return `il y a ${Math.floor(diffHours / 24)}j`
  }

  return (
    <>
      <Head>
        <title>User Analytics - Admin</title>
      </Head>

      <main className="min-h-screen bg-cosmic-overlay p-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📊 User Analytics
              </h1>
              <p className="text-text-gray">
                Analyse du parcours utilisateur et onboarding
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="btn-neon-secondary"
            >
              ← Retour Dashboard
            </button>
          </div>

          {/* Filtres */}
          <div className="glass-card p-6 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  timeFilter === 'today'
                    ? 'bg-neon-pink text-white'
                    : 'bg-cosmic-glass text-text-gray hover:bg-cosmic-glassborder'
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  timeFilter === 'week'
                    ? 'bg-neon-pink text-white'
                    : 'bg-cosmic-glass text-text-gray hover:bg-cosmic-glassborder'
                }`}
              >
                7 derniers jours
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  timeFilter === 'month'
                    ? 'bg-neon-pink text-white'
                    : 'bg-cosmic-glass text-text-gray hover:bg-cosmic-glassborder'
                }`}
              >
                30 derniers jours
              </button>
            </div>
          </div>

          {/* Stats globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="text-text-muted text-sm mb-2">Nouveaux utilisateurs</div>
              <div className="text-3xl font-bold text-neon-cyan">{stats.totalNewUsers}</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-text-muted text-sm mb-2">Avec analyses</div>
              <div className="text-3xl font-bold text-green-400">{stats.usersWithAnalyses}</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-text-muted text-sm mb-2">Sans analyses</div>
              <div className="text-3xl font-bold text-red-400">{stats.usersWithoutAnalyses}</div>
            </div>
            <div className="glass-card p-6">
              <div className="text-text-muted text-sm mb-2">Taux de conversion</div>
              <div className="text-3xl font-bold text-neon-pink">
                {stats.conversionRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Table utilisateurs */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Détail des utilisateurs
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="spinner-neon w-12 h-12 mx-auto"></div>
              </div>
            ) : analytics.length === 0 ? (
              <div className="text-center py-12 text-text-gray">
                Aucun nouvel utilisateur pour cette période
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cosmic-glassborder">
                      <th className="text-left py-3 px-4 text-text-gray font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-text-gray font-semibold">Inscription</th>
                      <th className="text-left py-3 px-4 text-text-gray font-semibold">Provider</th>
                      <th className="text-center py-3 px-4 text-text-gray font-semibold">Photos</th>
                      <th className="text-center py-3 px-4 text-text-gray font-semibold">Analyses</th>
                      <th className="text-left py-3 px-4 text-text-gray font-semibold">Dernière activité</th>
                      <th className="text-left py-3 px-4 text-text-gray font-semibold">Device</th>
                      <th className="text-center py-3 px-4 text-text-gray font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-cosmic-glassborder/30 hover:bg-cosmic-glass/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">{user.email}</div>
                          {user.name && (
                            <div className="text-text-muted text-sm">{user.name}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white text-sm">{formatDate(user.createdAt)}</div>
                          <div className="text-text-muted text-xs">{getTimeSince(user.createdAt)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.provider === 'google'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : user.provider === 'email'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {user.provider || 'credentials'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-neon-cyan font-bold">{user.totalPhotos}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-neon-pink font-bold">{user.monthlyAnalysisCount}</span>
                        </td>
                        <td className="py-4 px-4">
                          {user.lastActivity ? (
                            <>
                              <div className="text-white text-sm">{formatDate(user.lastActivity)}</div>
                              <div className="text-text-muted text-xs">{getTimeSince(user.lastActivity)}</div>
                            </>
                          ) : (
                            <span className="text-text-muted text-sm">Jamais connecté</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {user.deviceInfo ? (
                            <div className="text-text-gray text-xs">
                              {user.deviceInfo}
                            </div>
                          ) : (
                            <span className="text-text-muted text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {user.totalPhotos > 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                              ✓ Actif
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                              ⚠ Inactif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

// Protection admin via getServerSideProps
export const getServerSideProps = withAdminProtection()
