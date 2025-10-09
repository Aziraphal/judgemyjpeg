import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function DiagnosticPhoto() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Diagnostic Photo en Ligne | Détecter les Problèmes de vos Photos</title>
        <meta name="description" content="Diagnostic photo gratuit par IA : détectez instantanément les problèmes techniques de vos photos (flou, exposition, bruit, cadrage). Analyse complète en 10 secondes." />
        <meta name="keywords" content="diagnostic photo, détecter problème photo, analyse technique photo, photo floue, sous-exposition, bruit numérique, cadrage photo" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/diagnostic-photo" />

        {/* Open Graph */}
        <meta property="og:title" content="Diagnostic Photo Gratuit | Détection Automatique des Problèmes" />
        <meta property="og:description" content="Notre IA détecte automatiquement les problèmes techniques de vos photos : flou, exposition incorrecte, bruit, cadrage. Diagnostic gratuit et instantané." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr/diagnostic-photo" />
        <meta property="og:image" content="https://www.judgemyjpeg.fr/images/og-image.jpg" />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Diagnostic Photo en Ligne",
              "description": "Service de diagnostic photo gratuit par intelligence artificielle pour détecter les problèmes techniques",
              "url": "https://www.judgemyjpeg.fr/diagnostic-photo",
              "inLanguage": "fr-FR",
              "isPartOf": {
                "@type": "WebSite",
                "name": "JudgeMyJPEG",
                "url": "https://www.judgemyjpeg.fr"
              },
              "mainEntity": {
                "@type": "Service",
                "name": "Diagnostic Photo Gratuit",
                "description": "Diagnostic automatique des problèmes techniques de vos photos par intelligence artificielle",
                "provider": {
                  "@type": "Organization",
                  "name": "JudgeMyJPEG",
                  "url": "https://www.judgemyjpeg.fr"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "EUR",
                  "description": "Diagnostic photo gratuit illimité",
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
                Diagnostic Photo en Ligne
              </span>
            </h1>
            <p className="text-xl text-text-gray mb-8 max-w-3xl mx-auto">
              Identifiez instantanément les <span className="text-neon-cyan">problèmes techniques</span> de vos photos grâce à notre
              <span className="text-neon-pink"> intelligence artificielle experte</span>
            </p>

            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-yellow-300 font-semibold">
                🔍 Détection automatique • Diagnostic en 10 secondes • 100% gratuit
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/analyze" className="btn-neon-pink text-lg px-8 py-3 text-center">
                🩺 Diagnostiquer ma photo
              </Link>
              {!session && (
                <Link href="/auth/signup" className="btn-neon-secondary text-lg px-8 py-3 text-center">
                  Créer un compte gratuit
                </Link>
              )}
            </div>
          </div>

          {/* Common Problems Detected */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Quels <span className="text-neon-cyan">problèmes</span> notre IA détecte-t-elle ?
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-cosmic-glass rounded-lg border border-red-500/30">
                    <span className="text-2xl">📷</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Problèmes d'exposition</h3>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Sous-exposition (photo trop sombre)</li>
                        <li>• Surexposition (zones brûlées)</li>
                        <li>• Contraste insuffisant ou excessif</li>
                        <li>• Balance des blancs incorrecte</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-cosmic-glass rounded-lg border border-yellow-500/30">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Problèmes de netteté</h3>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Flou de mise au point</li>
                        <li>• Flou de bougé (appareil ou sujet)</li>
                        <li>• Profondeur de champ inadaptée</li>
                        <li>• Manque de détails</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-cosmic-glass rounded-lg border border-blue-500/30">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Problèmes de couleur</h3>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Dominante colorée non désirée</li>
                        <li>• Saturation excessive ou insuffisante</li>
                        <li>• Couleurs ternes ou délavées</li>
                        <li>• Teinte peau non naturelle (portraits)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-cosmic-glass rounded-lg border border-purple-500/30">
                    <span className="text-2xl">📐</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Problèmes de composition</h3>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Cadrage décentré ou bancal</li>
                        <li>• Horizon penché</li>
                        <li>• Sujet coupé maladroitement</li>
                        <li>• Éléments distrayants dans le cadre</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-cosmic-glass rounded-lg border border-green-500/30">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Problèmes techniques</h3>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Bruit numérique (ISO élevé)</li>
                        <li>• Aberration chromatique</li>
                        <li>• Vignettage excessif</li>
                        <li>• Artefacts de compression</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-cosmic-glass rounded-lg border border-orange-500/30">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Problèmes de lumière</h3>
                      <ul className="text-sm text-text-gray space-y-1">
                        <li>• Contre-jour mal géré</li>
                        <li>• Ombres trop dures</li>
                        <li>• Reflets indésirables</li>
                        <li>• Éclairage plat ou sans relief</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
              Comment fonctionne le <span className="text-neon-cyan">diagnostic photo</span> ?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl">Upload</h3>
                <p className="text-text-gray">
                  Uploadez votre photo (JPG, PNG, HEIC). L'analyse commence automatiquement.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl">Détection IA</h3>
                <p className="text-text-gray">
                  Notre IA analyse 50+ critères techniques pour identifier tous les problèmes potentiels.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-white mb-3 text-xl">Diagnostic détaillé</h3>
                <p className="text-text-gray">
                  Recevez un rapport complet avec les problèmes détectés et comment les corriger.
                </p>
              </div>
            </div>
          </div>

          {/* Solutions Provided */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Des <span className="text-neon-pink">solutions concrètes</span> pour chaque problème
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-cosmic-glass rounded-lg">
                  <span className="text-3xl">✅</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Identification précise</h3>
                    <p className="text-text-gray">
                      Notre IA identifie non seulement QU'il y a un problème, mais QUEL problème spécifiquement : "Sous-exposition de 2 stops" plutôt que juste "photo sombre".
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-cosmic-glass rounded-lg">
                  <span className="text-3xl">💡</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Conseils de correction</h3>
                    <p className="text-text-gray">
                      Pour chaque problème détecté, vous recevez des conseils précis pour le corriger en post-production (Lightroom, Photoshop) ou éviter l'erreur à la prise de vue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-cosmic-glass rounded-lg">
                  <span className="text-3xl">📚</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Apprentissage progressif</h3>
                    <p className="text-text-gray">
                      Comprenez POURQUOI c'est un problème et comment l'éviter à l'avenir. Progressez rapidement grâce aux explications pédagogiques.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-cosmic-glass rounded-lg">
                  <span className="text-3xl">🎯</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Priorisation des corrections</h3>
                    <p className="text-text-gray">
                      L'IA classe les problèmes par ordre d'importance : corrigez d'abord ce qui impacte le plus la qualité de votre photo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
              Pour qui est le <span className="text-neon-cyan">diagnostic photo</span> ?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="font-semibold text-white mb-3 text-xl">Débutants en photo</h3>
                <p className="text-text-gray">
                  Apprenez à identifier ce qui ne va pas dans vos photos et comprenez comment améliorer votre technique de prise de vue.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="font-semibold text-white mb-3 text-xl">Photographes amateurs</h3>
                <p className="text-text-gray">
                  Gagnez du temps en identifiant rapidement les photos ratées avant la post-production. Focus sur les meilleures images.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-semibold text-white mb-3 text-xl">Retoucheurs photo</h3>
                <p className="text-text-gray">
                  Diagnostic rapide des problèmes techniques avant de commencer la retouche. Identifiez les images impossibles à sauver.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="font-semibold text-white mb-3 text-xl">Professionnels exigeants</h3>
                <p className="text-text-gray">
                  Second œil objectif pour vérifier la qualité technique de vos livraisons client. Détection des défauts invisibles à l'œil nu.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Questions fréquentes
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Le diagnostic peut-il corriger automatiquement les problèmes ?</h3>
                  <p className="text-text-gray">
                    Non, le diagnostic identifie les problèmes et vous donne des conseils pour les corriger. La correction elle-même doit être faite dans un logiciel de retouche (Lightroom, Photoshop, etc.) ou en retravaillant la prise de vue.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">L'IA peut-elle se tromper dans son diagnostic ?</h3>
                  <p className="text-text-gray">
                    Notre IA a un taux de précision de 95% sur les problèmes techniques majeurs. Certains choix artistiques intentionnels (comme le flou de bougé créatif) peuvent être signalés comme "problèmes" alors qu'ils sont voulus.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Puis-je diagnostiquer plusieurs photos à la fois ?</h3>
                  <p className="text-text-gray">
                    Oui ! Avec un compte gratuit, utilisez notre fonction d'analyse en lot pour diagnostiquer jusqu'à 10 photos simultanément. Les comptes premium peuvent analyser jusqu'à 100 photos.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Le diagnostic fonctionne-t-il sur photos anciennes ou argentiques numérisées ?</h3>
                  <p className="text-text-gray">
                    Oui, tant que la photo est au format numérique (scan). L'IA adapte ses critères pour tenir compte du grain argentique naturel et ne le signale pas comme du bruit numérique.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Les photos RAW sont-elles acceptées ?</h3>
                  <p className="text-text-gray">
                    Actuellement, nous acceptons JPG, PNG, HEIC et WebP. Pour les RAW, exportez d'abord en JPG haute qualité depuis votre logiciel photo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="glass-card p-8 bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 border-2 border-neon-pink/30">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Diagnostiquez vos photos maintenant
              </h2>
              <p className="text-text-gray mb-6">
                Identifiez instantanément les problèmes techniques de vos photos et recevez des conseils d'experts pour les corriger.
              </p>
              <Link href="/analyze" className="btn-neon-pink text-lg px-10 py-4 inline-block">
                🩺 Lancer le diagnostic gratuit
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
                "name": "Le diagnostic peut-il corriger automatiquement les problèmes ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Non, le diagnostic identifie les problèmes et vous donne des conseils pour les corriger. La correction elle-même doit être faite dans un logiciel de retouche."
                }
              },
              {
                "@type": "Question",
                "name": "L'IA peut-elle se tromper dans son diagnostic ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Notre IA a un taux de précision de 95% sur les problèmes techniques majeurs. Certains choix artistiques intentionnels peuvent être signalés comme problèmes."
                }
              },
              {
                "@type": "Question",
                "name": "Puis-je diagnostiquer plusieurs photos à la fois ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oui ! Avec un compte gratuit, utilisez notre fonction d'analyse en lot pour diagnostiquer jusqu'à 10 photos simultanément."
                }
              }
            ]
          })
        }}
      />
    </>
  )
}
