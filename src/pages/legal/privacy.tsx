import Head from 'next/head'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Politique de Confidentialité - JudgeMyJPEG</title>
        <meta name="description" content="Politique de confidentialité et protection des données de JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Politique de Confidentialité
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
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">1. Introduction</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    JudgeMyJPEG s'engage à protéger votre vie privée et vos données personnelles. 
                    Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                    conformément au Règlement Général sur la Protection des Données (RGPD).
                  </p>
                  <p>
                    En utilisant notre service, vous consentez aux pratiques décrites dans cette politique.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">2. Responsable du Traitement</h2>
                <div className="text-text-gray space-y-3">
                  <p><strong>Responsable :</strong> Cyril Paquier (CodeCraft Plus)</p>
                  <p><strong>Adresse :</strong> 9 Allée de la Meilleraie, 85340 Les Sables-d'Olonne, France</p>
                  <p><strong>Email :</strong> contact@judgemyjpeg.com</p>
                  <p><strong>Contact :</strong> contact@judgemyjpeg.com</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">3. Données Collectées</h2>
                <div className="text-text-gray space-y-6">
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">3.1 Données d'identification</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Nom et prénom (via Google OAuth ou inscription manuelle)</li>
                      <li>Adresse email</li>
                      <li>Photo de profil (optionnelle, via Google)</li>
                      <li>Identifiant unique de compte</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">3.2 Données d'utilisation</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Images uploadées pour analyse</li>
                      <li>Analyses IA générées</li>
                      <li>Préférences (langue, mode d'analyse)</li>
                      <li>Historique des analyses</li>
                      <li>Collections créées</li>
                      <li>Statistiques d'usage (nombre d'analyses, fréquence)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">3.3 Données techniques</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Adresse IP</li>
                      <li>Type de navigateur et système d'exploitation</li>
                      <li>Pages visitées et temps passé</li>
                      <li>Données de géolocalisation approximative (ville)</li>
                      <li>Cookies et identifiants de session</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">3.4 Données de paiement</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Informations de facturation (traitées par Stripe)</li>
                      <li>Historique des transactions</li>
                      <li>Statut d'abonnement</li>
                    </ul>
                    <p className="text-sm text-neon-cyan mt-2">
                      ⚠️ Nous ne stockons jamais vos données bancaires complètes
                    </p>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">4. Finalités du Traitement</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-2">4.1 Fourniture du service</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Analyse IA de vos photographies</li>
                      <li>Génération de rapports personnalisés</li>
                      <li>Sauvegarde de votre historique</li>
                      <li>Création de collections</li>
                    </ul>
                    <p className="text-sm text-neon-cyan mt-1">
                      <strong>Base légale :</strong> Exécution du contrat
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-2">4.2 Gestion des comptes</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Création et authentification</li>
                      <li>Support client</li>
                      <li>Communications importantes</li>
                    </ul>
                    <p className="text-sm text-neon-cyan mt-1">
                      <strong>Base légale :</strong> Intérêt légitime
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-2">4.3 Facturation et paiements</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Traitement des abonnements</li>
                      <li>Émission de factures</li>
                      <li>Prévention de la fraude</li>
                    </ul>
                    <p className="text-sm text-neon-cyan mt-1">
                      <strong>Base légale :</strong> Obligation légale et exécution du contrat
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-2">4.4 Amélioration du service</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Analyse des performances</li>
                      <li>Détection de bugs</li>
                      <li>Optimisation de l'IA</li>
                    </ul>
                    <p className="text-sm text-neon-cyan mt-1">
                      <strong>Base légale :</strong> Intérêt légitime
                    </p>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">5. Partage des Données</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">5.1 Partenaires technologiques</h3>
                    
                    <div className="bg-cosmic-glass p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-neon-cyan mb-2">Google Gemini AI</h4>
                      <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                        <li>Vos images sont transmises pour analyse IA</li>
                        <li>Données supprimées après traitement</li>
                        <li>Localisation : Centres de données Google (UE/US)</li>
                        <li>Protection : Chiffrement en transit et au repos</li>
                      </ul>
                    </div>

                    <div className="bg-cosmic-glass p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-neon-cyan mb-2">Cloudinary (Stockage images)</h4>
                      <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                        <li>Stockage sécurisé de vos images</li>
                        <li>Optimisation et transformation d'images</li>
                        <li>Localisation : Centres de données européens</li>
                        <li>Durée : Suppression automatique après 90 jours</li>
                      </ul>
                    </div>

                    <div className="bg-cosmic-glass p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-neon-cyan mb-2">Stripe (Paiements)</h4>
                      <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                        <li>Traitement sécurisé des paiements</li>
                        <li>Données de facturation uniquement</li>
                        <li>Conformité PCI-DSS niveau 1</li>
                        <li>Nous ne stockons jamais vos données bancaires</li>
                      </ul>
                    </div>

                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">5.2 Transferts hors UE</h3>
                    <p>
                      Certains de nos partenaires (Google, Stripe) peuvent traiter vos données hors UE. 
                      Ces transferts sont encadrés par :
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Clauses contractuelles types de la Commission européenne</li>
                      <li>Décisions d'adéquation (quand disponibles)</li>
                      <li>Mesures de sécurité supplémentaires</li>
                    </ul>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">6. Durée de Conservation</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div className="bg-cosmic-glass p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">Durées par type de données</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-neon-cyan mb-2">Images uploadées</h4>
                        <ul className="space-y-1">
                          <li>• Plan gratuit : 30 jours</li>
                          <li>• Plan premium : 1 an</li>
                          <li>• Plan lifetime : Illimité</li>
                          <li>• Suppression manuelle possible</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neon-cyan mb-2">Analyses générées</h4>
                        <ul className="space-y-1">
                          <li>• Conservées tant que le compte existe</li>
                          <li>• Suppression avec le compte</li>
                          <li>• Export possible avant suppression</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neon-cyan mb-2">Données de compte</h4>
                        <ul className="space-y-1">
                          <li>• Pendant la durée d'utilisation</li>
                          <li>• 3 ans après dernière connexion</li>
                          <li>• Suppression sur demande</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neon-cyan mb-2">Données de facturation</h4>
                        <ul className="space-y-1">
                          <li>• 10 ans (obligation légale)</li>
                          <li>• Données minimales uniquement</li>
                          <li>• Archivage sécurisé</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">7. Vos Droits RGPD</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">7.1 Droits d'accès et de rectification</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Consulter vos données personnelles</li>
                        <li>Corriger les informations inexactes</li>
                        <li>Compléter les données incomplètes</li>
                        <li><strong>Délai :</strong> 1 mois maximum</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">7.2 Droit à l'effacement</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Suppression de vos données</li>
                        <li>Sauf obligation légale de conservation</li>
                        <li>Suppression de compte disponible</li>
                        <li><strong>Action :</strong> Paramètres → Supprimer le compte</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">7.3 Droit à la portabilité</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Export de vos données en JSON</li>
                        <li>Analyses et statistiques incluses</li>
                        <li>Format standard réutilisable</li>
                        <li><strong>Accès :</strong> Dashboard → Exporter données</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">7.4 Droit d'opposition</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Opposition au traitement</li>
                        <li>Retrait du consentement</li>
                        <li>Arrêt des communications</li>
                        <li><strong>Contact :</strong> contact@judgemyjpeg.com</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-neon-cyan/10 p-4 rounded-lg border border-neon-cyan/30 mt-6">
                    <h4 className="font-semibold text-neon-cyan mb-2">🛡️ Comment exercer vos droits ?</h4>
                    <p className="text-sm">
                      <strong>Email :</strong> contact@judgemyjpeg.com<br/>
                      <strong>Objet :</strong> Exercice de mes droits RGPD<br/>
                      <strong>Pièces :</strong> Copie pièce d'identité (pour vérification)<br/>
                      <strong>Réponse :</strong> Sous 1 mois (2 mois si complexe)
                    </p>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">8. Sécurité des Données</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">8.1 Mesures techniques</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Chiffrement HTTPS/TLS pour tous les échanges</li>
                      <li>Chiffrement des données sensibles au repos</li>
                      <li>Authentification à deux facteurs disponible</li>
                      <li>Sessions sécurisées avec timeout automatique</li>
                      <li>Monitoring des accès et tentatives d'intrusion</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neon-pink mb-3">8.2 Mesures organisationnelles</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Accès aux données strictement limité</li>
                      <li>Formation du personnel à la sécurité</li>
                      <li>Procédures de sauvegarde régulières</li>
                      <li>Plan de réponse aux incidents</li>
                      <li>Audits de sécurité périodiques</li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                    <h4 className="font-semibold text-red-400 mb-2">🚨 En cas de violation de données</h4>
                    <p className="text-sm">
                      Nous nous engageons à vous notifier sous 72h en cas de violation 
                      de données personnelles présentant un risque élevé pour vos droits et libertés.
                    </p>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">9. Cookies et Technologies Similaires</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-cosmic-glass p-4 rounded-lg">
                      <h4 className="font-semibold text-neon-cyan mb-2">🍪 Cookies essentiels</h4>
                      <p className="text-xs mb-2">Indispensables au fonctionnement</p>
                      <ul className="text-xs space-y-1">
                        <li>• Session utilisateur</li>
                        <li>• Authentification</li>
                        <li>• Panier d'achat</li>
                        <li>• Sécurité CSRF</li>
                      </ul>
                      <p className="text-xs text-neon-pink mt-2">Pas de consentement requis</p>
                    </div>

                    <div className="bg-cosmic-glass p-4 rounded-lg">
                      <h4 className="font-semibold text-neon-cyan mb-2">📊 Cookies analytiques</h4>
                      <p className="text-xs mb-2">Mesure d'audience anonyme</p>
                      <ul className="text-xs space-y-1">
                        <li>• Google Analytics</li>
                        <li>• Pages visitées</li>
                        <li>• Temps de session</li>
                        <li>• Données agrégées</li>
                      </ul>
                      <p className="text-xs text-neon-pink mt-2">Consentement requis</p>
                    </div>

                    <div className="bg-cosmic-glass p-4 rounded-lg">
                      <h4 className="font-semibold text-neon-cyan mb-2">🎯 Cookies marketing</h4>
                      <p className="text-xs mb-2">Personnalisation des contenus</p>
                      <ul className="text-xs space-y-1">
                        <li>• Publicités ciblées</li>
                        <li>• Réseaux sociaux</li>
                        <li>• Retargeting</li>
                        <li>• A/B testing</li>
                      </ul>
                      <p className="text-xs text-neon-pink mt-2">Consentement requis</p>
                    </div>
                  </div>

                  <div className="bg-neon-pink/10 p-4 rounded-lg border border-neon-pink/30 mt-6">
                    <h4 className="font-semibold text-neon-pink mb-2">⚙️ Gérer vos préférences cookies</h4>
                    <p className="text-sm">
                      Vous pouvez modifier vos préférences cookies à tout moment via :<br/>
                      • Le bandeau de consentement (première visite)<br/>
                      • Paramètres → Préférences cookies<br/>
                      • Votre navigateur (suppression manuelle)
                    </p>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">10. Données des Mineurs</h2>
                <div className="text-text-gray space-y-3">
                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                    <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Restrictions d'âge</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Service réservé aux 16 ans et plus</li>
                      <li>• Vérification de l'âge lors de l'inscription</li>
                      <li>• Suppression immédiate des comptes de mineurs détectés</li>
                      <li>• Contact parents : contact@judgemyjpeg.com</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">11. Modifications de la Politique</h2>
                <div className="text-text-gray space-y-3">
                  <p>
                    Nous pouvons modifier cette politique de confidentialité pour refléter :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>L'évolution de notre service</li>
                    <li>Les changements réglementaires</li>
                    <li>L'amélioration de nos pratiques</li>
                  </ul>
                  <p>
                    <strong>Notification :</strong> Les modifications importantes vous seront notifiées par email 
                    30 jours avant leur entrée en vigueur.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-neon-cyan mb-4">12. Contact et Réclamations</h2>
                <div className="text-text-gray space-y-4">
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">📧 Nous contacter</h3>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Questions générales :</strong><br/>contact@judgemyjpeg.com</li>
                        <li><strong>Exercice des droits :</strong><br/>contact@judgemyjpeg.com</li>
                        <li><strong>Signalement incident :</strong><br/>contact@judgemyjpeg.com</li>
                        <li><strong>Adresse postale :</strong><br/>[Votre adresse complète]</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-3">⚖️ Réclamations</h3>
                      <div className="space-y-3 text-sm">
                        <p>
                          Si vous n'êtes pas satisfait de nos réponses, vous pouvez saisir :
                        </p>
                        <div className="bg-cosmic-glass p-3 rounded">
                          <p><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
                          <p>3 Place de Fontenoy - TSA 80715</p>
                          <p>75334 PARIS CEDEX 07</p>
                          <p>Tél : 01 53 73 22 22</p>
                          <p><a href="https://www.cnil.fr" className="text-neon-cyan hover:underline">www.cnil.fr</a></p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Date de mise à jour */}
              <div className="text-center pt-8 border-t border-cosmic-glassborder">
                <p className="text-text-muted text-sm">
                  Politique de confidentialité - Version 1.0
                  <br />
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                  <br />
                  Conforme au RGPD (Règlement UE 2016/679)
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}