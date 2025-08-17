import Head from 'next/head'
import { useRouter } from 'next/router'

export default function SuccessSimplePage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Paiement réussi - JudgeMyJPEG</title>
        <meta name="description" content="Votre paiement a été traité avec succès !" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="text-6xl mb-6">✅</div>
          
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text mb-4">
            Paiement réussi !
          </h1>

          <p className="text-text-gray mb-6">
            Merci pour votre achat ! Votre compte Premium sera activé sous peu.
            Vous recevrez un email de confirmation.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-neon-pink w-full"
            >
              📊 Aller au Dashboard
            </button>
            
            <button
              onClick={() => router.push('/analyze')}
              className="btn-neon-secondary w-full"
            >
              🚀 Analyser une photo
            </button>
          </div>

          <div className="mt-6 text-sm text-text-muted">
            <p>Si votre statut Premium n'apparaît pas immédiatement,</p>
            <p>rafraîchissez la page dans quelques minutes.</p>
          </div>
        </div>
      </main>
    </>
  )
}