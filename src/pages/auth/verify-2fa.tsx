/**
 * Page de vérification 2FA - Étape après login mot de passe
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, getSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'

export default function Verify2FAPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [code, setCode] = useState('')
  const [isBackupCode, setIsBackupCode] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)

  // Récupérer les données de session temporaire depuis query params
  const { email, tempSessionId } = router.query

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    getSession().then(session => {
      if (session) {
        router.push('/dashboard')
      }
    })

    // Si pas de session temporaire, rediriger vers login
    if (router.isReady && (!email || !tempSessionId)) {
      router.push('/auth/signin?error=SessionExpired')
    }
  }, [router, email, tempSessionId])

  // Vérifier le code 2FA
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code) {
      setError('Code requis')
      return
    }

    if (!isBackupCode && code.length !== 6) {
      setError('Code de 6 chiffres requis')
      return
    }

    if (isBackupCode && !code.includes('-')) {
      setError('Code de récupération format XXXX-XXXX requis')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-2fa-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tempSessionId,
          code,
          isBackupCode
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 2FA vérifié, finaliser la connexion
        const signInResult = await signIn('credentials-2fa', {
          email,
          tempSessionId,
          verificationToken: data.verificationToken,
          redirect: false
        })

        if (signInResult?.ok) {
          setSuccess('Connexion réussie !')
          router.push(data.redirect || '/dashboard')
        } else {
          setError('Erreur lors de la finalisation de la connexion')
        }
      } else {
        setError(data.message || 'Code incorrect')
        setAttemptsLeft(data.attemptsLeft || attemptsLeft - 1)
        
        if (attemptsLeft <= 1) {
          // Rediriger vers login après épuisement des tentatives
          setTimeout(() => {
            router.push('/auth/signin?error=TooManyAttempts')
          }, 2000)
        }
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Annuler et retourner au login
  const handleCancel = () => {
    router.push('/auth/signin')
  }

  if (!email || !tempSessionId) {
    return (
      <div className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Vérification 2FA - JudgeMyJPEG</title>
        <meta name="description" content="Vérifiez votre authentification à deux facteurs" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="w-full max-w-md px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-glow mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Vérification 2FA
              </span>
            </h1>
            <p className="text-text-gray text-sm">
              Entrez le code de votre application d'authentification pour {email}
            </p>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
                {attemptsLeft > 0 && attemptsLeft < 3 && (
                  <p className="text-red-400 text-xs mt-1">
                    Tentatives restantes : {attemptsLeft}
                  </p>
                )}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-6">
              
              {/* Toggle type de code */}
              <div className="flex justify-center space-x-1 bg-cosmic-glass rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupCode(false)
                    setCode('')
                    setError('')
                  }}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    !isBackupCode 
                      ? 'bg-neon-cyan/20 text-neon-cyan' 
                      : 'text-text-gray hover:text-text-white'
                  }`}
                >
                  📱 Code App
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupCode(true)
                    setCode('')
                    setError('')
                  }}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    isBackupCode 
                      ? 'bg-neon-pink/20 text-neon-pink' 
                      : 'text-text-gray hover:text-text-white'
                  }`}
                >
                  🔑 Code Récup
                </button>
              </div>

              {/* Input code */}
              <div>
                <label className="block text-text-white mb-2 text-sm">
                  {isBackupCode ? 'Code de récupération' : 'Code d\'authentification'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    let value = e.target.value
                    if (!isBackupCode) {
                      // Codes TOTP: seulement chiffres, max 6
                      value = value.replace(/\D/g, '').slice(0, 6)
                    } else {
                      // Codes backup: format XXXX-XXXX
                      value = value.toUpperCase().replace(/[^A-F0-9-]/g, '').slice(0, 9)
                      if (value.length === 4 && !value.includes('-')) {
                        value = value + '-'
                      }
                    }
                    setCode(value)
                  }}
                  className={`w-full p-4 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white text-center text-xl font-mono tracking-wider focus:outline-none focus:border-neon-cyan ${
                    isBackupCode ? '' : 'tracking-[0.5em]'
                  }`}
                  placeholder={isBackupCode ? "XXXX-XXXX" : "000000"}
                  maxLength={isBackupCode ? 9 : 6}
                  autoComplete="off"
                  disabled={loading}
                  autoFocus
                />
                
                {!isBackupCode && (
                  <p className="text-text-muted text-xs mt-2 text-center">
                    Le code change toutes les 30 secondes
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !code || (!isBackupCode && code.length !== 6)}
                  className="btn-neon-primary w-full"
                >
                  {loading ? '🔄 Vérification...' : '✅ Vérifier'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-neon-secondary w-full"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>

            {/* Help */}
            <div className="mt-6 pt-6 border-t border-cosmic-glassborder">
              <div className="text-center space-y-2 text-xs text-text-muted">
                <p>
                  💡 <strong>Problème ?</strong> Utilisez un code de récupération
                </p>
                <p>
                  📧 <Link href="/contact" className="text-neon-cyan hover:underline">
                    Contactez le support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}