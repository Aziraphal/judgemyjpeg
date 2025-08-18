import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function TarifsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection SEO-friendly vers /pricing
    router.replace('/pricing')
  }, [router])

  return (
    <>
      <Head>
        <title>Tarifs JudgeMyJPEG - Plans Premium pour Analyse Photo IA</title>
        <meta name="description" content="Découvrez nos tarifs pour l'analyse photo par IA. Plan gratuit et premium avec analyse en lot, rapports détaillés et fonctionnalités avancées." />
        <meta name="keywords" content="tarifs analyse photo, prix critique photo IA, abonnement photo, plan premium photographie" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/pricing" />
        
        {/* Redirection meta refresh en fallback */}
        <meta httpEquiv="refresh" content="0; url=/pricing" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-white">Redirection vers les tarifs...</p>
        </div>
      </main>
    </>
  )
}