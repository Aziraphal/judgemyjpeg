import Head from 'next/head'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Conditions Générales d'Utilisation - JudgeMyJPEG</title>
        <meta name="description" content="Conditions générales d'utilisation de JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Conditions Générales d'Utilisation
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
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">1. Présentation du Service</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    JudgeMyJPEG est un service d'analyse automatique de photographies utilisant l'intelligence artificielle. 
                    Le service permet aux utilisateurs d'obtenir des évaluations techniques et artistiques de leurs images.
                  </p>
                  <p>
                    Le service est accessible via le site web jugmyjpeg.com et propose deux modes d'analyse :
                  </p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Mode Professionnel : analyse bienveillante et constructive</li>
                    <li>Mode Cassant : analyse humoristique et sarcastique (mais constructive)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">2. Acceptation des Conditions</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    En utilisant JudgeMyJPEG, vous acceptez pleinement et sans réserve les présentes Conditions Générales d'Utilisation.
                  </p>
                  <p>
                    Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">3. Utilisation du Service</h2>
                <div className="text-text-gray space-y-3">
                  <h3 className="text-lg font-semibold text-neon-pink">3.1 Conditions d'accès</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Vous devez être âgé d'au moins 16 ans pour utiliser le service</li>
                    <li>Un compte utilisateur est requis pour accéder aux fonctionnalités</li>
                    <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-neon-pink mt-6">3.2 Usage autorisé</h3>
                  <p>Le service est destiné à un usage personnel et/ou professionnel légitime :</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Analyse de photographies dont vous détenez les droits</li>
                    <li>Amélioration de vos compétences photographiques</li>
                    <li>Usage éducatif et professionnel</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">4. Restrictions d'Usage</h2>
                <div className="text-text-gray space-y-4">
                  <p><strong className="text-red-400">⚠️ AVERTISSEMENT :</strong> Le non-respect de ces restrictions entraîne la suspension immédiate du compte et peut faire l'objet de poursuites légales.</p>
                  
                  <h3 className="text-lg font-semibold text-neon-pink mt-6">🚫 Contenus strictement interdits</h3>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Nudité et contenu sexuel</strong> : Photos de nudité partielle ou totale, contenu érotique, pornographie</li>
                    <li><strong>Violence et gore</strong> : Scènes de violence, torture, blessures graphiques, cadavres, suicide</li>
                    <li><strong>Contenu illégal</strong> : Drogues, armes, activités criminelles, contrefaçons, fraude</li>
                    <li><strong>Harcèlement et haine</strong> : Contenu raciste, discriminatoire, incitation à la violence, harcèlement</li>
                    <li><strong>Mineurs en danger</strong> : Toute image compromettante de personnes mineures</li>
                    <li><strong>Vie privée</strong> : Photos prises sans consentement, surveillance illégale</li>
                    <li><strong>Propriété intellectuelle</strong> : Images protégées par des droits d'auteur sans autorisation</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-neon-pink mt-6">🔧 Restrictions techniques</h3>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Faire du reverse engineering de l'IA</li>
                    <li>Tenter de contourner les limitations (rate limiting, quotas)</li>
                    <li>Automatisation massive ou scraping</li>
                    <li>Surcharge intentionnelle des serveurs</li>
                    <li>Utilisation de proxies pour multiplier les comptes gratuits</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-neon-pink mt-6">⚖️ Détection automatique</h3>
                  <p>Notre système utilise l'OpenAI Moderation API et des algorithmes de détection pour identifier automatiquement les contenus interdits. Les violations sont enregistrées et peuvent entraîner :</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Suspension immédiate du compte (1er avertissement : 24h, 2ème : 7 jours, 3ème : définitive)</li>
                    <li>Signalement aux autorités compétentes (contenu illégal)</li>
                    <li>Conservation des logs à des fins légales (conformément à la loi française)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">5. Formules d'Abonnement</h2>
                <div className="text-text-gray space-y-3">
                  <h3 className="text-lg font-semibold text-neon-pink">5.1 Plan Gratuit</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>5 analyses par mois calendaire</li>
                    <li>Accès aux modes Pro et Cassant</li>
                    <li>Analyses en 6 langues</li>
                    <li>Collections personnelles</li>
                    <li>Support communautaire</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-neon-pink mt-6">5.2 Plan Premium (9,99€/mois)</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Analyses illimitées</li>
                    <li>Génération d'images partageables</li>
                    <li>Insights IA avancés et métriques</li>
                    <li>Export de données et historique complet</li>
                    <li>Collections illimitées et partage public</li>
                    <li>Authentification à deux facteurs</li>
                    <li>Support prioritaire</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-neon-pink mt-6">5.3 Plan Lifetime (99,99€ unique)</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Tous les avantages Premium à vie</li>
                    <li>Accès garanti aux futures fonctionnalités</li>
                    <li>Badge membre fondateur</li>
                    <li>Support VIP et accès anticipé aux nouveautés</li>
                    <li>Pas de renouvellement - paiement unique</li>
                  </ul>
                  
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>⚠️ Important :</strong> L'offre Lifetime est soumise à la continuité du service. 
                      En cas d'arrêt définitif de JudgeMyJPEG, un remboursement au prorata sera effectué.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">6. Paiements et Remboursements</h2>
                <div className="text-text-gray space-y-3">
                  <h3 className="text-lg font-semibold text-neon-pink">6.1 Modalités de paiement</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Paiements sécurisés via Stripe</li>
                    <li>Facturation mensuelle pour le plan Premium</li>
                    <li>Paiement unique pour le plan Lifetime</li>
                    <li>TVA incluse dans tous les prix affichés</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-neon-pink mt-6">6.2 Annulation et remboursement</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Annulation possible à tout moment depuis votre compte</li>
                    <li>Pas de remboursement au prorata (accès jusqu'à fin de période)</li>
                    <li>Remboursement intégral sous 14 jours pour les nouveaux abonnements</li>
                    <li>Plan Lifetime : remboursement sous 30 jours uniquement</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">7. Propriété Intellectuelle et Données</h2>
                <div className="text-text-gray space-y-3">
                  <h3 className="text-lg font-semibold text-neon-pink">7.1 Vos contenus</h3>
                  <p>
                    Vous conservez tous les droits sur les images que vous uploadez. 
                    Nous n'utilisons vos images que pour fournir le service d'analyse et améliorer nos algorithmes.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>Les images sont stockées de façon sécurisée et chiffrée</li>
                    <li>Suppression automatique après 30 jours d'inactivité</li>
                    <li>Aucun partage avec des tiers sans votre consentement explicite</li>
                    <li>Droit à l'effacement garanti (RGPD)</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-neon-pink mt-6">7.2 Analyses générées par IA</h3>
                  <p>
                    Les analyses générées par notre IA vous appartiennent et peuvent être :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Sauvegardées dans votre compte</li>
                    <li>Exportées au format JSON ou PDF</li>
                    <li>Partagées publiquement (avec votre autorisation)</li>
                    <li>Utilisées à des fins commerciales (pour les plans payants)</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-neon-pink mt-6">7.3 Notre technologie</h3>
                  <p>
                    La technologie JudgeMyJPEG, incluant nos algorithmes d'IA, le code source, 
                    les modèles et l'infrastructure, reste notre propriété intellectuelle exclusive.
                  </p>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                    <p className="text-blue-300 text-sm">
                      <strong>🤖 IA Responsable :</strong> Nos analyses sont générées par intelligence artificielle. 
                      Bien que nous nous efforcions d'assurer la qualité, les évaluations peuvent être subjectives 
                      et ne constituent pas des conseils professionnels définitifs.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">8. Limitation de Responsabilité</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    <strong>JudgeMyJPEG est fourni "en l'état" sans garantie d'aucune sorte.</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Les analyses sont générées par IA et peuvent contenir des erreurs</li>
                    <li>Nous ne garantissons pas la précision des évaluations</li>
                    <li>Nous ne sommes pas responsables des décisions prises sur la base de nos analyses</li>
                    <li>Notre responsabilité est limitée au montant payé pour le service</li>
                    <li>Nous ne garantissons pas une disponibilité 100% du service</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">9. Suspension et Résiliation</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Nous nous réservons le droit de suspendre ou résilier votre accès en cas de :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Violation des présentes conditions</li>
                    <li>Usage abusif du service</li>
                    <li>Non-paiement des frais d'abonnement</li>
                    <li>Activité suspecte ou frauduleuse</li>
                  </ul>
                  <p>
                    Vous pouvez supprimer votre compte à tout moment depuis les paramètres.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">10. Modifications des Conditions</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Nous pouvons modifier ces conditions à tout moment. Les modifications importantes 
                    vous seront notifiées par email ou via l'interface du service.
                  </p>
                  <p>
                    La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">11. Droit Applicable et Juridictions</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Les présentes conditions sont régies par le droit français.
                  </p>
                  <p>
                    Tout litige relatif à l'utilisation du service sera soumis aux tribunaux compétents de La Roche-sur-Yon (Vendée).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">12. Contact</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Pour toute question concernant ces conditions d'utilisation :
                  </p>
                  <ul className="list-none space-y-1">
                    <li><strong>Email :</strong> contact.judgemyjpeg@gmail.com</li>
                    <li><strong>Support :</strong> contact.judgemyjpeg@gmail.com</li>
                    <li><strong>Adresse :</strong> 9 Allée de la Meilleraie, 85340 Les Sables-d'Olonne, France</li>
                  </ul>
                </div>
              </section>

              {/* Date de mise à jour */}
              <div className="text-center pt-8 border-t border-cosmic-glassborder">
                <p className="text-text-muted text-sm">
                  Conditions générales d'utilisation - Version 1.0
                  <br />
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}