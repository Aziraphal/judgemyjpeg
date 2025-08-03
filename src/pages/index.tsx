import Head from 'next/head'
import { useSession, signIn, signOut } from 'next-auth/react'
import Footer from '@/components/Footer'

export default function Home() {
  const { data: session, status } = useSession()

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
                Bonjour, <span className="text-neon-cyan font-semibold">{session.user?.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-neon-secondary text-sm"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => signOut()}
                  className="btn-neon-secondary text-sm"
                >
                  Déconnexion
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