import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function TableauBordPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection SEO-friendly vers /dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <>
      <Head>
        <title>Tableau de Bord Photo - Statistiques et Analyses | JudgeMyJPEG</title>
        <meta name="description" content="Consultez vos statistiques photographiques, évolution de vos scores et analytics détaillés de vos analyses photo IA." />
        <meta name="keywords" content="tableau bord photo, statistiques photo, analytics photographique, progression photo, dashboard" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/dashboard" />
        
        {/* Redirection meta refresh en fallback */}
        <meta httpEquiv="refresh" content="0; url=/dashboard" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-white">Redirection vers le tableau de bord...</p>
        </div>
      </main>
    </>
  )
}