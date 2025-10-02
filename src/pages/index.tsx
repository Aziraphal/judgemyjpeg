import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'
import LocalizedHero from '@/components/LocalizedHero'
// import TestimonialsSection from '@/components/TestimonialsSection' // DÉSACTIVÉ - faux témoignages
import OnboardingTutorial from '@/components/OnboardingTutorial'
import LanguageDebugger from '@/components/LanguageDebugger'
import SEOHead from '@/components/SEOHead'
import { usePreloadRoutes, CRITICAL_ROUTES } from '@/components/PreloadLink'

export default function Home() {
  const { data: session, status } = useSession()
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [topPhotos, setTopPhotos] = useState<any[]>([])
  const [loadingTopPhotos, setLoadingTopPhotos] = useState(false)

  // 🚀 Preload critical routes for better performance
  usePreloadRoutes(CRITICAL_ROUTES)

  useEffect(() => {
    if (session?.user?.id) {
      // Récupérer le statut subscription
      fetch('/api/subscription/status')
        .then(res => res.json())
        .then(data => {
          logger.debug('Données subscription récupérées:', data)
          setUserSubscription(data.subscription)
        })
        .catch(err => logger.error('Error fetching subscription:', err))
      
      // Récupérer le Top 3 des photos de l'utilisateur
      setLoadingTopPhotos(true)
      fetch('/api/photos/top?limit=3')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.photos) {
            setTopPhotos(data.photos)
          }
        })
        .catch(err => logger.error('Error fetching top photos:', err))
        .finally(() => setLoadingTopPhotos(false))
    }
    
    // Charger les préférences locales
    if (session?.user?.email) {
      const savedPrefs = localStorage.getItem(`userPrefs_${session.user.email}`)
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs))
        } catch (error) {
          logger.error('Erreur lecture préférences:', error)
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

  const faqSchema = [
    {
      "@type": "Question",
      "name": "Comment analyser une photo avec une IA ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Uploadez votre photo sur JudgeMyJPEG, notre intelligence artificielle l'analyse en quelques secondes et vous donne une critique détaillée avec note sur 100 et conseils personnalisés. Choisissez entre 3 modes : Roast (critique créative), Professional (conseils techniques), ou Learning (analyse pédagogique)."
      }
    },
    {
      "@type": "Question",
      "name": "Est-ce que l'analyse photo IA est gratuite ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, JudgeMyJPEG propose 3 analyses photo IA gratuites par mois. Aucune carte de crédit requise. Vous obtenez une critique professionnelle avec notation détaillée, analyse de composition, exposition, lumière et créativité."
      }
    },
    {
      "@type": "Question",
      "name": "Quels types de photos peut-on analyser ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Notre IA analyse tous types de photos : Portrait, Paysage, Street Photography, Macro, Architecture, et photographie générale. Formats supportés : JPG, PNG, WebP. L'analyse s'adapte au type de photo pour des conseils personnalisés."
      }
    },
    {
      "@type": "Question",
      "name": "Quels sont les 3 modes d'analyse IA disponibles ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JudgeMyJPEG propose 3 personnalités IA uniques : 1) Roast Mode - critiques créatives et humoristiques, 2) Professional Mode - conseils techniques experts avec recommandations Lightroom/Photoshop, 3) Learning Mode - analyse pédagogique pour améliorer vos compétences photographiques progressivement."
      }
    }
  ]

  return (
    <>
      <SEOHead
        title="Analyser Photo IA Gratuit | Critique Photo Intelligence Artificielle - JudgeMyJPEG"
        description="Analysez vos photos gratuitement avec une IA experte ! 3 modes d'analyse (Roast/Professional/Learning), notation détaillée sur 100, conseils techniques personnalisés. Analyse photo instantanée en ligne avec intelligence artificielle spécialisée en photographie."
        keywords="analyser photo IA, critique photo intelligence artificielle, analyse photo gratuit, améliorer photo IA, conseil photo automatique, note photo IA, composition photo IA, exposition photo analyse, AI photo critique, photography feedback AI"
        canonicalUrl="https://www.judgemyjpeg.fr"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqSchema
          }
        ]}
      />
      
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
                      logger.debug('NUCLEAR LOGOUT - Server-side cookie destruction')
                      
                      // Appeler l'endpoint de déconnexion forcée côté serveur
                      const response = await fetch('/api/auth/force-logout', { method: 'POST' })
                      const result = await response.json()
                      logger.debug('Force logout result:', result)
                      
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
                      logger.error('Nuclear logout failed:', error)
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

          {/* Hero Section - Localized for new users */}
          {!session ? (
            <LocalizedHero />
          ) : (
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  JudgeMyJPEG
                </span>
              </h1>
              <p className="text-xl text-text-gray mb-8 max-w-2xl mx-auto">
                <span className="text-neon-cyan">Analysez vos photos</span> avec une <span className="text-neon-pink">intelligence artificielle experte</span>
              </p>
              
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
            </div>
          )}

          {/* Top 3 Photos Section - Only for logged in users */}
          {session && topPhotos.length > 0 && (
            <div className="max-w-4xl mx-auto mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3 text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  🏆 Vos Meilleures Photos
                </h2>
                <p className="text-text-gray">
                  Vos 3 photos les mieux notées par l'IA
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {topPhotos.map((photo, index) => (
                  <div key={photo.id} className="glass-card p-4 group hover:scale-105 transition-transform duration-300">
                    <div className="relative mb-4">
                      {/* Badge de position */}
                      <div className="absolute -top-2 -left-2 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                          'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Image */}
                      <div className="aspect-square bg-cosmic-glass rounded-lg overflow-hidden border border-cosmic-glassborder">
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${
                        photo.score >= 90 ? 'text-green-400' :
                        photo.score >= 80 ? 'text-yellow-400' :
                        photo.score >= 70 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {Math.round(photo.score)}/100
                      </div>
                      <div className="text-xs text-text-gray">
                        {new Date(photo.createdAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Call to action */}
              <div className="text-center mt-6">
                <button 
                  onClick={() => window.location.href = '/gallery'}
                  className="btn-neon-secondary text-sm px-6 py-2"
                >
                  🏆 Voir toutes vos photos
                </button>
              </div>
            </div>
          )}

          {/* Message d'encouragement si pas encore de photos */}
          {session && topPhotos.length === 0 && !loadingTopPhotos && (
            <div className="max-w-2xl mx-auto mb-16 text-center">
              <div className="glass-card p-8">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-bold mb-3 text-neon-cyan">
                  Commencez votre collection
                </h3>
                <p className="text-text-gray mb-6">
                  Analysez vos premières photos pour créer votre galerie personnelle !
                </p>
                <button 
                  onClick={() => window.location.href = '/analyze'}
                  className="btn-neon-pink px-6 py-3"
                >
                  📸 Analyser ma première photo
                </button>
              </div>
            </div>
          )}

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

          {/* Testimonials Section - DÉSACTIVÉ (faux témoignages) */}
          {/* !session && (
            <div className="mt-20">
              <TestimonialsSection />
            </div>
          ) */}

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

      {/* Onboarding Tutorial - Only for first-time visitors */}
      {!session && <OnboardingTutorial />}

      {/* Composant de debug localisation (dev only) */}
      {process.env.NODE_ENV === 'development' && <LanguageDebugger />}
    </>
  )
}