import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function CollectionsPhotosPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection SEO-friendly vers /collections
    router.replace('/collections')
  }, [router])

  return (
    <>
      <Head>
        <title>Collections Photos - Organisez vos Photos Analysées | JudgeMyJPEG</title>
        <meta name="description" content="Organisez vos photos analysées en collections personnalisées. Créez des albums thématiques et retrouvez facilement vos meilleures photos." />
        <meta name="keywords" content="collections photos, albums photos, organiser photos, portfolio photographique, galerie photos" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/collections" />
        
        {/* Redirection meta refresh en fallback */}
        <meta httpEquiv="refresh" content="0; url=/collections" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner-neon w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-white">Redirection vers les collections...</p>
        </div>
      </main>
    </>
  )
}