import Head from 'next/head'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'

export default function Home() {
  const { data: session, status } = useSession()
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/subscription/status')
        .then(res => res.json())
        .then(data => {
          console.log('Données subscription récupérées:', data)
          setUserSubscription(data.subscription)
        })
        .catch(err => console.error('Error fetching subscription:', err))
    }
    
    // Charger les préférences locales
    if (session?.user?.email) {
      const savedPrefs = localStorage.getItem(`userPrefs_${session.user.email}`)
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs))
        } catch (error) {
          console.error('Erreur lecture préférences:', error)
        }
      }
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
        <title>JudgeMyJPEG | Analyse photo IA - Note tes photos sur 100</title>
        <meta name="description" content="Fais analyser tes photos par une IA spécialisée ! Note sur 100, conseils techniques personnalisés. Mode pro ou humoristique. Essai gratuit disponible." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:title" content="JudgeMyJPEG | Analyse photo IA - Note tes photos sur 100" />
        <meta property="og:description" content="Fais analyser tes photos par une IA spécialisée ! Note sur 100, conseils techniques personnalisés. Mode pro ou humoristique." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr" />
        <meta property="og:image" content="https://www.judgemyjpeg.fr/favicon.ico" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="JudgeMyJPEG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JudgeMyJPEG | Analyse photo IA" />
        <meta name="twitter:description" content="Fais analyser tes photos par une IA spécialisée ! Note sur 100 + conseils techniques." />
        <meta name="twitter:image" content="https://www.judgemyjpeg.fr/favicon.ico" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "JudgeMyJPEG",
            "description": "Service d'analyse de photos par intelligence artificielle",
            "url": "https://www.judgemyjpeg.fr",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.judgemyjpeg.fr/analyze",
              "query-input": "required name=search_term_string"
            },
            "provider": {
              "@type": "Organization",
              "name": "CodeCraft Plus",
              "url": "https://www.judgemyjpeg.fr"
            }
          })}
        </script>
      </Head>
      
      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating orbs */}
        <div className="absolute top-20 left-4 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-glow-pink rounded-full blur-xl float opacity-30"></div>
        <div className="absolute bottom-32 right-8 sm:right-16 w-24 sm:w-48 h-24 sm:h-48 bg-glow-cyan rounded-full blur-xl float opacity-20" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-12 sm:w-24 h-12 sm:h-24 bg-glow-pink rounded-full blur-lg float opacity-25" style={{animationDelay: '0.5s'}}></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header avec navigation utilisateur */}
          {session && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-3 sm:space-y-0">
              <div className="text-sm text-text-gray">
                Bonjour, <span className="font-semibold text-neon-cyan">
                  {session.user?.nickname || userPreferences?.nickname || userPreferences?.displayName || session.user?.name}
                  {(userSubscription?.subscriptionStatus === 'lifetime') && ' ✨'}
                  {(userSubscription?.subscriptionStatus === 'premium') && ' 💎'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-neon-secondary text-sm px-3 py-2 flex items-center justify-center"
                >
                  📊 <span className="ml-1">Dashboard</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/settings'}
                  className="btn-neon-secondary text-sm px-3 py-2 flex items-center justify-center"
                >
                  ⚙️ <span className="ml-1 hidden sm:inline">Paramètres</span><span className="ml-1 sm:hidden">Réglages</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      console.log('NUCLEAR LOGOUT - Server-side cookie destruction')
                      
                      // Appeler l'endpoint de déconnexion forcée côté serveur
                      const response = await fetch('/api/auth/force-logout', { method: 'POST' })
                      const result = await response.json()
                      console.log('Force logout result:', result)
                      
                      // Vider TOUT côté client aussi
                      document.cookie.split(";").forEach(c => {
                        const eqPos = c.indexOf("=")
                        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.judgemyjpeg.fr`
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                      })
                      
                      localStorage.clear()
                      sessionStorage.clear()
                      
                      // Attendre un peu puis redirection BRUTALE
                      setTimeout(() => {
                        window.location.replace('/?logout_success=' + Date.now())
                      }, 500)
                      
                    } catch (error) {
                      console.error('Nuclear logout failed:', error)
                      // Plan B : redirection brutale
                      window.location.replace('/?fallback_logout=' + Date.now())
                    }
                  }}
                  className="btn-neon-secondary text-sm px-3 py-2 flex items-center justify-center"
                >
                  🚪 <span className="ml-1 hidden sm:inline">Déconnexion</span><span className="ml-1 sm:hidden">Sortie</span>
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
                    Créer un compte
                  </button>
                  <button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="btn-neon-secondary text-lg px-8 py-3"
                  >
                    Se connecter
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
                    onClick={() => window.location.href = '/batch'}
                    className="btn-neon-secondary text-sm px-4 py-2"
                  >
                    📊 Analyse en lot
                  </button>
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
                    onClick={() => window.location.href = '/blog'}
                    className="btn-neon-secondary text-sm px-4 py-2"
                  >
                    📚 Guides Photo
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