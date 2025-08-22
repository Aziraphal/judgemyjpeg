import { useState } from 'react'
import Head from 'next/head'

export default function SentryExamplePage() {
  const [isError, setIsError] = useState(false)

  const triggerError = () => {
    // Test function pour déclencher erreur Sentry
    setIsError(true)
    // @ts-ignore - Fonction volontairement inexistante
    myUndefinedFunction()
  }

  const triggerAsyncError = async () => {
    // Test erreur async
    try {
      await fetch('/api/nonexistent-endpoint')
    } catch (error) {
      throw new Error('Test async error for Sentry')
    }
  }

  return (
    <>
      <Head>
        <title>Test Sentry - JudgeMyJPEG</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-white mb-4">
              🧪 Test Sentry
            </h1>
            <p className="text-text-gray">
              Page de test pour vérifier que Sentry capture bien les erreurs
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={triggerError}
              className="w-full btn-neon-pink"
            >
              🔥 Déclencher erreur JavaScript
            </button>

            <button
              onClick={triggerAsyncError}
              className="w-full btn-neon-secondary"
            >
              ⚡ Déclencher erreur async
            </button>

            <div className="text-center pt-4">
              <a
                href="/"
                className="text-neon-cyan hover:text-neon-pink transition-colors"
              >
                ← Retour à l'accueil
              </a>
            </div>
          </div>

          {isError && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">
                Si Sentry est configuré, cette erreur devrait apparaître dans votre dashboard.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}