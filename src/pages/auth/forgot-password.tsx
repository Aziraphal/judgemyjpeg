import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Un email de réinitialisation a été envoyé si cette adresse existe dans notre système.'
        })
        setEmail('')
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Une erreur est survenue'
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

  return (
    <>
      <Head>
        <title>Mot de passe oublié - JudgeMyJPEG</title>
        <meta name="description" content="Réinitialiser votre mot de passe JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4" aria-hidden="true">🔐</div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Mot de passe oublié
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
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
                  <label htmlFor="email" className="block text-text-white font-medium mb-2">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:outline-none focus:border-neon-cyan"
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
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
                      Envoi en cours...
                    </span>
                  ) : (
                    '📧 Envoyer le lien de réinitialisation'
                  )}
                </button>

              </form>

              {/* Navigation */}
              <div className="mt-8 text-center space-y-4">
                <Link 
                  href="/auth/signin"
                  className="block text-neon-cyan hover:text-neon-pink transition-colors"
                >
                  ← Retour à la connexion
                </Link>
                <Link 
                  href="/auth/signup"
                  className="block text-text-muted hover:text-text-white transition-colors"
                >
                  Pas encore de compte ? S'inscrire
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>
    </>
  )
}