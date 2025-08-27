import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { logger } from '@/lib/logger'

export default function Custom500() {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    try {
      // Test de connectivité
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache' 
      })
      
      if (response.ok) {
        // Serveur OK, recharger la page
        window.location.reload()
      } else {
        throw new Error('Server still unavailable')
      }
    } catch (error) {
      logger.error('Retry failed:', error)
      setTimeout(() => setIsRetrying(false), 2000)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <>
      <Head>
        <title>Erreur Serveur - JudgeMyJPEG</title>
        <meta name="description" content="Erreur temporaire du serveur. Réessayez dans quelques instants." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        {/* Background particles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-glow-pink rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-glow-cyan rounded-full blur-3xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="glass-card p-8 max-w-lg mx-4 text-center relative z-10">
          {/* Icon animé */}
          <div className="text-8xl mb-6 animate-bounce">
            🔧
          </div>
          
          <h1 className="text-3xl font-bold text-neon-pink mb-4">
            Oups ! Problème serveur
          </h1>
          
          <p className="text-text-gray mb-6 leading-relaxed">
            Nos serveurs rencontrent temporairement des difficultés. 
            Cela peut arriver lors de pics d'utilisation ou de maintenances.
          </p>

          {/* Status */}
          <div className="bg-cosmic-glass border border-cosmic-glassborder rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-300 font-medium">Service Interrompu</span>
            </div>
            <p className="text-text-muted text-sm">
              Temps de rétablissement estimé : &lt; 5 minutes
            </p>
            {retryCount > 0 && (
              <p className="text-text-muted text-xs mt-2">
                Tentatives : {retryCount}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 btn-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <>
                  <div className="spinner-neon w-4 h-4 mr-2"></div>
                  Vérification...
                </>
              ) : (
                <>
                  🔄 Réessayer
                </>
              )}
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 btn-neon-secondary"
            >
              🏠 Accueil
            </button>
          </div>

          {/* Conseils */}
          <div className="mt-8 text-left">
            <h3 className="text-neon-cyan font-semibold mb-3">💡 En attendant :</h3>
            <ul className="text-text-gray text-sm space-y-2">
              <li>• Vérifiez votre connexion Internet</li>
              <li>• Videz le cache de votre navigateur</li>
              <li>• Réessayez dans quelques minutes</li>
              <li>• Contactez-nous si le problème persiste</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="mt-6 pt-6 border-t border-cosmic-glassborder">
            <p className="text-text-muted text-sm">
              Problème persistant ? 
              <Link href="/contact" className="text-neon-cyan hover:underline ml-1">
                Contactez le support
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}