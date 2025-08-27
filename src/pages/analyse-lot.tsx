import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AnalyseLotPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection SEO-friendly vers /batch
    router.replace('/batch')
  }, [router])

  return (
    <>
      <Head>
        <title>Analyse en Lot Photos IA - JudgeMyJPEG</title>
        <meta name="description" content="Analysez plusieurs photos simultanément avec l'IA. Rapport comparatif intelligent pour améliorer votre portfolio photographique." />
        <meta name="keywords" content="analyse lot photos, batch photo IA, comparaison photos, rapport photographique, analyse multiple" />
        <link rel="canonical" href="https://judgemyjpeg.com/batch" />
        
        {/* Redirection meta refresh en fallback */}
        <meta httpEquiv="refresh" content="0; url=/batch" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-white">Redirection vers l'analyse en lot...</p>
        </div>
      </main>
    </>
  )
}