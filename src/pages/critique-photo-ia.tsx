import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Footer from '@/components/Footer'

export default function CritiquePhotoIA() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Critique Photo IA Gratuite | Analyse Intelligence Artificielle Photo Expert</title>
        <meta name="description" content="Critique photo IA professionnelle gratuite ! Notre intelligence artificielle analyse vos photos et donne une critique experte avec conseils d'amélioration." />
        <meta name="keywords" content="critique photo IA, critique photo intelligence artificielle, analyse photo IA gratuit, critique photo expert, améliorer photo IA, conseil photo IA" />
        <link rel="canonical" href="https://judgemyjpeg.com/critique-photo-ia" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Critique Photo IA Gratuite | Intelligence Artificielle Expert" />
        <meta property="og:description" content="Critique photo IA professionnelle gratuite ! Analyse experte par intelligence artificielle avec conseils personnalisés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://judgemyjpeg.com/critique-photo-ia" />
        
        {/* Schema.org pour SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Critique Photo IA",
            "description": "Service de critique photo par intelligence artificielle",
            "url": "https://judgemyjpeg.com/critique-photo-ia",
            "mainEntity": {
              "@type": "Service",
              "name": "Critique Photo IA",
              "description": "Analyse et critique de photos par intelligence artificielle",
              "provider": {
                "@type": "Organization",
                "name": "JudgeMyJPEG",
                "url": "https://judgemyjpeg.com"
              }
            }
          })}
        </script>
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Critique Photo IA
              </span>
            </h1>
            <p className="text-xl text-text-gray mb-8 max-w-3xl mx-auto">
              Obtenez une <span className="text-neon-cyan">critique photo professionnelle</span> par 
              <span className="text-neon-pink"> intelligence artificielle</span> en quelques secondes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8">
              {session ? (
                <Link href="/analyze" className="btn-neon-pink text-lg px-8 py-3 text-center">
                  📸 Analyser ma photo
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="btn-neon-pink text-lg px-8 py-3 text-center">
                    Commencer gratuitement
                  </Link>
                  <Link href="/analyze" className="btn-neon-secondary text-lg px-8 py-3 text-center">
                    Voir la démo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* SEO Content - What is Critique Photo IA */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Qu'est-ce que la Critique Photo IA ?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-text-gray">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🤖 Intelligence Artificielle Experte</h3>
                  <p className="mb-4">
                    Notre <strong className="text-neon-cyan">critique photo IA</strong> utilise une 
                    intelligence artificielle entraînée sur des milliers de photos professionnelles. 
                    Elle analyse chaque aspect technique et artistique de vos images.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>✅ Analyse de la composition</li>
                    <li>✅ Évaluation de l'exposition</li>
                    <li>✅ Critique des couleurs</li>
                    <li>✅ Netteté et mise au point</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">💡 Conseils Personnalisés</h3>
                  <p className="mb-4">
                    Recevez des <strong className="text-neon-pink">conseils d'amélioration personnalisés</strong> 
                    pour chaque photo. Notre IA identifie les points forts et les axes d'amélioration 
                    de vos images.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>📈 Note détaillée sur 100</li>
                    <li>🎯 Points d'amélioration ciblés</li>
                    <li>🎨 Conseils artistiques</li>
                    <li>⚡ Résultats instantanés</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Comment fonctionne notre <span className="text-neon-cyan">Critique Photo IA</span> ?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-6 text-center">
                <div className="text-5xl mb-4">📤</div>
                <h3 className="text-xl font-bold text-neon-pink mb-4">1. Uploadez</h3>
                <p className="text-text-gray">
                  Téléchargez votre photo en quelques clics. 
                  Formats supportés : JPG, PNG, WebP
                </p>
              </div>
              
              <div className="glass-card p-6 text-center">
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-neon-cyan mb-4">2. Analyse IA</h3>
                <p className="text-text-gray">
                  Notre <strong className="text-white">intelligence artificielle</strong> analyse 
                  tous les aspects techniques et artistiques
                </p>
              </div>
              
              <div className="glass-card p-6 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-neon-pink mb-4">3. Critique Expert</h3>
                <p className="text-text-gray">
                  Recevez une <strong className="text-white">critique détaillée</strong> 
                  avec note et conseils personnalisés
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Pourquoi choisir notre <span className="text-neon-cyan">Critique Photo IA</span> ?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="text-lg font-semibold text-neon-pink mb-2">Instantané</h4>
                    <p className="text-text-gray text-sm">
                      Critique photo en moins de 10 secondes, disponible 24h/24
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="text-lg font-semibold text-neon-cyan mb-2">Précis</h4>
                    <p className="text-text-gray text-sm">
                      Analyse technique et artistique basée sur des standards professionnels
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="text-lg font-semibold text-neon-pink mb-2">Éducatif</h4>
                    <p className="text-text-gray text-sm">
                      Apprenez avec chaque critique et améliorez vos compétences photo
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🆓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-neon-cyan mb-2">Gratuit</h4>
                    <p className="text-text-gray text-sm">
                      Essai gratuit avec analyses illimitées pour les membres premium
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Prêt à recevoir votre <span className="text-neon-pink">critique photo IA</span> ?
              </h3>
              <p className="text-text-gray mb-6">
                Rejoignez des milliers de photographes qui améliorent leurs photos grâce à notre IA
              </p>
              
              {session ? (
                <Link href="/analyze" className="btn-neon-pink text-xl px-12 py-4">
                  📸 Analyser ma photo maintenant
                </Link>
              ) : (
                <div className="space-y-4">
                  <Link href="/auth/signup" className="btn-neon-pink text-xl px-12 py-4 block">
                    Commencer gratuitement
                  </Link>
                  <p className="text-xs text-text-muted">
                    Inscription gratuite • Aucune carte de crédit requise
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  )
}