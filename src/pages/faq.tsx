import { useState } from 'react'
import Head from 'next/head'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  important?: boolean
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
      answer: 'Notre IA utilise GPT-4o-mini d\'OpenAI pour analyser votre photo selon plusieurs critères : composition (règle des tiers, lignes directrices), qualité technique (exposition, netteté, couleurs), impact artistique (créativité, émotion, storytelling). Elle vous donne un score objectif et des conseils précis.',
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
      answer: 'Vérifiez vos spams/indésirables. Ajoutez noreply@judgemyjpeg.com à vos contacts. Si le problème persiste, contactez le support avec votre adresse email exacte.'
    },
    {
      id: '20',
      category: 'troubleshooting',
      question: 'Mon paiement a échoué',
      answer: 'Vérifiez : carte valide, fonds suffisants, paiements internationaux autorisés. Stripe (notre processeur) bloque parfois les paiements suspects. Contactez votre banque ou essayez une autre carte. Support disponible 24/7.'
    }
  ]

  const categories = [
    { id: 'all', name: 'Toutes', icon: '📋' },
    { id: 'general', name: 'Général', icon: '🎯' },
    { id: 'technical', name: 'Technique', icon: '⚙️' },
    { id: 'subscription', name: 'Abonnements', icon: '💎' },
    { id: 'privacy', name: 'Confidentialité', icon: '🔒' },
    { id: 'usage', name: 'Utilisation', icon: '📸' },
    { id: 'troubleshooting', name: 'Problèmes', icon: '🔧' }
  ]

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
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
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Questions Fréquentes
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur JudgeMyJPEG
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

          <div className="max-w-6xl mx-auto">
            
            {/* Filtres par catégorie */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'bg-neon-cyan text-black shadow-neon-cyan/50 shadow-lg'
                        : 'bg-cosmic-glass border border-cosmic-glassborder text-text-gray hover:border-neon-cyan/50'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
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
                    onClick={() => window.location.href = 'mailto:support@judgemyjpeg.com'}
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