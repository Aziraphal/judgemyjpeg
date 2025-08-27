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
        <title>Analyser Photo IA Gratuit | Critique Photo Intelligence Artificielle - JudgeMyJPEG</title>
        <meta name="description" content="Analysez vos photos gratuitement avec une IA experte ! Critique photo professionnelle, note sur 100, conseils techniques. Analyse photo instantanée en ligne." />
        <meta name="keywords" content="analyser photo, analyse photo IA, critique photo, intelligence artificielle photo, analyser photo gratuit, critique photo IA, améliorer photo, analyse image IA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Analyser Photo IA Gratuit | Critique Photo Intelligence Artificielle" />
        <meta property="og:description" content="Analysez vos photos gratuitement avec une IA experte ! Critique photo professionnelle, note sur 100, conseils techniques instantanés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://judgemyjpeg.com" />
        <meta property="og:image" content="https://judgemyjpeg.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="JudgeMyJPEG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://judgemyjpeg.com" />
        <meta name="twitter:title" content="Analyser Photo IA Gratuit | JudgeMyJPEG" />
        <meta name="twitter:description" content="Analysez vos photos avec une IA experte ! Critique professionnelle, note sur 100, conseils personnalisés." />
        <meta name="twitter:image" content="https://judgemyjpeg.com/twitter-card.svg" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="600" />
        <meta name="twitter:creator" content="@judgemyjpeg" />
        <meta name="twitter:site" content="@judgemyjpeg" />
        
        {/* Schema.org JSON-LD - Enhanced for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebSite", "WebApplication"],
            "name": "JudgeMyJPEG - Analyser Photo IA",
            "alternateName": ["Critique Photo IA", "Analyse Photo Intelligence Artificielle"],
            "description": "Service gratuit d'analyse et critique photo par intelligence artificielle. Analysez vos photos avec une IA experte, obtenez une note sur 100 et des conseils personnalisés.",
            "url": "https://judgemyjpeg.com",
            "applicationCategory": "PhotographyApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "description": "Analyse photo gratuite par IA"
            },
            "potentialAction": [
              {
                "@type": "SearchAction",
                "target": "https://judgemyjpeg.com/analyze",
                "query-input": "required name=photo"
              },
              {
                "@type": "UseAction",
                "name": "Analyser Photo IA",
                "description": "Analysez gratuitement vos photos avec intelligence artificielle",
                "target": "https://judgemyjpeg.com/analyze"
              }
            ],
            "provider": {
              "@type": "Organization",
              "name": "JudgeMyJPEG",
              "url": "https://judgemyjpeg.com",
              "description": "Plateforme d'analyse photo par intelligence artificielle"
            },
            "keywords": "analyser photo, critique photo IA, intelligence artificielle photo, analyse photo gratuit, améliorer photo, conseils photo IA",
            "inLanguage": ["fr", "en", "es", "de", "it", "pt"],
            "isAccessibleForFree": true
          })}
        </script>
        
        {/* FAQ Schema for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Comment analyser une photo avec une IA ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Uploadez votre photo sur JudgeMyJPEG, notre intelligence artificielle l'analyse en quelques secondes et vous donne une critique détaillée avec note sur 100 et conseils personnalisés."
                }
              },
              {
                "@type": "Question", 
                "name": "Est-ce que l'analyse photo IA est gratuite ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui, JudgeMyJPEG propose des analyses photo IA gratuites. Vous pouvez tester notre service sans inscription et obtenir une critique professionnelle de vos photos."
                }
              },
              {
                "@type": "Question",
                "name": "Quels types de photos peut-on analyser ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Notre IA analyse tous types de photos : portraits, paysages, architecture, culinaire, macro, animalier, street photography. Formats supportés : JPG, PNG, WebP."
                }
              }
            ]
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
              <span className="text-neon-cyan">Analysez vos photos</span> avec une <span className="text-neon-pink">intelligence artificielle experte</span>
            </p>
            <div className="text-base text-text-muted mb-6 max-w-3xl mx-auto">
              <p>✨ <strong className="text-white">Critique photo IA instantanée</strong> • Note sur 100 • Conseils techniques personnalisés</p>
            </div>
            
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
          {/* Features Grid - SEO optimized */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-lg font-bold mb-3 text-neon-cyan">Analyse Photo IA</h3>
              <p className="text-text-gray text-sm">
                <strong className="text-white">Analysez vos photos</strong> avec une <span className="text-neon-pink">intelligence artificielle spécialisée</span>
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold mb-3 text-neon-pink">Critique Instantanée</h3>
              <p className="text-text-gray text-sm">
                <strong className="text-white">Critique photo IA</strong> en <span className="text-neon-cyan">quelques secondes</span>
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold mb-3 text-neon-cyan">Analyse Précise</h3>
              <p className="text-text-gray text-sm">
                <strong className="text-white">Analyse technique</strong> et <span className="text-neon-pink">conseils personnalisés</span>
              </p>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="max-w-4xl mx-auto mt-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
              Pourquoi analyser ses photos avec une IA ?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-text-gray">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🎨 Critique photo experte</h3>
                <p className="text-sm">
                  Notre <strong className="text-neon-cyan">intelligence artificielle</strong> analyse la composition, 
                  l'exposition, les couleurs et la netteté de vos photos pour vous donner une 
                  <strong className="text-white"> critique photo IA</strong> détaillée.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📈 Améliorez vos photos</h3>
                <p className="text-sm">
                  Recevez des <strong className="text-neon-pink">conseils personnalisés</strong> pour 
                  <strong className="text-white"> améliorer vos photos</strong> et développer vos 
                  compétences en photographie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}