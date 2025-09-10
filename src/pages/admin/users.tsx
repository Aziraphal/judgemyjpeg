/**
 * Admin Users Management Page
 * Interface complète de gestion des utilisateurs
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { logger } from '@/lib/logger'
import { withAdminProtection } from '@/lib/withAdminProtection'

interface UserData {
  id: string
  email: string
  name: string
  avatar?: string
  status: 'active' | 'inactive'
  emailVerified: boolean
  createdAt: string
  lastActive: string
  subscription?: {
    type: string
    status: string
    expiresAt: string
    priceId: string
  }
  stats: {
    totalAnalyses: number
    activeSessions: number
  }
}

interface UserResponse {
  users: UserData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    subscription: '',
    page: 1
  })

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    checkAuth()
    loadUsers()
  }, [filters])

  const checkAuth = () => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('admin_token')
      
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.subscription && { subscription: filters.subscription })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data: { data: UserResponse } = await response.json()
      setUsers(data.data.users)
      setPagination(data.data.pagination)
    } catch (error) {
      logger.error('Failed to load users:', error)
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const token = sessionStorage.getItem('admin_token')
      
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, action, data })
      })

      if (response.ok) {
        await loadUsers()
        setShowUserModal(false)
        setSelectedUser(null)
      } else {
        throw new Error('Action failed')
      }
    } catch (error) {
      logger.error('User action failed:', error)
      alert('Erreur lors de l\'action')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-400 bg-green-900/20' 
      : 'text-red-400 bg-red-900/20'
  }

  const getSubscriptionColor = (subscription?: UserData['subscription']) => {
    if (!subscription) return 'text-gray-400 bg-gray-900/20'
    
    switch (subscription.status) {
      case 'active': return 'text-green-400 bg-green-900/20'
      case 'past_due': return 'text-yellow-400 bg-yellow-900/20'
      case 'canceled': return 'text-red-400 bg-red-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <>
      <Head>
        <title>Utilisateurs - Admin JudgeMyJPEG</title>
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
                  <h1 className="text-xl font-bold text-text-white">Gestion des utilisateurs</h1>
                  <p className="text-sm text-text-muted">
                    {pagination.total} utilisateurs au total
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={loadUsers}
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
          {/* Filtres */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-text-white mb-4">Filtres</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Rechercher par email ou nom..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white placeholder-text-muted"
              />

              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>

              <select
                value={filters.subscription}
                onChange={(e) => setFilters({...filters, subscription: e.target.value, page: 1})}
                className="px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white"
              >
                <option value="">Tous les abonnements</option>
                <option value="active">Abonnés actifs</option>
                <option value="free">Utilisateurs gratuits</option>
                <option value="expired">Abonnements expirés</option>
              </select>

              <div className="text-sm text-text-gray flex items-center">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-text-gray">Utilisateurs actifs</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-neon-pink mb-1">
                {users.filter(u => u.subscription?.status === 'active').length}
              </div>
              <div className="text-sm text-text-gray">Abonnements actifs</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {users.reduce((sum, u) => sum + u.stats.totalAnalyses, 0)}
              </div>
              <div className="text-sm text-text-gray">Analyses totales</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {users.filter(u => u.emailVerified).length}
              </div>
              <div className="text-sm text-text-gray">Emails vérifiés</div>
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="glass-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-white mb-4">
                👥 Utilisateurs ({users.length})
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-2"></div>
                  <p className="text-text-gray">Chargement...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">
                  ❌ {error}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-text-gray">
                  <div className="text-4xl mb-4">👤</div>
                  <p>Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-cosmic-glassborder">
                          <th className="text-left py-3 px-4 text-text-gray font-medium">Utilisateur</th>
                          <th className="text-left py-3 px-4 text-text-gray font-medium">Statut</th>
                          <th className="text-left py-3 px-4 text-text-gray font-medium">Abonnement</th>
                          <th className="text-left py-3 px-4 text-text-gray font-medium">Statistiques</th>
                          <th className="text-left py-3 px-4 text-text-gray font-medium">Inscription</th>
                          <th className="text-center py-3 px-4 text-text-gray font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-cosmic-glassborder/30 hover:bg-white/5">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-text-white">{user.name}</div>
                                  <div className="text-sm text-text-gray">{user.email}</div>
                                  {!user.emailVerified && (
                                    <div className="text-xs text-yellow-400">⚠️ Email non vérifié</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                                {user.status === 'active' ? '🟢 Actif' : '🔴 Inactif'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {user.subscription ? (
                                <div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getSubscriptionColor(user.subscription)}`}>
                                    {user.subscription.type.toUpperCase()}
                                  </span>
                                  <div className="text-xs text-text-muted mt-1">
                                    Expire: {formatDate(user.subscription.expiresAt)}
                                  </div>
                                </div>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs text-gray-400 bg-gray-900/20">
                                  Gratuit
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-text-white">
                                📸 {user.stats.totalAnalyses} analyses
                              </div>
                              <div className="text-xs text-text-gray">
                                💻 {user.stats.activeSessions} sessions
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-text-white">
                                {formatDate(user.createdAt)}
                              </div>
                              <div className="text-xs text-text-gray">
                                Actif: {formatDate(user.lastActive)}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowUserModal(true)
                                }}
                                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded text-xs hover:bg-blue-600/30 transition-colors"
                              >
                                Gérer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-cosmic-glassborder">
                    <div className="text-sm text-text-gray">
                      Affichage {(pagination.page - 1) * pagination.limit + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        disabled={pagination.page <= 1}
                        onClick={() => setFilters({...filters, page: pagination.page - 1})}
                        className="px-4 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        ← Précédent
                      </button>
                      
                      <span className="px-4 py-2 text-text-gray">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      
                      <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setFilters({...filters, page: pagination.page + 1})}
                        className="px-4 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal de gestion utilisateur */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-text-white mb-4">
                Gérer l'utilisateur
              </h3>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-text-white">{selectedUser.name}</div>
                    <div className="text-sm text-text-gray">{selectedUser.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                    className="w-full bg-yellow-600/20 text-yellow-300 px-4 py-2 rounded hover:bg-yellow-600/30 transition-colors"
                  >
                    🚫 Suspendre l'utilisateur
                  </button>
                ) : (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'reactivate')}
                    className="w-full bg-green-600/20 text-green-300 px-4 py-2 rounded hover:bg-green-600/30 transition-colors"
                  >
                    ✅ Réactiver l'utilisateur
                  </button>
                )}

                {!selectedUser.emailVerified && (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'verify_email')}
                    className="w-full bg-blue-600/20 text-blue-300 px-4 py-2 rounded hover:bg-blue-600/30 transition-colors"
                  >
                    📧 Vérifier l'email
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
                      // handleDeleteUser(selectedUser.id)
                      alert('Suppression désactivée en démo')
                    }
                  }}
                  className="w-full bg-red-600/20 text-red-300 px-4 py-2 rounded hover:bg-red-600/30 transition-colors"
                >
                  🗑️ Supprimer définitivement
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 bg-cosmic-glass border border-cosmic-glassborder text-text-white px-4 py-2 rounded hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Protection admin avec HOC centralisé
export const getServerSideProps = withAdminProtection()