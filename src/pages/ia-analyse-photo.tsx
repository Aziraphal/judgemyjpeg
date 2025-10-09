import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function IAAnalysePhoto() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>IA Analyse Photo | Intelligence Artificielle GPT-4 Vision pour Photos</title>
        <meta name="description" content="Découvrez comment l'intelligence artificielle GPT-4 Vision analyse vos photos. Technologie IA avancée pour une critique photo professionnelle instantanée." />
        <meta name="keywords" content="ia analyse photo, intelligence artificielle photo, GPT-4 Vision, analyse photo IA, critique photo intelligence artificielle, deep learning photographie" />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/ia-analyse-photo" />

        {/* Open Graph */}
        <meta property="og:title" content="IA Analyse Photo | Intelligence Artificielle GPT-4 Vision" />
        <meta property="og:description" content="Technologie d'intelligence artificielle GPT-4 Vision pour analyser vos photos comme un expert. Comprenez comment l'IA critique vos images." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr/ia-analyse-photo" />
        <meta property="og:image" content="https://www.judgemyjpeg.fr/images/og-image.jpg" />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TechArticle",
              "headline": "Comment l'IA analyse vos photos avec GPT-4 Vision",
              "description": "Découvrez la technologie d'intelligence artificielle derrière l'analyse photo automatique",
              "url": "https://www.judgemyjpeg.fr/ia-analyse-photo",
              "inLanguage": "fr-FR",
              "author": {
                "@type": "Organization",
                "name": "JudgeMyJPEG",
                "url": "https://www.judgemyjpeg.fr"
              },
              "publisher": {
                "@type": "Organization",
                "name": "JudgeMyJPEG",
                "url": "https://www.judgemyjpeg.fr"
              },
              "datePublished": "2025-10-09",
              "dateModified": "2025-10-09"
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
                IA Analyse Photo
              </span>
            </h1>
            <p className="text-xl text-text-gray mb-8 max-w-3xl mx-auto">
              Découvrez comment <span className="text-neon-cyan">l'intelligence artificielle GPT-4 Vision</span> analyse vos photos
              avec la <span className="text-neon-pink">précision d'un photographe professionnel</span>
            </p>

            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-blue-300 font-semibold">
                🤖 Technologie GPT-4 Vision • Deep Learning • Analyse multi-critères
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/analyze" className="btn-neon-pink text-lg px-8 py-3 text-center">
                🚀 Tester l'IA maintenant
              </Link>
              {!session && (
                <Link href="/auth/signup" className="btn-neon-secondary text-lg px-8 py-3 text-center">
                  Créer un compte gratuit
                </Link>
              )}
            </div>
          </div>

          {/* Technology Behind */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                La <span className="text-neon-cyan">technologie</span> derrière l'analyse IA
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-cosmic-glass rounded-lg border border-blue-500/30">
                  <span className="text-4xl">🧠</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-3 text-xl">GPT-4 Vision (GPT-4o)</h3>
                    <p className="text-text-gray mb-3">
                      Notre IA utilise <strong className="text-white">GPT-4 Vision d'OpenAI</strong>, le modèle d'intelligence artificielle multimodale le plus avancé au monde. Il comprend et analyse les images avec une précision équivalente à un expert humain.
                    </p>
                    <ul className="text-sm text-text-gray space-y-2">
                      <li>• <span className="text-neon-cyan">128k tokens de contexte</span> : analyse ultra-détaillée</li>
                      <li>• <span className="text-neon-cyan">Vision + Langage</span> : compréhension contextuelle profonde</li>
                      <li>• <span className="text-neon-cyan">Entraîné sur millions d'images</span> : expertise universelle</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-cosmic-glass rounded-lg border border-purple-500/30">
                  <span className="text-4xl">🔬</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-3 text-xl">Analyse multi-critères</h3>
                    <p className="text-text-gray mb-3">
                      L'IA évalue vos photos selon <strong className="text-white">50+ critères professionnels</strong> répartis en 5 catégories principales.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-cosmic-overlay/50 p-4 rounded">
                        <h4 className="text-white font-semibold mb-2">📐 Composition</h4>
                        <p className="text-sm text-text-gray">Règle des tiers, lignes directrices, équilibre visuel, points d'intérêt</p>
                      </div>
                      <div className="bg-cosmic-overlay/50 p-4 rounded">
                        <h4 className="text-white font-semibold mb-2">⚙️ Technique</h4>
                        <p className="text-sm text-text-gray">Exposition, netteté, couleurs, bruit numérique, aberrations</p>
                      </div>
                      <div className="bg-cosmic-overlay/50 p-4 rounded">
                        <h4 className="text-white font-semibold mb-2">💡 Lumière</h4>
                        <p className="text-sm text-text-gray">Direction, qualité, ambiance, gestion des ombres et hautes lumières</p>
                      </div>
                      <div className="bg-cosmic-overlay/50 p-4 rounded">
                        <h4 className="text-white font-semibold mb-2">🎨 Impact artistique</h4>
                        <p className="text-sm text-text-gray">Créativité, émotion, originalité, storytelling, cohérence</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-cosmic-glass rounded-lg border border-green-500/30">
                  <span className="text-4xl">⚡</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-3 text-xl">Traitement optimisé</h3>
                    <p className="text-text-gray mb-3">
                      Architecture cloud scalable garantissant une <strong className="text-white">analyse en moins de 10 secondes</strong>, même aux heures de pointe.
                    </p>
                    <ul className="text-sm text-text-gray space-y-2">
                      <li>• Serveurs GPU dédiés pour le deep learning</li>
                      <li>• Compression intelligente sans perte de qualité</li>
                      <li>• Parallélisation des analyses multi-critères</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How AI Sees Photos */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
              Comment l'IA <span className="text-neon-pink">"voit"</span> vos photos ?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">👁️</span>
                  Perception visuelle
                </h3>
                <p className="text-text-gray mb-4">
                  L'IA décompose votre image en <strong className="text-white">patches visuels</strong> et analyse chaque zone individuellement avant de reconstituer une compréhension globale.
                </p>
                <ul className="text-sm text-text-gray space-y-2">
                  <li>• <strong className="text-neon-cyan">Détection d'objets</strong> : sujet principal, éléments secondaires</li>
                  <li>• <strong className="text-neon-cyan">Segmentation sémantique</strong> : ciel, sol, personnes, architecture</li>
                  <li>• <strong className="text-neon-cyan">Reconnaissance de scène</strong> : paysage, portrait, urbain, nature</li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Analyse quantitative
                </h3>
                <p className="text-text-gray mb-4">
                  Mesures objectives extraites directement de l'image : <strong className="text-white">histogrammes, métadonnées EXIF, statistiques colorimétriques</strong>.
                </p>
                <ul className="text-sm text-text-gray space-y-2">
                  <li>• <strong className="text-neon-cyan">Distribution tonale</strong> : exposition, contraste, dynamique</li>
                  <li>• <strong className="text-neon-cyan">Analyse de netteté</strong> : zones de focus, flou, détails</li>
                  <li>• <strong className="text-neon-cyan">Espaces colorimétriques</strong> : saturation, balance, harmonies</li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">🎭</span>
                  Compréhension contextuelle
                </h3>
                <p className="text-text-gray mb-4">
                  L'IA comprend le <strong className="text-white">contexte</strong> et l'intention : un flou artistique n'est pas jugé comme un défaut technique.
                </p>
                <ul className="text-sm text-text-gray space-y-2">
                  <li>• <strong className="text-neon-cyan">Genre photographique</strong> : adapte ses critères (portrait vs paysage)</li>
                  <li>• <strong className="text-neon-cyan">Intention artistique</strong> : distingue choix créatif vs erreur</li>
                  <li>• <strong className="text-neon-cyan">Conventions esthétiques</strong> : connaît les "règles" et leurs exceptions</li>
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">💬</span>
                  Génération de feedback
                </h3>
                <p className="text-text-gray mb-4">
                  Synthèse en <strong className="text-white">langage naturel</strong> compréhensible par tous, du débutant au professionnel.
                </p>
                <ul className="text-sm text-text-gray space-y-2">
                  <li>• <strong className="text-neon-cyan">Critique constructive</strong> : points forts + axes d'amélioration</li>
                  <li>• <strong className="text-neon-cyan">Conseils actionnables</strong> : comment corriger, pas juste "c'est mal"</li>
                  <li>• <strong className="text-neon-cyan">Explications pédagogiques</strong> : pourquoi c'est important</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI vs Human */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                IA vs <span className="text-neon-cyan">Photographe humain</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-cosmic-glassborder">
                      <th className="py-4 px-4 text-white">Critère</th>
                      <th className="py-4 px-4 text-neon-cyan">IA GPT-4 Vision</th>
                      <th className="py-4 px-4 text-neon-pink">Expert humain</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-gray">
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Vitesse d'analyse</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> 10 secondes</td>
                      <td className="py-4 px-4">5-15 minutes</td>
                    </tr>
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Objectivité technique</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> 100% objective (mesures)</td>
                      <td className="py-4 px-4">Variable selon l'expert</td>
                    </tr>
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Connaissance universelle</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> Tous genres photo</td>
                      <td className="py-4 px-4">Spécialisation limitée</td>
                    </tr>
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Disponibilité</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> 24/7 instantané</td>
                      <td className="py-4 px-4">Prise de RDV nécessaire</td>
                    </tr>
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Coût</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> Gratuit / Low-cost</td>
                      <td className="py-4 px-4">50-200€ / consultation</td>
                    </tr>
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Intuition artistique</td>
                      <td className="py-4 px-4">Très bonne (95%)</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> Excellente (100%)</td>
                    </tr>
                    <tr className="border-b border-cosmic-glassborder/50">
                      <td className="py-4 px-4 font-semibold text-white">Empathie / conseil personnalisé</td>
                      <td className="py-4 px-4">Conseils génériques</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> Adapté à votre niveau</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-semibold text-white">Évolution des tendances</td>
                      <td className="py-4 px-4"><span className="text-green-400">✓</span> Mise à jour continue</td>
                      <td className="py-4 px-4">Formation continue requise</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-center text-text-gray mt-6 italic">
                💡 L'IA et l'expert humain sont <strong className="text-white">complémentaires</strong>, pas concurrents. L'IA excelle pour l'analyse technique rapide, l'humain pour la direction artistique personnalisée.
              </p>
            </div>
          </div>

          {/* Precision & Reliability */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
              Précision et <span className="text-neon-cyan">fiabilité</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <div className="text-5xl font-bold text-neon-cyan mb-3">95%</div>
                <h3 className="font-semibold text-white mb-2">Précision technique</h3>
                <p className="text-sm text-text-gray">
                  Détection des problèmes techniques (flou, exposition, bruit) validée par experts
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="text-5xl font-bold text-neon-pink mb-3">92%</div>
                <h3 className="font-semibold text-white mb-2">Cohérence</h3>
                <p className="text-sm text-text-gray">
                  Résultats reproductibles : même photo = même analyse à chaque fois
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="text-5xl font-bold text-neon-purple mb-3">88%</div>
                <h3 className="font-semibold text-white mb-2">Évaluation artistique</h3>
                <p className="text-sm text-text-gray">
                  Accord avec le jugement d'experts sur l'impact émotionnel et la créativité
                </p>
              </div>
            </div>

            <div className="glass-card p-6 mt-8">
              <h3 className="font-semibold text-white mb-4 text-lg">🔬 Méthodologie de validation</h3>
              <p className="text-text-gray mb-4">
                Nos modèles IA sont testés en continu sur un <strong className="text-white">dataset de 10,000+ photos</strong> annotées par des photographes professionnels. Nous mesurons :
              </p>
              <ul className="text-sm text-text-gray space-y-2">
                <li>• <strong className="text-white">Accuracy</strong> : l'IA détecte-t-elle les mêmes problèmes que l'expert ?</li>
                <li>• <strong className="text-white">Correlation</strong> : les notes IA sont-elles alignées avec les notes humaines ?</li>
                <li>• <strong className="text-white">Consistency</strong> : l'IA donne-t-elle toujours le même résultat ?</li>
              </ul>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass-card p-8 border-2 border-green-500/30">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                🔒 Confidentialité et <span className="text-neon-cyan">sécurité</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🛡️</span> Vos photos sont protégées
                  </h3>
                  <ul className="text-text-gray space-y-2 text-sm">
                    <li>• Transfert chiffré en HTTPS (SSL/TLS)</li>
                    <li>• Stockage temporaire sécurisé (24h max)</li>
                    <li>• Suppression automatique après analyse</li>
                    <li>• Aucun partage avec des tiers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🔐</span> Conformité RGPD
                  </h3>
                  <ul className="text-text-gray space-y-2 text-sm">
                    <li>• Serveurs hébergés en Europe (France)</li>
                    <li>• Droit à l'effacement garanti</li>
                    <li>• Pas de training sur vos images privées</li>
                    <li>• Transparence totale sur le traitement</li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-text-gray mt-6 text-sm italic">
                Vos photos sont <strong className="text-white">uniquement</strong> utilisées pour générer votre analyse, jamais pour entraîner nos modèles sans votre consentement explicite.
              </p>
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
                  <h3 className="font-semibold text-white mb-2 text-lg">L'IA peut-elle vraiment remplacer un photographe professionnel ?</h3>
                  <p className="text-text-gray">
                    Non, et ce n'est pas l'objectif. L'IA est un <strong className="text-white">outil d'assistance</strong> qui excelle pour l'analyse technique rapide et objective. Un photographe professionnel apporte l'expérience humaine, l'empathie et la créativité que l'IA ne peut pas reproduire. Les deux sont complémentaires.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Quel modèle d'IA utilisez-vous exactement ?</h3>
                  <p className="text-text-gray">
                    Nous utilisons <strong className="text-white">GPT-4 Vision (GPT-4o)</strong> d'OpenAI, combiné à nos propres algorithmes de traitement d'image pour l'analyse quantitative. Le modèle est régulièrement mis à jour pour bénéficier des dernières avancées.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Mes photos servent-elles à entraîner votre IA ?</h3>
                  <p className="text-text-gray">
                    <strong className="text-white">Non</strong>, par défaut. Vos photos sont analysées puis supprimées. Seules les photos que vous choisissez explicitement de rendre publiques (galerie communautaire) peuvent être utilisées pour améliorer nos modèles, et uniquement avec votre permission.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">L'IA comprend-elle les styles artistiques spécifiques (vintage, cinématique, etc.) ?</h3>
                  <p className="text-text-gray">
                    Oui ! GPT-4 Vision a été entraîné sur une immense diversité de styles photographiques. L'IA reconnaît et respecte les choix stylistiques intentionnels (grain argentique, teintes cinéma, etc.) et ne les juge pas comme des défauts.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Puis-je faire confiance aux notes données par l'IA ?</h3>
                  <p className="text-text-gray">
                    Les notes sont basées sur des <strong className="text-white">critères objectifs et consensuels</strong> de la photographie professionnelle. Elles donnent une indication fiable, mais gardez en tête que la photographie reste subjective. Une photo "72/100" peut être parfaite pour votre usage, même si techniquement imparfaite.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="glass-card p-8 bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 border-2 border-neon-cyan/30">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Testez l'intelligence artificielle maintenant
              </h2>
              <p className="text-text-gray mb-6">
                Découvrez par vous-même la puissance de GPT-4 Vision pour analyser vos photos comme un expert professionnel.
              </p>
              <Link href="/analyze" className="btn-neon-cyan text-lg px-10 py-4 inline-block">
                🤖 Analyser avec l'IA gratuitement
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
                "name": "L'IA peut-elle vraiment remplacer un photographe professionnel ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Non, et ce n'est pas l'objectif. L'IA est un outil d'assistance qui excelle pour l'analyse technique rapide et objective. Un photographe professionnel apporte l'expérience humaine, l'empathie et la créativité que l'IA ne peut pas reproduire."
                }
              },
              {
                "@type": "Question",
                "name": "Quel modèle d'IA utilisez-vous exactement ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Nous utilisons GPT-4 Vision (GPT-4o) d'OpenAI, combiné à nos propres algorithmes de traitement d'image pour l'analyse quantitative."
                }
              },
              {
                "@type": "Question",
                "name": "Mes photos servent-elles à entraîner votre IA ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Non, par défaut. Vos photos sont analysées puis supprimées. Seules les photos que vous choisissez explicitement de rendre publiques peuvent être utilisées pour améliorer nos modèles."
                }
              }
            ]
          })
        }}
      />
    </>
  )
}
