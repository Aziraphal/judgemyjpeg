import Head from 'next/head'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>
  }

  return (
    <>
      <Head>
        <title>Photo Judge - Analyse IA de vos photos</title>
        <meta name="description" content="Obtenez une analyse professionnelle de vos photos grâce à l'IA Gemini" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Photo <span className="text-primary-600">Judge</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Obtenez une analyse professionnelle de vos photos grâce à l'intelligence artificielle Gemini
            </p>
            
            {!session ? (
              <div className="space-y-4">
                <button
                  onClick={() => signIn('google')}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Commencer avec Google
                </button>
                <p className="text-sm text-gray-500">
                  Connectez-vous pour analyser vos photos
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg">
                  Bienvenue, {session.user?.name || 'utilisateur'} !
                </p>
                <div className="space-x-4">
                  <button className="btn-primary">
                    Analyser une photo
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="btn-secondary"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-3xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Analyse IA</h3>
              <p className="text-gray-600">
                Analyse technique et artistique de vos photos par Gemini AI
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">Conseils Pro</h3>
              <p className="text-gray-600">
                Recommandations personnalisées pour améliorer vos photos
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Outils</h3>
              <p className="text-gray-600">
                Liens directs vers Lightroom, Photoshop et Snapseed
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}