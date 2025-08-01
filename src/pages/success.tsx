import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SuccessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    // Countdown vers le dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, router])

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
        <title>Paiement réussi - JudgeMyJPEG</title>
        <meta name="description" content="Votre abonnement a été activé avec succès !" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            
            {/* Animation de succès */}
            <div className="glass-card p-12 hover-glow">
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-glow mb-6">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  Félicitations !
                </span>
              </h1>

              <p className="text-xl text-text-gray mb-8">
                Votre abonnement{' '}
                <span className="text-neon-cyan font-semibold">Premium</span>{' '}
                a été activé avec succès !
              </p>

              {/* Bénéfices débloques */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-6">
                  <div className="text-3xl mb-3">🔓</div>
                  <h3 className="text-lg font-semibold text-neon-pink mb-2">
                    Analyses illimitées
                  </h3>
                  <p className="text-text-muted text-sm">
                    Jugez autant de photos que vous voulez !
                  </p>
                </div>

                <div className="glass-card p-6">
                  <div className="text-3xl mb-3">🎨</div>
                  <h3 className="text-lg font-semibold text-neon-cyan mb-2">
                    Images partageables
                  </h3>
                  <p className="text-text-muted text-sm">
                    Créez des Stories Instagram avec vos analyses
                  </p>
                </div>

                <div className="glass-card p-6">
                  <div className="text-3xl mb-3">🧠</div>
                  <h3 className="text-lg font-semibold text-neon-pink mb-2">
                    Insights IA avancés
                  </h3>
                  <p className="text-text-muted text-sm">
                    Analyses de patterns et recommandations
                  </p>
                </div>

                <div className="glass-card p-6">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-neon-cyan mb-2">
                    Export de données
                  </h3>
                  <p className="text-text-muted text-sm">
                    Téléchargez vos stats en JSON ou CSV
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/analyze')}
                  className="btn-neon-pink text-lg px-8 py-3 mx-2"
                >
                  🚀 Analyser une photo maintenant
                </button>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-neon-secondary text-lg px-8 py-3 mx-2"
                >
                  📊 Voir mon dashboard
                </button>
              </div>

              {/* Countdown */}
              <div className="mt-8 text-sm text-text-muted">
                Redirection automatique vers le dashboard dans{' '}
                <span className="text-neon-cyan font-semibold">{countdown}</span> secondes...
              </div>
            </div>

            {/* Message de bienvenue personnalisé */}
            <div className="mt-8 glass-card p-6">
              <h3 className="text-lg font-semibold text-text-white mb-3">
                🎯 Conseils pour commencer
              </h3>
              <div className="text-left space-y-2 text-sm text-text-gray">
                <p>• Testez le <strong className="text-neon-pink">mode cassant</strong> pour des analyses fun à partager</p>
                <p>• Créez des <strong className="text-neon-cyan">collections</strong> pour organiser vos photos</p>
                <p>• Générez vos <strong className="text-neon-pink">insights IA</strong> après quelques analyses</p>
                <p>• Partagez vos analyses sur les réseaux sociaux pour faire découvrir JudgeMyJPEG !</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}