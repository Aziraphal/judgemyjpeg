import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    // Handle query parameters for messages
    if (router.query.message === 'EmailVerified') {
      setMessage('✅ Email vérifié avec succès ! Vous pouvez maintenant vous connecter.')
    } else if (router.query.error) {
      const errorType = router.query.error as string
      switch (errorType) {
        case 'InvalidToken':
          setError('Lien de vérification invalide')
          break
        case 'TokenNotFound':
          setError('Lien de vérification introuvable')
          break
        case 'TokenExpired':
          setError('Lien de vérification expiré')
          break
        case 'EmailMismatch':
          setError('Email ne correspond pas au lien')
          break
        case 'VerificationFailed':
          setError('Erreur lors de la vérification')
          break
        default:
          setError('Erreur de connexion')
      }
    }
  }, [router.query])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Vérifier si c'est une erreur 2FA
        if (result.error.startsWith('2FA_REQUIRED:')) {
          const [, tempSessionId, email] = result.error.split(':')
          // Rediriger vers la page de vérification 2FA
          router.push(`/auth/verify-2fa?email=${encodeURIComponent(email)}&tempSessionId=${tempSessionId}`)
          return
        }
        
        // Autres erreurs
        if (result.error.includes('verrouillé')) {
          setError(result.error)
        } else if (result.error.includes('Email non vérifié')) {
          setError('Email non vérifié. Vérifiez votre boite email ou créez un nouveau compte.')
        } else {
          setError('Email ou mot de passe incorrect')
        }
      } else {
        // Connexion réussie sans 2FA
        router.push('/')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <>
      <Head>
        <title>Connexion - JudgeMyJPEG</title>
        <meta name="description" content="Connectez-vous à JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="w-full max-w-md px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-glow mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Connexion
              </span>
            </h1>
            <p className="text-text-gray">
              Connectez-vous pour analyser vos photos
            </p>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            {message && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-300 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-text-white mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-text-white mb-2" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-neon-pink"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="spinner-neon w-4 h-4"></div>
                    <span>Connexion...</span>
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-cosmic-glassborder"></div>
              <span className="px-4 text-text-muted text-sm">ou</span>
              <div className="flex-1 border-t border-cosmic-glassborder"></div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full btn-neon-secondary flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link 
                href="/auth/forgot-password"
                className="text-sm text-neon-cyan hover:text-neon-pink transition-colors"
              >
                🔐 Mot de passe oublié ?
              </Link>
            </div>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-text-muted text-sm">
                Pas encore de compte ?{' '}
                <Link href="/auth/signup" className="text-neon-cyan hover:text-neon-pink transition-colors">
                  Créer un compte
                </Link>
              </p>
              <Link href="/" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}