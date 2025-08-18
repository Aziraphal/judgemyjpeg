import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  important?: boolean
  tags?: string[]
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const faqData: FAQItem[] = [
    // Général
    {
      id: '1',
      category: 'general',
      question: 'Qu\'est-ce que JudgeMyJPEG ?',
      answer: 'JudgeMyJPEG est un service d\'analyse photographique utilisant une IA avancée. Il évalue vos photos selon des critères techniques (composition, éclairage, netteté) et artistiques (créativité, émotion) puis vous donne un score sur 100 avec des conseils personnalisés.'
    },
    {
      id: '2', 
      category: 'general',
      question: 'Comment fonctionne l\'analyse IA ?',
      answer: 'Notre IA utilise OpenAI o3-mini, un modèle de vision avancé, pour analyser votre photo selon plusieurs critères : composition (règle des tiers, lignes directrices), qualité technique (exposition, netteté, couleurs), impact artistique (créativité, émotion, storytelling). Elle vous donne un score objectif et des conseils précis.',
      important: true
    },
    {
      id: '3',
      category: 'general', 
      question: 'Quelle est la différence entre les modes Pro et Cassant ?',
      answer: 'Le mode Professionnel donne une analyse bienveillante et constructive, tandis que le mode Cassant utilise un ton humoristique et sarcastique. IMPORTANT : Le score reste identique dans les deux modes, seule la formulation change. L\'évaluation technique est strictement la même.'
    },

    // Technique
    {
      id: '4',
      category: 'technical',
      question: 'Quels formats de fichiers sont acceptés ?',
      answer: 'Nous acceptons les formats JPG, JPEG, PNG et WebP. Taille maximum : 10 MB par image. Pour de meilleurs résultats, utilisez des images en haute résolution (minimum 1000x1000 pixels).'
    },
    {
      id: '5',
      category: 'technical',
      question: 'Pourquoi mon analyse semble incorrecte ?',
      answer: 'L\'IA peut parfois se tromper car elle analyse selon des critères standards. Si l\'analyse ne correspond pas à votre vision artistique, c\'est normal ! L\'art est subjectif. Utilisez les conseils comme suggestions, pas comme vérité absolue. Vous pouvez réanalyser avec un autre mode ou dans une autre langue.'
    },
    {
      id: '6',
      category: 'technical',
      question: 'L\'upload de ma photo échoue, que faire ?',
      answer: 'Vérifiez : 1) Taille < 10MB, 2) Format accepté (JPG/PNG/WebP), 3) Connexion internet stable. Si le problème persiste, essayez de redimensionner votre image ou contactez le support.'
    },
    {
      id: '7',
      category: 'technical',
      question: 'Puis-je analyser des photos floues ou très sombres ?',
      answer: 'Oui, l\'IA analysera toutes vos photos. Pour les images floues/sombres, elle vous donnera des conseils spécifiques d\'amélioration (netteté, exposition). C\'est même utile pour comprendre comment corriger ces problèmes !'
    },

    // Abonnements
    {
      id: '8',
      category: 'subscription',
      question: 'Combien d\'analyses ai-je avec le plan gratuit ?',
      answer: '3 analyses par mois calendaire. Le compteur se remet à zéro le 1er de chaque mois. Vous gardez accès à toutes vos analyses passées même après avoir atteint la limite.',
      important: true
    },
    {
      id: '9',
      category: 'subscription', 
      question: 'Que se passe-t-il si j\'annule mon abonnement Premium ?',
      answer: 'Vous gardez l\'accès Premium jusqu\'à la fin de votre période payée, puis vous repassez au plan gratuit. Toutes vos analyses et collections restent accessibles. Vous pouvez vous réabonner à tout moment.'
    },
    {
      id: '10',
      category: 'subscription',
      question: 'Puis-je passer du plan mensuel au plan Lifetime ?',
      answer: 'Oui ! Contactez le support avec votre demande. Nous calculons au prorata et vous facturons la différence. Le plan Lifetime inclut toutes les futures fonctionnalités sans surcoût.'
    },
    {
      id: '11',
      category: 'subscription',
      question: 'Y a-t-il des remboursements ?',
      answer: 'Remboursement intégral sous 14 jours pour les nouveaux abonnements. Plan Lifetime : remboursement sous 30 jours. Pas de remboursement au prorata en cours de mois. Annulation possible à tout moment.'
    },

    // Confidentialité
    {
      id: '12',
      category: 'privacy',
      question: 'Que faites-vous de mes photos ?',
      answer: 'Vos photos sont temporairement envoyées à notre service d\'IA pour analyse, puis supprimées des serveurs. Chez nous : 30 jours (gratuit), 1 an (premium), illimité (lifetime). Vous pouvez supprimer vos photos à tout moment. Nous ne les utilisons JAMAIS à d\'autres fins.',
      important: true
    },
    {
      id: '13',
      category: 'privacy',
      question: 'Mes photos sont-elles publiques ?',
      answer: 'NON. Vos photos sont strictement privées et visibles par vous seul. Elles ne sont jamais partagées, vendues ou utilisées pour entraîner d\'autres IA. Le partage social ne partage que le texte d\'analyse, jamais l\'image.'
    },
    {
      id: '14',
      category: 'privacy',
      question: 'Puis-je supprimer mes données ?',
      answer: 'Oui, à tout moment : 1) Suppression d\'images individuelles dans vos collections, 2) Suppression complète du compte dans Paramètres → Supprimer le compte. Export de données disponible avant suppression.'
    },

    // Utilisation
    {
      id: '15',
      category: 'usage',
      question: 'Comment améliorer le score de mes photos ?',
      answer: 'Suivez les conseils spécifiques de l\'IA : travaillez la composition (règle des tiers), améliorez l\'éclairage, soignez la netteté. Utilisez les liens vers Lightroom/Photoshop/Snapseed fournis. Réanalysez après retouche pour voir votre progression !'
    },
    {
      id: '16',
      category: 'usage',
      question: 'Puis-je analyser des photos de personnes ?',
      answer: 'Oui, mais uniquement si vous avez l\'autorisation des personnes photographiées. L\'IA analysera la technique (cadrage, éclairage) sans identifier les personnes. Respectez la vie privée et le droit à l\'image.'
    },
    {
      id: '17',
      category: 'usage',
      question: 'Comment créer des images partageables pour Instagram ?',
      answer: 'Fonctionnalité Premium uniquement. Après analyse, cliquez sur "Générer image Story". L\'IA crée automatiquement une image optimisée pour Instagram/Facebook avec votre score et un aperçu de l\'analyse. Format Stories et post disponibles.'
    },

    // Problèmes fréquents
    {
      id: '18',
      category: 'troubleshooting',
      question: 'L\'analyse prend trop de temps',
      answer: 'L\'analyse prend normalement 10-30 secondes. Si c\'est plus long : 1) Vérifiez votre connexion, 2) Réduisez la taille de l\'image, 3) Rechargez la page. Aux heures de pointe, cela peut prendre jusqu\'à 1 minute.'
    },
    {
      id: '19',
      category: 'troubleshooting', 
      question: 'Je ne reçois pas les emails de confirmation',
      answer: 'Vérifiez vos spams/indésirables. Ajoutez contact.judgemyjpeg@gmail.com à vos contacts. Si le problème persiste, contactez-nous avec votre adresse email exacte.'
    },
    {
      id: '20',
      category: 'troubleshooting',
      question: 'Mon paiement a échoué',
      answer: 'Vérifiez : carte valide, fonds suffisants, paiements internationaux autorisés. Stripe (notre processeur) bloque parfois les paiements suspects. Contactez votre banque ou essayez une autre carte. Support disponible 24/7.',
      tags: ['paiement', 'stripe', 'problème']
    },

    // PWA & Mobile (nouvelles questions 2025)
    {
      id: '21',
      category: 'mobile',
      question: 'Puis-je installer JudgeMyJPEG comme une app sur mon téléphone ?',
      answer: 'Oui ! JudgeMyJPEG est une PWA (Progressive Web App). Sur Android/Desktop : cliquez sur "Installer" dans le navigateur. Sur iOS Safari : Bouton Partager → "Ajouter à l\'écran d\'accueil". Vous aurez alors un accès direct depuis votre bureau avec mode hors ligne.',
      important: true,
      tags: ['pwa', 'installation', 'mobile', 'app']
    },
    {
      id: '22',
      category: 'mobile',
      question: 'Que se passe-t-il si j\'utilise l\'app hors ligne ?',
      answer: 'Mode PWA hors ligne : vous pouvez naviguer dans vos analyses précédentes, préparer des photos pour analyse (elles seront traitées automatiquement au retour en ligne), et modifier vos préférences. Vous recevez une notification quand vos analyses en attente sont terminées.',
      tags: ['offline', 'pwa', 'hors ligne', 'cache']
    },
    {
      id: '23',
      category: 'mobile',
      question: 'Comment activer les notifications push ?',
      answer: 'Les notifications se configurent automatiquement après installation de la PWA. Lors de votre première analyse, acceptez les notifications. Vous serez alerté quand vos analyses hors ligne sont terminées. Gérer dans : Paramètres téléphone → JudgeMyJPEG → Notifications.',
      tags: ['notifications', 'push', 'alertes', 'pwa']
    },

    // Sécurité avancée (nouvelles questions 2025)
    {
      id: '24',
      category: 'security',
      question: 'JudgeMyJPEG est-il sécurisé ? Quelles sont vos mesures de protection ?',
      answer: 'Sécurité renforcée 2025 : chiffrement HTTPS/TLS, 2FA obligatoire Premium, sessions sécurisées, monitoring anti-intrusion, conformité RGPD complète, données bancaires JAMAIS stockées (Stripe PCI-DSS niveau 1), audits sécurité réguliers.',
      important: true,
      tags: ['sécurité', '2fa', 'chiffrement', 'rgpd']
    },
    {
      id: '25', 
      category: 'security',
      question: 'Qu\'est-ce que l\'authentification à deux facteurs (2FA) ?',
      answer: 'La 2FA ajoute une couche de sécurité : après votre mot de passe, vous devez confirmer via app mobile (Google Authenticator) ou SMS. Obligatoire pour les comptes Premium. Active dans Paramètres → Sécurité → Configurer 2FA. Protège même si votre mot de passe est compromis.',
      tags: ['2fa', 'sécurité', 'authenticator', 'protection']
    },
    
    // Accessibilité (nouvelles questions 2025)
    {
      id: '26',
      category: 'accessibility',
      question: 'JudgeMyJPEG est-il accessible aux personnes handicapées ?',
      answer: 'Totalement ! Conformité WCAG 2.1 AA : navigation clavier complète, lecteurs d\'écran compatibles, contrastes élevés, taille de police ajustable, skip links, messages d\'erreur accessibles. Panneau d\'accessibilité en haut à droite.',
      tags: ['accessibilité', 'wcag', 'handicap', 'lecteur écran']
    },
    {
      id: '27',
      category: 'accessibility', 
      question: 'Comment ajuster l\'interface pour mieux voir ?',
      answer: 'Options d\'accessibilité (panneau en haut à droite) : Mode contraste élevé, 3 tailles de police (A/A+/A++), réduction des mouvements. Compatible avec les réglages de votre système (préférences d\'accessibilité). Toutes les modifications sont sauvegardées.',
      tags: ['contraste', 'police', 'vision', 'accessibilité']
    },

    // Juridique et conformité (nouvelles questions 2025)
    {
      id: '28',
      category: 'legal',
      question: 'JudgeMyJPEG respecte-t-il le RGPD et mes droits ?',
      answer: 'Conformité RGPD 2025 complète : consentement explicite cookies, droit à l\'effacement (suppression compte), portabilité des données (export JSON/PDF), transparence totale sur l\'usage. Contact : contact.judgemyjpeg@gmail.com. Possibilité de saisine CNIL.',
      important: true,
      tags: ['rgpd', 'droits', 'données', 'conformité']
    },
    {
      id: '29',
      category: 'legal',
      question: 'Puis-je utiliser JudgeMyJPEG à des fins commerciales ?',
      answer: 'Oui pour les plans payants ! Premium/Lifetime : usage commercial autorisé, analyses pour clients, intégration en agence photo. Plan gratuit : usage personnel uniquement. Les analyses générées vous appartiennent. Consultez nos CGU pour les détails.',
      tags: ['commercial', 'professionnel', 'licence', 'usage']
    },

    // Nouvelles questions - Modération et sécurité
    {
      id: '30',
      category: 'security',
      question: 'Quels types de photos sont interdites ?',
      answer: 'Pour votre sécurité et respecter les lois : nudité, contenu sexuel, violence, gore, contenu illégal (drogues, armes), harcèlement, discrimination, photos prises sans consentement. Notre système détecte automatiquement ces contenus via OpenAI Moderation API.',
      important: true,
      tags: ['modération', 'interdit', 'sécurité', 'contenu']
    },
    {
      id: '31',
      category: 'security',
      question: 'Que se passe-t-il si j\'uploade un contenu interdit ?',
      answer: 'Le contenu est automatiquement bloqué avant analyse. 1er avertissement : 24h de suspension. 2ème : 7 jours. 3ème : suspension définitive. Contenu illégal = signalement aux autorités + conservation des logs (loi française).',
      important: true,
      tags: ['sanctions', 'suspension', 'modération', 'avertissement']
    },
    {
      id: '32',
      category: 'security',
      question: 'Comment signaler un contenu inapproprié ?',
      answer: 'Bouton "Signaler" sur chaque photo dans les galeries. 8 catégories : nudité, violence, haine, contenu illégal, harcèlement, vie privée, spam, autre. Limite : 10 signalements/jour pour éviter les abus. Signalements traités sous 24h.',
      tags: ['signalement', 'report', 'inapproprié', 'modération']
    },
    {
      id: '33',
      category: 'technical',
      question: 'Pourquoi mon analyse est-elle bloquée ?',
      answer: 'Causes possibles : nom de fichier suspect, dimensions d\'image anormales (trop petites/ratios extrêmes), métadonnées EXIF suspectes, contenu détecté par l\'IA de modération. Renommez votre fichier et réessayez.',
      tags: ['bloqué', 'erreur', 'modération', 'fichier']
    },
    {
      id: '34',
      category: 'features',
      question: 'Nouveautés 2025 : quoi de neuf ?',
      answer: 'Collections automatiques "Top Photos" (score ≥85), bouton "Nouvelle analyse" sur mobile, options avancées masquées par défaut sur mobile, page d\'erreur avec retry automatique, modération renforcée, contenu marketing avec guides gratuits.',
      tags: ['nouveautés', '2025', 'fonctionnalités', 'mobile']
    },
    {
      id: '35',
      category: 'features',
      question: 'Qu\'est-ce que la collection "Top Photos" ?',
      answer: 'Collection automatique créée pour chaque utilisateur. Les photos avec un score ≥85 y sont ajoutées automatiquement. Accessible via le dashboard, permet de retrouver facilement vos meilleures réussites photographiques.',
      tags: ['collection', 'top photos', 'automatique', 'score']
    },
    {
      id: '36',
      category: 'mobile',
      question: 'Interface mobile améliorée : quels changements ?',
      answer: 'Options avancées (langue, tutorial) masquées par défaut - accessible via bouton ⚙️. Bouton "Analyser une nouvelle photo" après chaque résultat. Scroll automatique vers l\'upload. Interface épurée pour une expérience mobile optimale.',
      tags: ['mobile', 'UX', 'interface', 'amélioration']
    },
    {
      id: '37',
      category: 'troubleshooting',
      question: 'Erreur serveur : que faire ?',
      answer: 'Page d\'erreur 500 avec retry automatique. Testez votre connexion, videz le cache navigateur, attendez 5 minutes max. Bouton "Réessayer" vérifie la connectivité. Si persistant : contactez le support via le formulaire.',
      tags: ['erreur', 'serveur', '500', 'retry', 'panne']
    },
    {
      id: '38',
      category: 'content',
      question: 'Guides gratuits et ressources : où les trouver ?',
      answer: 'Page /ressources avec guides PDF téléchargeables : "10 Erreurs IA détecte", "Checklist Instagram", "Formation Score IA". Presets Lightroom gratuits. Templates email pour partenariats. Contenu mis à jour régulièrement.',
      tags: ['guides', 'gratuit', 'ressources', 'pdf', 'lightroom']
    }
  ]

  const categories = [
    { id: 'all', name: 'Toutes', icon: '📋' },
    { id: 'general', name: 'Général', icon: '🎯' },
    { id: 'technical', name: 'Technique', icon: '⚙️' },
    { id: 'subscription', name: 'Abonnements', icon: '💎' },
    { id: 'mobile', name: 'Mobile/PWA', icon: '📱' },
    { id: 'security', name: 'Sécurité', icon: '🔒' },
    { id: 'accessibility', name: 'Accessibilité', icon: '♿' },
    { id: 'legal', name: 'Juridique', icon: '⚖️' },
    { id: 'privacy', name: 'Confidentialité', icon: '🔐' },
    { id: 'usage', name: 'Utilisation', icon: '📸' },
    { id: 'features', name: 'Fonctionnalités', icon: '✨' },
    { id: 'content', name: 'Ressources', icon: '📚' },
    { id: 'troubleshooting', name: 'Problèmes', icon: '🔧' }
  ]

  // Filtrer selon catégorie et recherche
  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    
    return matchesCategory && matchesSearch
  })

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // Ouvrir/fermer tout
  const toggleAll = () => {
    if (openItems.length === filteredFAQ.length) {
      setOpenItems([])
    } else {
      setOpenItems(filteredFAQ.map(item => item.id))
    }
  }

  return (
    <>
      <Head>
        <title>FAQ - Questions Fréquentes - JudgeMyJPEG</title>
        <meta name="description" content="Réponses aux questions les plus fréquentes sur JudgeMyJPEG" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4" aria-hidden="true">❓</div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Questions Fréquentes
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              Toutes les réponses à vos questions sur JudgeMyJPEG - Version 2025 mise à jour
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <label htmlFor="faq-search" className="sr-only">
                Rechercher dans la FAQ
              </label>
              <input
                id="faq-search"
                type="text"
                placeholder="Rechercher une question... (ex: PWA, paiement, sécurité)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-cosmic-glass/50 backdrop-blur-sm border border-cosmic-glassborder rounded-full text-text-white placeholder-text-muted focus-visible"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Tapez des mots-clés pour filtrer les questions
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted" aria-hidden="true">
                🔍
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-text-muted">
                {filteredFAQ.length} question{filteredFAQ.length > 1 ? 's' : ''} trouvée{filteredFAQ.length > 1 ? 's' : ''}
                {searchQuery && ` pour "${searchQuery}"`}
              </p>
            </div>
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

          <div className="max-w-6xl mx-auto">
            
            {/* Filtres par catégorie */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                        : 'bg-cosmic-glass border border-cosmic-glassborder text-text-gray hover:border-neon-cyan/50 hover:text-text-white'
                    }`}
                    aria-pressed={selectedCategory === category.id}
                    aria-label={`Filtrer par catégorie ${category.name}`}
                  >
                    <span aria-hidden="true">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Actions rapides */}
              <div className="text-center">
                <button
                  onClick={toggleAll}
                  className="text-sm text-text-muted hover:text-neon-cyan transition-colors focus-visible mr-4"
                  aria-label={openItems.length === filteredFAQ.length ? 'Fermer toutes les sections' : 'Ouvrir toutes les sections'}
                >
                  {openItems.length === filteredFAQ.length ? '📝 Fermer tout' : '📖 Ouvrir tout'}
                </button>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-text-muted hover:text-neon-cyan transition-colors focus-visible"
                  >
                    ✖️ Effacer recherche
                  </button>
                )}
              </div>
            </div>

            {/* Questions importantes en haut */}
            {selectedCategory === 'all' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-neon-pink mb-6 text-center">⭐ Questions Essentielles</h2>
                <div className="space-y-4">
                  {faqData.filter(item => item.important).map(item => (
                    <div key={item.id} className="glass-card border border-neon-pink/30">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-6 text-left flex justify-between items-center hover:bg-neon-pink/5 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-neon-pink text-xl">❓</span>
                          <h3 className="text-lg font-semibold text-text-white">{item.question}</h3>
                        </div>
                        <span className={`text-neon-pink text-xl transition-transform ${
                          openItems.includes(item.id) ? 'rotate-180' : ''
                        }`}>
                          ▼
                        </span>
                      </button>
                      {openItems.includes(item.id) && (
                        <div className="px-6 pb-6">
                          <div className="bg-neon-pink/10 p-4 rounded-lg border-l-4 border-neon-pink">
                            <p className="text-text-gray leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toutes les questions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center">
                {selectedCategory === 'all' ? '📚 Toutes les Questions' : `${categories.find(c => c.id === selectedCategory)?.icon} ${categories.find(c => c.id === selectedCategory)?.name}`}
              </h2>
              
              {filteredFAQ.map(item => (
                <div key={item.id} className={`glass-card transition-all duration-300 ${
                  item.important && selectedCategory === 'all' ? 'opacity-50' : ''
                }`}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-neon-cyan/5 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-neon-cyan text-xl">
                        {categories.find(c => c.id === item.category)?.icon || '❓'}
                      </span>
                      <h3 className="text-lg font-medium text-text-white">{item.question}</h3>
                    </div>
                    <span className={`text-neon-cyan text-xl transition-transform ${
                      openItems.includes(item.id) ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </button>
                  {openItems.includes(item.id) && (
                    <div className="px-6 pb-6">
                      <div className="bg-cosmic-glass p-4 rounded-lg">
                        <p className="text-text-gray leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Aide supplémentaire */}
            <div className="mt-12 text-center">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-neon-pink mb-4">
                  🤔 Vous ne trouvez pas votre réponse ?
                </h2>
                <p className="text-text-gray mb-6">
                  Notre équipe est là pour vous aider ! Contactez-nous et nous vous répondrons rapidement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = 'mailto:contact.judgemyjpeg@gmail.com'}
                    className="btn-neon-pink"
                  >
                    📧 Envoyer un email
                  </button>
                  <button
                    onClick={() => window.location.href = '/contact'}
                    className="btn-neon-secondary"
                  >
                    💬 Formulaire de contact
                  </button>
                </div>
                <p className="text-text-muted text-sm mt-4">
                  ⏰ Temps de réponse moyen : 2-6 heures • Support en français
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}