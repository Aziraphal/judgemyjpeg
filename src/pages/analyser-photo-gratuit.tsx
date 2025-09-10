import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Footer from '@/components/Footer'

export default function AnalyserPhotoGratuit() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Analyser Photo Gratuit en Ligne | IA Analyse Image Intelligence Artificielle</title>
        <meta name="description" content="Analysez vos photos gratuitement avec notre IA ! Analyse photo en ligne instantanée, conseils experts, note sur 100. Intelligence artificielle spécialisée photo." />
        <meta name="keywords" content="analyser photo gratuit, analyse photo en ligne, IA analyse image, intelligence artificielle photo, analyser image gratuit, améliorer photo conseil" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/analyser-photo-gratuit" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Analyser Photo Gratuit | IA Intelligence Artificielle" />
        <meta property="og:description" content="Analysez gratuitement vos photos avec notre IA experte ! Analyse instantanée et conseils personnalisés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr/analyser-photo-gratuit" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Analyser Photo Gratuit",
            "description": "Service gratuit d'analyse photo par intelligence artificielle",
            "url": "https://www.judgemyjpeg.fr/analyser-photo-gratuit",
            "inLanguage": "fr-FR",
            "isPartOf": {
              "@type": "WebSite",
              "name": "JudgeMyJPEG",
              "url": "https://www.judgemyjpeg.fr"
            },
            "mainEntity": {
              "@type": "Service",
              "name": "Analyse Photo Gratuite",
              "description": "Analyse photo gratuite par intelligence artificielle",
              "provider": {
                "@type": "Organization",
                "name": "JudgeMyJPEG",
                "url": "https://www.judgemyjpeg.fr"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "description": "Analyse photo gratuite par IA",
                "availability": "https://schema.org/InStock"
              }
            }
          })}
        </script>
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Analyser Photo Gratuit
              </span>
            </h1>
            <p className="text-xl text-text-gray mb-8 max-w-3xl mx-auto">
              <span className="text-neon-cyan">Analysez vos photos gratuitement</span> avec notre 
              <span className="text-neon-pink"> intelligence artificielle experte</span>
            </p>
            
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-green-300 font-semibold">
                ✨ 100% GRATUIT • Aucune inscription requise pour l'essai
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/analyze" className="btn-neon-pink text-lg px-8 py-3 text-center">
                📸 Analyser ma photo
              </Link>
              {!session && (
                <Link href="/auth/signup" className="btn-neon-secondary text-lg px-8 py-3 text-center">
                  Créer un compte gratuit
                </Link>
              )}
            </div>
          </div>

          {/* Why Analyze Photos */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Pourquoi <span className="text-neon-cyan">analyser ses photos</span> ?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-text-gray">
                <div>
                  <h3 className="text-xl font-semibold text-neon-pink mb-4">📸 Améliorez vos compétences</h3>
                  <p className="mb-4">
                    <strong className="text-white">Analyser vos photos</strong> vous aide à comprendre 
                    ce qui fonctionne et ce qui peut être amélioré. Notre IA identifie les points 
                    techniques et artistiques de chaque image.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>• Composition et règle des tiers</li>
                    <li>• Exposition et éclairage</li>
                    <li>• Netteté et mise au point</li>
                    <li>• Harmonie des couleurs</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-neon-cyan mb-4">🎯 Conseils personnalisés</h3>
                  <p className="mb-4">
                    Notre <strong className="text-white">intelligence artificielle photo</strong> 
                    analyse chaque image individuellement et fournit des conseils spécifiques 
                    adaptés à votre style et niveau.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>• Note détaillée sur 100 points</li>
                    <li>• Analyse technique approfondie</li>
                    <li>• Suggestions d'amélioration</li>
                    <li>• Conseils artistiques experts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Free Analysis Features */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Que comprend l'<span className="text-neon-pink">analyse photo gratuite</span> ?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-6">
                <div className="text-4xl mb-4 text-center">🔍</div>
                <h3 className="text-xl font-bold text-neon-cyan mb-4 text-center">Analyse Technique</h3>
                <ul className="text-text-gray text-sm space-y-2">
                  <li>✓ Exposition et contraste</li>
                  <li>✓ Netteté et mise au point</li>
                  <li>✓ Balance des couleurs</li>
                  <li>✓ Composition générale</li>
                </ul>
              </div>
              
              <div className="glass-card p-6">
                <div className="text-4xl mb-4 text-center">🎨</div>
                <h3 className="text-xl font-bold text-neon-pink mb-4 text-center">Critique Artistique</h3>
                <ul className="text-text-gray text-sm space-y-2">
                  <li>✓ Impact visuel</li>
                  <li>✓ Créativité</li>
                  <li>✓ Émotion transmise</li>
                  <li>✓ Originalité</li>
                </ul>
              </div>
              
              <div className="glass-card p-6">
                <div className="text-4xl mb-4 text-center">💡</div>
                <h3 className="text-xl font-bold text-neon-cyan mb-4 text-center">Conseils d'Amélioration</h3>
                <ul className="text-text-gray text-sm space-y-2">
                  <li>✓ Points forts identifiés</li>
                  <li>✓ Axes d'amélioration</li>
                  <li>✓ Suggestions techniques</li>
                  <li>✓ Conseils créatifs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to analyze */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Comment <span className="text-neon-cyan">analyser une photo</span> avec notre IA ?
              </h2>
              
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="bg-neon-pink/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Sélectionnez</h4>
                  <p className="text-text-gray text-sm">Choisissez votre photo à analyser</p>
                </div>
                
                <div>
                  <div className="bg-neon-cyan/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Uploadez</h4>
                  <p className="text-text-gray text-sm">Téléchargez votre image (JPG/PNG)</p>
                </div>
                
                <div>
                  <div className="bg-neon-pink/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Analysez</h4>
                  <p className="text-text-gray text-sm">L'IA analyse votre photo</p>
                </div>
                
                <div>
                  <div className="bg-neon-cyan/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">4️⃣</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Recevez</h4>
                  <p className="text-text-gray text-sm">Obtenez vos résultats détaillés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Types of Photos */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Quels types de photos peut-on <span className="text-neon-pink">analyser</span> ?
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: "📸", title: "Portraits" },
                { emoji: "🌅", title: "Paysages" },
                { emoji: "🏠", title: "Architecture" },
                { emoji: "🍽️", title: "Culinaire" },
                { emoji: "🌸", title: "Macro" },
                { emoji: "🐾", title: "Animalier" },
                { emoji: "🎨", title: "Artistique" },
                { emoji: "📱", title: "Street Photo" }
              ].map((type, index) => (
                <div key={index} className="glass-card p-4 text-center">
                  <div className="text-3xl mb-2">{type.emoji}</div>
                  <p className="text-white font-semibold text-sm">{type.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Prêt à <span className="text-neon-cyan">analyser vos photos</span> ?
              </h3>
              <p className="text-text-gray mb-6">
                Découvrez le potentiel de vos photos avec notre analyse IA gratuite
              </p>
              
              <Link href="/analyze" className="btn-neon-pink text-xl px-12 py-4 mb-4 block">
                🚀 Commencer l'analyse gratuite
              </Link>
              
              <p className="text-xs text-text-muted">
                Aucune inscription requise pour l'essai • Résultats instantanés
              </p>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  )
}