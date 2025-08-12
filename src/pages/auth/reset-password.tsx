import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Les mots de passe ne correspondent pas'
      })
      return
    }

    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Le mot de passe doit contenir au moins 8 caractères'
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Mot de passe réinitialisé avec succès ! Redirection...'
        })
        
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erreur lors de la réinitialisation'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur de connexion. Réessayez plus tard.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">Token de réinitialisation manquant</h1>
          <Link href="/auth/forgot-password" className="text-neon-cyan hover:text-neon-pink">
            ← Demander un nouveau lien
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>Nouveau mot de passe - JudgeMyJPEG</title>
        <meta name="description" content="Définir un nouveau mot de passe pour JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4" aria-hidden="true">🔑</div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Nouveau mot de passe
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>

          {/* Form */}
          <div className="max-w-md mx-auto">
            <div className="glass-card p-8">
              
              {message && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  message.type === 'success' 
                    ? 'bg-green-900/30 border-green-500/30 text-green-300'
                    : 'bg-red-900/30 border-red-500/30 text-red-300'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label htmlFor="password" className="block text-text-white font-medium mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan pr-12"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-white"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-text-white font-medium mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>

                <div className="text-xs text-text-muted">
                  ⚡ Le mot de passe doit contenir au moins 8 caractères
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full p-3 rounded-lg font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-neon-pink/20 hover:bg-neon-pink/30 border border-neon-pink/30 text-neon-pink'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="spinner-neon w-5 h-5 mr-2"></div>
                      Réinitialisation...
                    </span>
                  ) : (
                    '🔒 Définir le nouveau mot de passe'
                  )}
                </button>

              </form>

              {/* Navigation */}
              <div className="mt-8 text-center">
                <Link 
                  href="/auth/signin"
                  className="text-text-muted hover:text-text-white transition-colors"
                >
                  ← Retour à la connexion
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>
    </>
  )
}