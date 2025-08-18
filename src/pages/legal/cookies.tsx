import Head from 'next/head'

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Politique de Cookies - JudgeMyJPEG</title>
        <meta name="description" content="Politique de cookies et gestion des préférences de JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Politique de Cookies
              </span>
            </h1>
            <p className="text-text-gray">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => window.history.back()}
              className="btn-neon-secondary"
            >
              ← Retour
            </button>
          </div>

          {/* Contenu */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">1. Qu'est-ce qu'un Cookie ?</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. 
                    Les cookies permettent d'améliorer votre expérience utilisateur en mémorisant vos préférences 
                    et en facilitant la navigation.
                  </p>
                  <p>
                    JudgeMyJPEG utilise des cookies pour assurer le bon fonctionnement du service, 
                    personnaliser votre expérience et analyser l'utilisation de notre plateforme.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">2. Types de Cookies Utilisés</h2>
                <div className="text-text-gray space-y-6">
                  
                  <div className="bg-cosmic-glass p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">🔧 Cookies Techniques (Indispensables)</h3>
                    <p className="text-sm text-text-gray mb-3">
                      Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>next-auth.session-token</strong></span>
                        <span className="text-text-muted">Session utilisateur</span>
                      </div>
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>next-auth.csrf-token</strong></span>
                        <span className="text-text-muted">Protection CSRF</span>
                      </div>
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>stripe-checkout</strong></span>
                        <span className="text-text-muted">Processus de paiement</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>user-preferences</strong></span>
                        <span className="text-text-muted">Langue, mode d'analyse</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                      <p className="text-green-300 text-xs">
                        ✅ <strong>Consentement :</strong> Non requis (fonctionnement essentiel)
                      </p>
                    </div>
                  </div>

                  <div className="bg-cosmic-glass p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">📊 Cookies Analytiques</h3>
                    <p className="text-sm text-text-gray mb-3">
                      Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>_ga, _ga_*</strong></span>
                        <span className="text-text-muted">Google Analytics (anonymisé)</span>
                      </div>
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>_gid</strong></span>
                        <span className="text-text-muted">Identification session Analytics</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>judge-analytics</strong></span>
                        <span className="text-text-muted">Métriques internes</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-900/20 rounded border border-blue-500/30">
                      <p className="text-blue-300 text-xs">
                        🔒 <strong>Consentement :</strong> Requis - Données anonymisées
                      </p>
                    </div>
                  </div>

                  <div className="bg-cosmic-glass p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">🎯 Cookies de Personnalisation</h3>
                    <p className="text-sm text-text-gray mb-3">
                      Ces cookies améliorent votre expérience en mémorisant vos choix et préférences.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>theme-preference</strong></span>
                        <span className="text-text-muted">Mode sombre/clair</span>
                      </div>
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>analysis-mode</strong></span>
                        <span className="text-text-muted">Mode Pro/Cassant par défaut</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>language-pref</strong></span>
                        <span className="text-text-muted">Langue d'interface préférée</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
                      <p className="text-yellow-300 text-xs">
                        ⚙️ <strong>Consentement :</strong> Optionnel - Améliore l'expérience
                      </p>
                    </div>
                  </div>

                  <div className="bg-cosmic-glass p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">📱 Cookies de Réseaux Sociaux</h3>
                    <p className="text-sm text-text-gray mb-3">
                      Ces cookies permettent le partage de contenu sur les réseaux sociaux.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>Twitter/X widgets</strong></span>
                        <span className="text-text-muted">Partage Twitter</span>
                      </div>
                      <div className="flex justify-between border-b border-cosmic-glassborder pb-2">
                        <span><strong>Facebook Like Button</strong></span>
                        <span className="text-text-muted">Boutons Facebook</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>LinkedIn Share</strong></span>
                        <span className="text-text-muted">Partage professionnel</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                      <p className="text-purple-300 text-xs">
                        🌐 <strong>Consentement :</strong> Requis - Tiers externes
                      </p>
                    </div>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">3. Durée de Conservation</h2>
                <div className="text-text-gray space-y-4">
                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-neon-cyan mb-2">Cookies de Session</h4>
                        <ul className="space-y-1">
                          <li>• Supprimés à la fermeture du navigateur</li>
                          <li>• Authentification et sécurité</li>
                          <li>• Panier et préférences temporaires</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neon-cyan mb-2">Cookies Persistants</h4>
                        <ul className="space-y-1">
                          <li>• <strong>Analytics :</strong> 24 mois maximum</li>
                          <li>• <strong>Préférences :</strong> 12 mois</li>
                          <li>• <strong>Consentement :</strong> 13 mois</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">4. Gestion de vos Préférences</h2>
                <div className="text-text-gray space-y-4">
                  
                  <h3 className="text-lg font-semibold text-neon-pink">4.1 Centre de préférences cookies</h3>
                  <p>
                    Vous pouvez gérer vos préférences cookies à tout moment :
                  </p>
                  <div className="bg-neon-cyan/10 p-6 rounded-lg border border-neon-cyan/30">
                    <div className="text-center">
                      <button className="btn-neon-primary mb-4">
                        🍪 Gérer mes cookies
                      </button>
                      <p className="text-sm text-text-muted">
                        Panneau de configuration disponible en bas de page
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-neon-pink mt-6">4.2 Paramètres navigateur</h3>
                  <p className="mb-3">
                    Vous pouvez également contrôler les cookies via votre navigateur :
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-cosmic-glass p-4 rounded">
                      <h4 className="font-semibold text-neon-cyan mb-2">Chrome/Edge</h4>
                      <p className="text-xs">Paramètres → Confidentialité et sécurité → Cookies</p>
                    </div>
                    <div className="bg-cosmic-glass p-4 rounded">
                      <h4 className="font-semibold text-neon-cyan mb-2">Firefox</h4>
                      <p className="text-xs">Paramètres → Vie privée → Cookies et données</p>
                    </div>
                    <div className="bg-cosmic-glass p-4 rounded">
                      <h4 className="font-semibold text-neon-cyan mb-2">Safari</h4>
                      <p className="text-xs">Préférences → Confidentialité → Cookies</p>
                    </div>
                    <div className="bg-cosmic-glass p-4 rounded">
                      <h4 className="font-semibold text-neon-cyan mb-2">Mobile</h4>
                      <p className="text-xs">Paramètres du navigateur → Confidentialité</p>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>⚠️ Attention :</strong> La désactivation de certains cookies peut limiter 
                      les fonctionnalités du site (connexion, préférences, analyses).
                    </p>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">5. Cookies Tiers</h2>
                <div className="text-text-gray space-y-4">
                  
                  <p>
                    Certains cookies sont déposés par des services tiers que nous utilisons. 
                    Nous n'avons pas de contrôle direct sur ces cookies.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-cosmic-glass p-4 rounded-lg">
                      <h4 className="font-semibold text-neon-pink mb-2">🔍 Google Services</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Analytics :</strong> Mesure d'audience anonymisée</li>
                        <li>• <strong>reCAPTCHA :</strong> Protection anti-spam</li>
                        <li>• <strong>OAuth :</strong> Connexion avec votre compte Google</li>
                      </ul>
                      <p className="text-xs text-text-muted mt-2">
                        Politique : <a href="https://policies.google.com/privacy" className="text-neon-cyan hover:underline">
                          policies.google.com/privacy
                        </a>
                      </p>
                    </div>

                    <div className="bg-cosmic-glass p-4 rounded-lg">
                      <h4 className="font-semibold text-neon-pink mb-2">💳 Stripe</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Checkout :</strong> Processus de paiement sécurisé</li>
                        <li>• <strong>Fraud Prevention :</strong> Détection de fraude</li>
                      </ul>
                      <p className="text-xs text-text-muted mt-2">
                        Politique : <a href="https://stripe.com/privacy" className="text-neon-cyan hover:underline">
                          stripe.com/privacy
                        </a>
                      </p>
                    </div>

                    <div className="bg-cosmic-glass p-4 rounded-lg">
                      <h4 className="font-semibold text-neon-pink mb-2">☁️ Cloudinary</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Image Delivery :</strong> Optimisation d'images</li>
                        <li>• <strong>CDN :</strong> Performance de chargement</li>
                      </ul>
                      <p className="text-xs text-text-muted mt-2">
                        Politique : <a href="https://cloudinary.com/privacy" className="text-neon-cyan hover:underline">
                          cloudinary.com/privacy
                        </a>
                      </p>
                    </div>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">6. Vos Droits</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Conformément au RGPD, vous disposez de plusieurs droits concernant les cookies :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Droit au consentement libre :</strong> Accepter ou refuser les cookies non essentiels</li>
                    <li><strong>Droit de retrait :</strong> Modifier vos préférences à tout moment</li>
                    <li><strong>Droit à l'information :</strong> Connaître les cookies utilisés et leurs finalités</li>
                    <li><strong>Droit d'accès :</strong> Savoir quelles données sont collectées via les cookies</li>
                    <li><strong>Droit d'effacement :</strong> Supprimer les cookies de votre navigateur</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">7. Conformité Légale</h2>
                <div className="text-text-gray space-y-3">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">📋 Textes de référence</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>RGPD :</strong> Règlement UE 2016/679</li>
                      <li>• <strong>ePrivacy :</strong> Directive 2002/58/CE</li>
                      <li>• <strong>LCEN :</strong> Loi française pour la confiance dans l'économie numérique</li>
                      <li>• <strong>CNIL :</strong> Recommandations cookies et autres traceurs</li>
                    </ul>
                  </div>
                  <p>
                    JudgeMyJPEG s'engage à respecter la réglementation française et européenne 
                    sur la protection des données personnelles et l'utilisation des cookies.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">8. Contact</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Pour toute question concernant notre utilisation des cookies :
                  </p>
                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li><strong>Email général :</strong> contact.judgemyjpeg@gmail.com</li>
                      <li><strong>Questions cookies :</strong> contact.judgemyjpeg@gmail.com</li>
                      <li><strong>Contact :</strong> contact.judgemyjpeg@gmail.com</li>
                      <li><strong>Support technique :</strong> contact.judgemyjpeg@gmail.com</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">9. Modifications de cette Politique</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Cette politique de cookies peut être mise à jour pour refléter :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>L'évolution de nos services et fonctionnalités</li>
                    <li>Les changements dans la réglementation</li>
                    <li>L'ajout ou la suppression de partenaires tiers</li>
                    <li>L'amélioration de nos pratiques de confidentialité</li>
                  </ul>
                  <p>
                    <strong>Notification :</strong> Les modifications importantes vous seront signalées 
                    par un nouveau bandeau de consentement lors de votre prochaine visite.
                  </p>
                </div>
              </section>

              {/* Date de mise à jour */}
              <div className="text-center pt-8 border-t border-cosmic-glassborder">
                <p className="text-text-muted text-sm">
                  Politique de cookies - Version 1.0
                  <br />
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                  <br />
                  Conforme au RGPD et à la réglementation française sur les cookies
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}