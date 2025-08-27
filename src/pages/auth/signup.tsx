import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator'
import TurnstileProtection from '@/components/TurnstileProtection'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<any>(null)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    // Validation robuste du mot de passe
    if (!passwordValidation?.isValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité')
      setIsLoading(false)
      return
    }

    // Vérification anti-bot
    if (!turnstileToken) {
      setError('Veuillez compléter la vérification anti-bot')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nickname: formData.nickname,
          email: formData.email,
          password: formData.password,
          turnstileToken
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setShowEmailVerification(true)
        // Pas d'auto-connexion - l'utilisateur doit vérifier son email
      } else {
        setError(data.error || 'Erreur lors de la création du compte')
        // Afficher les détails de validation si disponibles
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join(', '))
        }
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  if (success && showEmailVerification) {
    return (
      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="w-full max-w-lg px-4 relative z-10">
          <div className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-neon-cyan mb-4">Vérifiez votre email</h2>
            <p className="text-text-gray mb-6">
              Un lien de vérification a été envoyé à <br/>
              <span className="text-neon-pink font-semibold">{formData.email}</span>
            </p>
            <div className="bg-cosmic-glass/50 border border-cosmic-glassborder rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm text-text-muted">
                <p className="flex items-center justify-center space-x-2">
                  <span>Vérifiez votre boîte de réception et vos spams</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span>Le lien expire dans 24 heures</span>
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => signIn('email', { email: formData.email })}
                className="btn-neon-secondary text-sm"
              >
                Envoyer l'email
              </button>
              <div>
                <Link href="/auth/signin" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">
                  ← Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>Inscription - JudgeMyJPEG</title>
        <meta name="description" content="Créez votre compte JudgeMyJPEG" />
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
                Créer un compte
              </span>
            </h1>
            <p className="text-text-gray">
              Rejoignez JudgeMyJPEG et obtenez 3 analyses gratuites !
            </p>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-text-white mb-2" htmlFor="name">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-text-white mb-2" htmlFor="nickname">
                  Pseudo (nom affiché)
                  <span className="text-neon-cyan text-xs ml-2">✨ Optionnel</span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                  placeholder="PhotoMaster, ArtistPro, etc."
                />
                <p className="text-xs text-text-muted mt-1">
                  Ce nom sera affiché sur le site (ex: "Bonjour, MonPseudo"). Si vide, votre nom complet sera utilisé.
                </p>
              </div>

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
                  placeholder="Au moins 12 caractères sécurisés"
                  autoComplete="new-password"
                  required
                />
                <PasswordStrengthIndicator 
                  password={formData.password}
                  email={formData.email}
                  onValidationChange={setPasswordValidation}
                />
              </div>

              <div>
                <label className="block text-text-white mb-2" htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                  placeholder="Répétez votre mot de passe"
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Protection anti-bot */}
              <div className="flex justify-center">
                <TurnstileProtection
                  onVerify={setTurnstileToken}
                  onError={() => setError('Erreur de vérification anti-bot')}
                  theme="auto"
                  size="compact"
                  appearance="interaction-only"
                  className="mb-4"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordValidation?.isValid || !turnstileToken}
                className={`w-full ${
                  !passwordValidation?.isValid && formData.password
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'btn-neon-pink'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="spinner-neon w-4 h-4"></div>
                    <span>Création...</span>
                  </span>
                ) : (
                  'Créer mon compte'
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

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-text-muted text-sm">
                Déjà un compte ?{' '}
                <Link href="/auth/signin" className="text-neon-cyan hover:text-neon-pink transition-colors">
                  Se connecter
                </Link>
              </p>
              <Link href="/" className="text-text-muted text-sm hover:text-neon-cyan transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>

            {/* Benefits */}
            <div className="mt-8 p-4 bg-cosmic-glass/50 border border-cosmic-glassborder rounded-lg">
              <h3 className="text-sm font-semibold text-neon-cyan mb-2">Inclus gratuitement :</h3>
              <ul className="space-y-1 text-xs text-text-gray">
                <li>• 3 analyses par mois</li>
                <li>• Mode Pro & Cassant</li>
                <li>• Scores et conseils détaillés</li>
                <li>• Accès au dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}