import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function AnalyseImageGratuite() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Analyse Image Gratuite en Ligne | IA Analyse Photo Intelligence Artificielle</title>
        <meta name="description" content="Analyse d'image gratuite par intelligence artificielle. Analysez vos images instantanément : composition, technique, esthétique. Note détaillée et conseils experts." />
        <meta name="keywords" content="analyse image gratuite, analyse image en ligne, IA analyse image, intelligence artificielle image, analyser image gratuit, diagnostic image" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/analyse-image-gratuite" />

        {/* Open Graph */}
        <meta property="og:title" content="Analyse Image Gratuite | IA Intelligence Artificielle" />
        <meta property="og:description" content="Analysez gratuitement vos images avec notre IA experte ! Analyse instantanée, note sur 100 et conseils personnalisés." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr/analyse-image-gratuite" />
        <meta property="og:image" content="https://www.judgemyjpeg.fr/images/og-image.jpg" />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Analyse Image Gratuite",
              "description": "Service gratuit d'analyse d'image par intelligence artificielle",
              "url": "https://www.judgemyjpeg.fr/analyse-image-gratuite",
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "JudgeMyJPEG",
                "url": "https://www.judgemyjpeg.fr"
              },
              "mainEntity": {
                "@type": "Service",
                "name": "Analyse Image Gratuite par IA",
                "description": "Analysez vos images gratuitement grâce à l'intelligence artificielle. Obtenez une note détaillée et des conseils d'experts.",
                "provider": {
                  "@type": "Organization",
                  "name": "JudgeMyJPEG",
                  "url": "https://www.judgemyjpeg.fr"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR",
                  "description": "Analyse d'image gratuite illimitée",
                  "availability": "https://schema.org/InStock"
                }
              }
            })
          }}
        />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Analyse Image Gratuite
              </span>
            </h1>
            <p className="text-xl text-text-gray mb-8 max-w-3xl mx-auto">
              Obtenez une <span className="text-neon-cyan">analyse d'image professionnelle</span> en quelques secondes grâce à notre
              <span className="text-neon-pink"> intelligence artificielle experte</span>
            </p>

            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-green-300 font-semibold">
                ✨ 100% GRATUIT • Analyse instantanée • Sans inscription
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/analyze" className="btn-neon-pink text-lg px-8 py-3 text-center">
                📸 Analyser mon image
              </Link>
              {!session && (
                <Link href="/auth/signup" className="btn-neon-secondary text-lg px-8 py-3 text-center">
                  Créer un compte gratuit
                </Link>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Pourquoi <span className="text-neon-cyan">analyser vos images</span> ?
              </h2>

              <div className="grid md:grid-cols-2 gap-8 text-text-gray">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Analyse technique complète</h3>
                      <p>Évaluation détaillée de l'exposition, la netteté, les couleurs et la composition de vos images.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Critique artistique</h3>
                      <p>Analyse de l'impact émotionnel, de la créativité et de l'originalité de votre travail photographique.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Note détaillée sur 100</h3>
                      <p>Score global avec breakdown par catégorie : technique, composition, créativité, impact visuel.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Conseils d'amélioration</h3>
                      <p>Suggestions concrètes et actionnables pour perfectionner vos images et votre technique.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Résultat instantané</h3>
                      <p>Analyse en moins de 10 secondes grâce à notre IA optimisée et performante.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Confidentialité garantie</h3>
                      <p>Vos images sont analysées de manière sécurisée et ne sont jamais partagées.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Que comprend l'<span className="text-neon-pink">analyse d'image gratuite</span> ?
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
                  <div className="text-4xl mb-4">📐</div>
                  <h3 className="font-semibold text-white mb-3">Composition</h3>
                  <ul className="text-sm text-text-gray space-y-2 text-left">
                    <li>• Règle des tiers</li>
                    <li>• Lignes directrices</li>
                    <li>• Points d'intérêt</li>
                    <li>• Cadrage et espaces</li>
                  </ul>
                </div>

                <div className="text-center p-6 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="font-semibold text-white mb-3">Technique</h3>
                  <ul className="text-sm text-text-gray space-y-2 text-left">
                    <li>• Exposition et contraste</li>
                    <li>• Netteté et focus</li>
                    <li>• Balance des blancs</li>
                    <li>• Gestion du bruit</li>
                  </ul>
                </div>

                <div className="text-center p-6 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
                  <div className="text-4xl mb-4">🎭</div>
                  <h3 className="font-semibold text-white mb-3">Impact</h3>
                  <ul className="text-sm text-text-gray space-y-2 text-left">
                    <li>• Émotion transmise</li>
                    <li>• Originalité</li>
                    <li>• Storytelling</li>
                    <li>• Cohérence visuelle</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
              Comment <span className="text-neon-cyan">analyser une image</span> avec notre IA ?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl">Téléchargez</h3>
                <p className="text-text-gray">
                  Uploadez votre image (JPG, PNG, HEIC) jusqu'à 10 MB. Formats courants acceptés.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl">IA analyse</h3>
                <p className="text-text-gray">
                  Notre intelligence artificielle examine tous les aspects de votre image en quelques secondes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl">Recevez l'analyse</h3>
                <p className="text-text-gray">
                  Obtenez votre note détaillée, les points forts et les axes d'amélioration.
                </p>
              </div>
            </div>
          </div>

          {/* Image Types */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Quels <span className="text-neon-pink">types d'images</span> peut-on analyser ?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 text-text-gray">
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-neon-cyan">✓</span> Photographie
                  </h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Photos de paysages et nature</li>
                    <li>• Portraits et photos de personnes</li>
                    <li>• Photographie urbaine et architecture</li>
                    <li>• Photos animalières et wildlife</li>
                    <li>• Macro et photographie rapprochée</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-neon-cyan">✓</span> Images créatives
                  </h3>
                  <ul className="space-y-2 ml-6">
                    <li>• Images retouchées et post-traitées</li>
                    <li>• Créations graphiques</li>
                    <li>• Photos artistiques et conceptuelles</li>
                    <li>• Images de produits et packshots</li>
                    <li>• Photographie culinaire et lifestyle</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Schema */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Questions fréquentes
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">L'analyse d'image est-elle vraiment gratuite ?</h3>
                  <p className="text-text-gray">
                    Oui ! Nous offrons une analyse gratuite pour découvrir notre service. Vous pouvez ensuite créer un compte pour accéder à des fonctionnalités avancées comme l'historique de vos analyses et l'analyse en lot.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Combien de temps prend une analyse ?</h3>
                  <p className="text-text-gray">
                    L'analyse est quasi instantanée : moins de 10 secondes en moyenne. Notre IA est optimisée pour vous fournir un retour rapide et détaillé.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Mes images sont-elles en sécurité ?</h3>
                  <p className="text-text-gray">
                    Absolument. Vos images sont traitées de manière sécurisée et ne sont jamais partagées avec des tiers. Nous respectons votre vie privée et la confidentialité de vos créations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Quels formats d'image sont acceptés ?</h3>
                  <p className="text-text-gray">
                    Nous acceptons les formats JPG, JPEG, PNG, HEIC et WebP jusqu'à 10 MB. La plupart des images prises avec un smartphone ou un appareil photo sont compatibles.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">L'IA peut-elle remplacer un photographe professionnel ?</h3>
                  <p className="text-text-gray">
                    Notre IA est un outil d'aide et d'apprentissage, pas un remplacement. Elle fournit des analyses objectives basées sur des critères techniques et artistiques reconnus, mais le regard humain et l'expertise d'un photographe restent irremplaçables pour certains aspects créatifs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="glass-card p-8 bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 border-2 border-neon-pink/30">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Prêt à analyser vos images ?
              </h2>
              <p className="text-text-gray mb-6">
                Obtenez une analyse professionnelle instantanée et gratuite de vos images dès maintenant.
              </p>
              <Link href="/analyze" className="btn-neon-pink text-lg px-10 py-4 inline-block">
                🚀 Commencer l'analyse gratuite
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* FAQ Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "L'analyse d'image est-elle vraiment gratuite ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui ! Nous offrons une analyse gratuite pour découvrir notre service. Vous pouvez ensuite créer un compte pour accéder à des fonctionnalités avancées."
                }
              },
              {
                "@type": "Question",
                "name": "Combien de temps prend une analyse ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "L'analyse est quasi instantanée : moins de 10 secondes en moyenne. Notre IA est optimisée pour vous fournir un retour rapide et détaillé."
                }
              },
              {
                "@type": "Question",
                "name": "Mes images sont-elles en sécurité ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolument. Vos images sont traitées de manière sécurisée et ne sont jamais partagées avec des tiers."
                }
              },
              {
                "@type": "Question",
                "name": "Quels formats d'image sont acceptés ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Nous acceptons les formats JPG, JPEG, PNG, HEIC et WebP jusqu'à 10 MB."
                }
              }
            ]
          })
        }}
      />
    </>
  )
}
