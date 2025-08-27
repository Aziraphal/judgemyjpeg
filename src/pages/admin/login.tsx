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
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Vérifier si déjà connecté en tant qu'admin
  if (typeof window !== 'undefined' && sessionStorage.getItem('admin_token')) {
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

      if (!response.ok) {
        // Debug pour production
        console.error('Admin auth failed:', response.status, response.statusText)
        setDebugInfo(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Stocker le token admin en session
        sessionStorage.setItem('admin_token', data.token)
        
        // Debug pour vérifier le token
        console.log('Admin token stored:', !!data.token)
        setDebugInfo('Token créé avec succès')
        
        router.push('/admin/dashboard')
      } else {
        setError(data.message || 'Authentification échouée')
        setDebugInfo(`Erreur API: ${data.message}`)
        console.error('Admin auth error:', data.message)
      }
    } catch (error) {
      console.error('Admin login network error:', error)
      setError('Erreur de connexion au serveur. Vérifiez votre connexion.')
      setDebugInfo(`Erreur réseau: ${error}`)
      logger.error('Admin login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Ajout d'un bouton de test pour diagnostiquer
  const handleDebugTest = async () => {
    try {
      const response = await fetch('/api/admin/auth', { 
        method: 'GET' 
      })
      setDebugInfo(`Test API: ${response.status} ${response.statusText}`)
    } catch (error) {
      setDebugInfo(`Test API échoué: ${error}`)
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

              {debugInfo && (
                <div className="bg-blue-900/20 border border-blue-500/30 text-blue-300 p-4 rounded-lg text-sm">
                  🔍 Debug: {debugInfo}
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

            {/* Debug section (temporarily in production) */}
            <div className="mt-6">
              <button
                onClick={handleDebugTest}
                className="w-full bg-gray-600/20 text-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-600/30 transition-colors"
              >
                🔧 Test de connectivité API
              </button>
            </div>

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