/**
 * Admin Login Page - Authentification sécurisée pour l'administration
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Head from 'next/head'
import { logger } from '@/lib/logger'

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [credentials, setCredentials] = useState({
    adminSecret: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rediriger si déjà authentifié et admin
  if (status === 'authenticated') {
    router.push('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: credentials.adminSecret
        })
      })

      const data = await response.json()

      if (data.success) {
        // Stocker le token admin en session
        sessionStorage.setItem('admin_token', data.token)
        router.push('/admin/dashboard')
      } else {
        setError(data.message || 'Authentification échouée')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
      logger.error('Admin login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Administration - JudgeMyJPEG</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-space-dark via-cosmic-dark to-space-dark"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-glow-pink rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-glow-cyan rounded-full blur-2xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🛡️
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">
                Administration
              </h1>
              <p className="text-text-gray text-sm mt-2">
                Accès sécurisé au panneau d'administration
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="adminSecret" className="block text-sm font-medium text-text-white mb-2">
                  🔑 Clé d'administration
                </label>
                <input
                  type="password"
                  id="adminSecret"
                  value={credentials.adminSecret}
                  onChange={(e) => setCredentials({ ...credentials, adminSecret: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-xl text-text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Entrez la clé secrète d'administration"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg text-sm">
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !credentials.adminSecret.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </div>
                ) : (
                  '🔐 Accéder à l\'administration'
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div className="text-xs text-yellow-200">
                  <p className="font-medium mb-1">Accès restreint</p>
                  <p>Cette section est réservée aux administrateurs système. Toutes les actions sont auditées et tracées.</p>
                </div>
              </div>
            </div>

            {/* Back to app */}
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