import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function ToutesMesPhotosPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection SEO-friendly vers /all-photos
    router.replace('/all-photos')
  }, [router])

  return (
    <>
      <Head>
        <title>Toutes mes Photos Analysées - Historique Complet | JudgeMyJPEG</title>
        <meta name="description" content="Consultez l'historique complet de vos photos analysées. Filtrez par score, date et retrouvez facilement vos analyses précédentes." />
        <meta name="keywords" content="historique photos, toutes mes photos, analyses précédentes, galerie complète, mes analyses" />
        <link rel="canonical" href="https://judgemyjpeg.com/all-photos" />
        
        {/* Redirection meta refresh en fallback */}
        <meta httpEquiv="refresh" content="0; url=/all-photos" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-white">Redirection vers toutes vos photos...</p>
        </div>
      </main>
    </>
  )
}