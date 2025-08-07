import Head from 'next/head'

export default function Mentions() {
  return (
    <>
      <Head>
        <title>Mentions Légales - JudgeMyJPEG</title>
        <meta name="description" content="Mentions légales et informations sur l'éditeur de JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Mentions Légales
              </span>
            </h1>
            <p className="text-text-gray">
              Informations légales et éditoriales
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
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">1. Éditeur du Site</h2>
                <div className="bg-cosmic-glass p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">Informations sur l'éditeur</h3>
                      <div className="text-text-gray space-y-2">
                        <p><strong>Raison sociale :</strong> Cyril Paquier</p>
                        <p><strong>Nom commercial :</strong> CodeCraft Plus</p>
                        <p><strong>Forme juridique :</strong> Entrepreneur individuel</p>
                        <p><strong>Numéro SIREN :</strong> 989587399</p>
                        <p><strong>Numéro SIRET :</strong> 98958739900019</p>
                        <p><strong>Code APE/NAF :</strong> 1812Z</p>
                        <p><strong>Date d'immatriculation :</strong> 28/07/2025</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">Coordonnées</h3>
                      <div className="text-text-gray space-y-2">
                        <p><strong>Adresse :</strong><br/>
                        9 Allée de la Meilleraie<br/>
                        85340 Les Sables-d'Olonne<br/>
                        France</p>
                        <p><strong>Email :</strong> contact@judgemyjpeg.com</p>
                        <p><strong>Téléphone :</strong> [À définir]</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">2. Directeur de Publication</h2>
                <div className="text-text-gray space-y-3">
                  <p><strong>Directeur de publication :</strong> Cyril Paquier</p>
                  <p><strong>Qualité :</strong> Entrepreneur individuel - Propriétaire</p>
                  <p>
                    Le directeur de publication est responsable du contenu éditorial du site 
                    conformément à la loi du 29 juillet 1881 sur la liberté de la presse.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">3. Hébergement</h2>
                <div className="bg-cosmic-glass p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">Hébergeur Principal</h3>
                      <div className="text-text-gray space-y-2">
                        <p><strong>Raison sociale :</strong> Vercel Inc.</p>
                        <p><strong>Adresse :</strong><br/>
                        440 N Barranca Ave<br/>
                        Covina, CA 91723<br/>
                        États-Unis</p>
                        <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-neon-cyan hover:underline">vercel.com</a></p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">Base de Données</h3>
                      <div className="text-text-gray space-y-2">
                        <p><strong>Prestataire :</strong> Neon Database</p>
                        <p><strong>Localisation :</strong> Centres de données européens</p>
                        <p><strong>Type :</strong> PostgreSQL hébergé</p>
                        <p><strong>Site web :</strong> <a href="https://neon.tech" className="text-neon-cyan hover:underline">neon.tech</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">4. Services Tiers</h2>
                <div className="space-y-6">
                  
                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">🤖 Intelligence Artificielle</h3>
                    <div className="text-text-gray space-y-2">
                      <p><strong>Service :</strong> Google Gemini AI</p>
                      <p><strong>Fonction :</strong> Analyse automatique des photographies</p>
                      <p><strong>Éditeur :</strong> Google LLC</p>
                      <p><strong>Localisation :</strong> Centres de données Google (UE et international)</p>
                      <p><strong>Traitement :</strong> Images transmises temporairement, supprimées après analyse</p>
                    </div>
                  </div>

                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">💳 Paiements</h3>
                    <div className="text-text-gray space-y-2">
                      <p><strong>Processeur :</strong> Stripe, Inc.</p>
                      <p><strong>Adresse :</strong> 354 Oyster Point Blvd, South San Francisco, CA 94080, USA</p>
                      <p><strong>Certification :</strong> PCI-DSS niveau 1</p>
                      <p><strong>Fonction :</strong> Traitement sécurisé des paiements par carte</p>
                      <p><strong>Note :</strong> JudgeMyJPEG ne stocke jamais vos données bancaires</p>
                    </div>
                  </div>

                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">☁️ Stockage Images</h3>
                    <div className="text-text-gray space-y-2">
                      <p><strong>Service :</strong> Cloudinary Ltd.</p>
                      <p><strong>Adresse :</strong> 111 Buckingham Palace Rd, London SW1W 0SR, Royaume-Uni</p>
                      <p><strong>Fonction :</strong> Stockage et optimisation des images</p>
                      <p><strong>Localisation :</strong> Centres de données européens prioritaires</p>
                      <p><strong>Durée :</strong> Variable selon votre plan d'abonnement</p>
                    </div>
                  </div>

                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">🔐 Authentification</h3>
                    <div className="text-text-gray space-y-2">
                      <p><strong>Service :</strong> NextAuth.js avec Google OAuth</p>
                      <p><strong>Fonction :</strong> Connexion sécurisée via votre compte Google</p>
                      <p><strong>Données :</strong> Nom, email, photo de profil (optionnelle)</p>
                      <p><strong>Contrôle :</strong> Vous pouvez révoquer l'accès depuis votre compte Google</p>
                    </div>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">5. Propriété Intellectuelle</h2>
                <div className="text-text-gray space-y-4">
                  
                  <h3 className="text-lg font-semibold text-neon-pink">5.1 Contenus du site</h3>
                  <p>
                    L'ensemble des éléments constituant le site JudgeMyJPEG (textes, images, vidéos, logos, 
                    icônes, sons, logiciels, structure, graphismes, design) sont la propriété exclusive de 
                    l'éditeur ou font l'objet d'une autorisation d'utilisation.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-neon-pink">5.2 Marques et logos</h3>
                  <p>
                    "JudgeMyJPEG" et tous les logos associés sont des marques déposées ou en cours de dépôt. 
                    Toute reproduction non autorisée de ces marques constitue une contrefaçon.
                  </p>

                  <h3 className="text-lg font-semibold text-neon-pink">5.3 Contenus utilisateurs</h3>
                  <p>
                    Vous conservez tous les droits sur vos photographies. En les uploadant, vous accordez 
                    à JudgeMyJPEG une licence limitée pour les analyser et vous fournir le service. 
                    Cette licence prend fin avec la suppression de vos images.
                  </p>

                  <h3 className="text-lg font-semibold text-neon-pink">5.4 Analyses générées</h3>
                  <p>
                    Les analyses textuelles générées par notre IA vous appartiennent. Vous êtes libre de 
                    les utiliser, les partager ou les modifier. Cependant, la technologie et les algorithmes 
                    sous-jacents restent notre propriété exclusive.
                  </p>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">6. Droit Applicable</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Le site JudgeMyJPEG est soumis au droit français. 
                    Tout litige relatif à l'utilisation du site sera de la compétence exclusive des 
                    tribunaux français.
                  </p>
                  <p>
                    En cas de litige, une solution amiable sera recherchée en priorité. 
                    À défaut, les tribunaux de Paris seront seuls compétents.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">7. Médiateur de la Consommation</h2>
                <div className="bg-cosmic-glass p-6 rounded-lg">
                  <div className="text-text-gray space-y-3">
                    <p>
                      Conformément à l'article L.612-1 du Code de la consommation, nous vous informons 
                      que vous pouvez recourir gratuitement au service de médiation :
                    </p>
                    <div className="bg-neon-cyan/10 p-4 rounded border border-neon-cyan/30">
                      <p><strong>Médiateur :</strong> Médiateur de la consommation CNPM - MÉDIATION</p>
                      <p><strong>Adresse :</strong> 27 avenue de la libération, 42400 Saint-Chamond</p>
                      <p><strong>Site web :</strong> <a href="https://cnpm-mediation-consommation.eu" className="text-neon-cyan hover:underline" target="_blank" rel="noopener noreferrer">cnpm-mediation-consommation.eu</a></p>
                      <p><strong>Email :</strong> contact@cnpm-mediation-consommation.eu</p>
                    </div>
                    <p className="text-sm">
                      <strong>Conditions :</strong> Le recours au médiateur n'est possible qu'après avoir 
                      tenté une résolution amiable directe avec notre service client.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">8. Cookies et Technologies de Suivi</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Le site utilise des cookies pour améliorer votre expérience utilisateur et analyser 
                    notre trafic. Vous pouvez gérer vos préférences cookies à tout moment.
                  </p>
                  <p>
                    <strong>Pour plus d'informations :</strong> Consultez notre 
                    <a href="/legal/privacy" className="text-neon-cyan hover:underline ml-1">
                      Politique de Confidentialité
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">9. Signalement de Contenus</h2>
                <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-400 mb-3">🚨 Signaler un contenu inapproprié</h3>
                  <div className="text-text-gray space-y-3">
                    <p>
                      Conformément à la loi pour la confiance dans l'économie numérique, vous pouvez 
                      signaler tout contenu illicite hébergé sur notre plateforme.
                    </p>
                    <div className="space-y-2">
                      <p><strong>Email :</strong> abuse@judgemyjpeg.com</p>
                      <p><strong>Objet :</strong> Signalement de contenu - [Nature du problème]</p>
                      <p><strong>Informations à fournir :</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>URL du contenu concerné</li>
                        <li>Nature de l'infraction (diffamation, contrefaçon, etc.)</li>
                        <li>Vos coordonnées complètes</li>
                        <li>Justificatifs (si applicable)</li>
                      </ul>
                    </div>
                    <p className="text-sm text-yellow-400">
                      ⚠️ Tout signalement abusif peut faire l'objet de poursuites.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">10. Contact</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-cosmic-glass p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">📞 Support Utilisateurs</h3>
                    <div className="text-text-gray space-y-2">
                      <p><strong>Email :</strong> support@judgemyjpeg.com</p>
                      <p><strong>FAQ :</strong> <a href="/faq" className="text-neon-cyan hover:underline">Questions fréquentes</a></p>
                      <p><strong>Horaires :</strong> 9h-18h (jours ouvrés)</p>
                      <p><strong>Langue :</strong> Français, Anglais</p>
                    </div>
                  </div>
                  
                  <div className="bg-cosmic-glass p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">⚖️ Questions Légales</h3>
                    <div className="text-text-gray space-y-2">
                      <p><strong>Email :</strong> legal@judgemyjpeg.com</p>
                      <p><strong>Confidentialité :</strong> privacy@judgemyjpeg.com</p>
                      <p><strong>Signalements :</strong> abuse@judgemyjpeg.com</p>
                      <p><strong>Partenariats :</strong> business@judgemyjpeg.com</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Date de mise à jour */}
              <div className="text-center pt-8 border-t border-cosmic-glassborder">
                <p className="text-text-muted text-sm">
                  Mentions légales - Version 1.0
                  <br />
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                  <br />
                  Conforme au droit français et européen
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}