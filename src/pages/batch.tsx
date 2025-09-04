import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function BatchAnalysis() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Feature temporairement désactivée
  const [isMaintenanceMode] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
  }, [status, router])

  // Affichage mode maintenance
  if (isMaintenanceMode) {
    return (
      <>
        <Head>
          <title>Analyse en lot - Maintenance | JudgeMyJPEG</title>
          <meta name="description" content="Analyse en lot temporairement indisponible pour maintenance." />
        </Head>

        <main className="min-h-screen bg-cosmic-overlay particles-container relative">
          <div className="container mx-auto px-4 py-12 relative z-10">
            
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  🔧 Analyse en Lot
                </span>
              </h1>
              <p className="text-text-gray max-w-2xl mx-auto">
                Fonctionnalité temporairement indisponible pour améliorations
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => router.push('/')}
                className="btn-neon-secondary"
              >
                ← Retour à l'analyse simple
              </button>
            </div>

            {/* Message de maintenance */}
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-6">🚧</div>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">En cours d'amélioration</h2>
                <p className="text-text-gray mb-6 leading-relaxed">
                  L'analyse en lot est temporairement indisponible pendant que nous améliorons 
                  les performances et la stabilité de cette fonctionnalité.
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                  <h3 className="text-blue-300 font-semibold mb-3">💡 En attendant</h3>
                  <ul className="text-left text-text-gray space-y-2">
                    <li>• Utilisez l'<strong className="text-neon-cyan">analyse simple</strong> pour chaque photo</li>
                    <li>• Explorez l'<strong className="text-neon-pink">analyse de retouche approfondie</strong></li>
                    <li>• Consultez vos <strong className="text-yellow-400">photos favorites</strong> et collections</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/')}
                    className="btn-neon-pink"
                  >
                    📸 Analyser une photo
                  </button>
                  <button
                    onClick={() => router.push('/gallery')}
                    className="btn-neon-cyan"
                  >
                    🖼️ Voir mes photos
                  </button>
                </div>
                
                <p className="text-text-muted text-sm mt-6">
                  Cette fonctionnalité sera bientôt de retour avec des améliorations majeures !
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return null // Ne devrait jamais arriver avec isMaintenanceMode = true
}