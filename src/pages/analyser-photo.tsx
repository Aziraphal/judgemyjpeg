import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AnalyserPhotoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection SEO-friendly vers /analyze
    router.replace('/analyze')
  }, [router])

  return (
    <>
      <Head>
        <title>Analyser Photo IA - JudgeMyJPEG</title>
        <meta name="description" content="Analysez vos photos avec l'intelligence artificielle. Obtenez une évaluation détaillée et des conseils d'amélioration pour vos photos." />
        <meta name="keywords" content="analyser photo, intelligence artificielle, critique photo, améliorer photo, analyse IA" />
        <link rel="canonical" href="https://judgemyjpeg.com/analyze" />
        
        {/* Redirection meta refresh en fallback */}
        <meta httpEquiv="refresh" content="0; url=/analyze" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-white">Redirection vers l'analyseur de photos...</p>
        </div>
      </main>
    </>
  )
}