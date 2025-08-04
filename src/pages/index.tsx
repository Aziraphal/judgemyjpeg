import Head from 'next/head'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'

export default function Home() {
  const { data: session, status } = useSession()
  const [userSubscription, setUserSubscription] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/subscription/status')
        .then(res => res.json())
        .then(data => setUserSubscription(data))
        .catch(err => console.error('Error fetching subscription:', err))
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>JudgeMyJPEG - L'IA qui juge vos photos sans pitié</title>
        <meta name="description" content="L'IA qui analyse vos photos avec humour ou professionnalisme selon votre choix !" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating orbs */}
        <div className="absolute top-20 left-4 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-glow-pink rounded-full blur-xl float opacity-30"></div>
        <div className="absolute bottom-32 right-8 sm:right-16 w-24 sm:w-48 h-24 sm:h-48 bg-glow-cyan rounded-full blur-xl float opacity-20" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-12 sm:w-24 h-12 sm:h-24 bg-glow-pink rounded-full blur-lg float opacity-25" style={{animationDelay: '0.5s'}}></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header avec navigation utilisateur */}
          {session && (
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-text-gray">
                Bonjour, <span className={`font-semibold ${
                  userSubscription?.subscriptionStatus === 'premium' || userSubscription?.subscriptionStatus === 'lifetime'
                    ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]' // Effet doré brillant
                    : 'text-neon-cyan'
                }`}>
                  {session.user?.name}
                  {userSubscription?.subscriptionStatus === 'lifetime' && ' ✨'}
                  {userSubscription?.subscriptionStatus === 'premium' && ' 💎'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-neon-secondary text-sm"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={async () => {
                    try {
                      console.log('Logout attempt for:', session?.user?.email)
                      
                      // Nettoyer TOUS les cookies du domaine
                      const allCookies = document.cookie.split(';')
                      allCookies.forEach(cookie => {
                        const eqPos = cookie.indexOf('=')
                        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
                        // Supprimer tous les cookies, pas seulement NextAuth
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.judgemyjpeg.fr; secure`
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
                      })
                      
                      // Vider le localStorage et sessionStorage
                      localStorage.clear()
                      sessionStorage.clear()
                      
                      // Déconnexion NextAuth
                      await signOut({ redirect: false })
                      
                      // Attendre un peu puis forcer le rechargement avec cache bust
                      setTimeout(() => {
                        window.location.href = '/?_=' + Date.now()
                      }, 100)
                      
                    } catch (error) {
                      console.error('Logout error:', error)
                      // Force reload avec cache bust
                      window.location.href = '/?_=' + Date.now()
                    }
                  }}
                  className="btn-neon-secondary text-sm"
                >
                  Déconnexion
                </button>
                <button
                  onClick={() => {
                    // DÉCONNEXION D'URGENCE - Solution radicale
                    console.log('EMERGENCY LOGOUT')
                    
                    // Vider TOUT brutalement
                    document.cookie.split(";").forEach(c => {
                      const eqPos = c.indexOf("=")
                      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.judgemyjpeg.fr`
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    })
                    
                    localStorage.clear()
                    sessionStorage.clear()
                    
                    // Redirection brutale avec nettoyage cache
                    window.location.replace('/?emergency_logout=' + Date.now())
                  }}
                  className="btn-neon-secondary text-xs bg-red-600 hover:bg-red-700 px-2"
                >
                  🚨
                </button>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                JudgeMyJPEG
              </span>
            </h1>
            <p className="text-xl text-text-gray mb-8 max-w-2xl mx-auto">
              <span className="text-neon-cyan">Analyse IA professionnelle</span> de vos photos
            </p>
            
            {!session ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <button
                    onClick={() => window.location.href = '/auth/signup'}
                    className="btn-neon-pink text-lg px-8 py-3"
                  >
                    🚀 Créer un compte
                  </button>
                  <button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="btn-neon-secondary text-lg px-8 py-3"
                  >
                    🔑 Se connecter
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => window.location.href = '/analyze'}
                  className="btn-neon-pink text-xl px-12 py-4 hover-glow"
                >
                  📸 Analyser une photo
                </button>
                
                {/* Actions secondaires */}
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                  <button 
                    onClick={() => window.location.href = '/gallery'}
                    className="btn-neon-secondary text-sm px-4 py-2"
                  >
                    🏆 Top Photos
                  </button>
                  <button 
                    onClick={() => window.location.href = '/collections'}
                    className="btn-neon-secondary text-sm px-4 py-2"
                  >
                    📁 Collections
                  </button>
                  <button 
                    onClick={() => window.location.href = '/pricing'}
                    className="btn-neon-cyan text-sm px-4 py-2"
                  >
                    💎 Upgrade Pro
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-lg font-bold mb-3 text-neon-cyan">Analyse IA</h3>
              <p className="text-text-gray text-sm">
                Analyse complète par <span className="text-neon-pink">Intelligence Artificielle</span>
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold mb-3 text-neon-pink">Instantané</h3>
              <p className="text-text-gray text-sm">
                Résultats en <span className="text-neon-cyan">quelques secondes</span>
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold mb-3 text-neon-cyan">Précis</h3>
              <p className="text-text-gray text-sm">
                Analyse <span className="text-neon-pink">professionnelle</span> détaillée
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}