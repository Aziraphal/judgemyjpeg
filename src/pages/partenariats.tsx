import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface PartnershipType {
  title: string
  description: string
  benefits: string[]
  requirements: string[]
  contact: string
  icon: string
}

const partnerships: PartnershipType[] = [
  {
    title: "Bloggers & Influenceurs Photo",
    description: "Collaboration avec des créateurs de contenu photographique pour tester et promouvoir notre IA d'analyse photo.",
    benefits: [
      "Accès gratuit illimité au plan premium",
      "Code promo exclusif pour votre audience", 
      "Contenu personnalisé et co-création",
      "Analyse gratuite de votre portfolio complet",
      "Mention dans nos études de cas"
    ],
    requirements: [
      "Minimum 5K followers sur Instagram/YouTube",
      "Contenu photo régulier et qualitatif",
      "Audience francophone engagée",
      "Publication d'au moins 2 posts par mois"
    ],
    contact: "partenariats@judgemyjpeg.com",
    icon: "📸"
  },
  {
    title: "Écoles de Photographie",
    description: "Programme éducatif pour intégrer l'analyse IA dans les cursus de formation photographique.",
    benefits: [
      "Licences étudiants gratuites illimitées",
      "Formation pédagogique pour enseignants",
      "Dashboard analytics pour suivre les progrès",
      "Contenu pédagogique personnalisé",
      "Certification officielle JudgeMyJPEG"
    ],
    requirements: [
      "École/université accréditée en photographie",
      "Minimum 50 étudiants par promotion", 
      "Intégration dans le programme officiel",
      "Formateur référent dédié"
    ],
    contact: "education@judgemyjpeg.com",
    icon: "🎓"
  },
  {
    title: "Médias & Publications Photo",
    description: "Partenariat média pour des articles, tests produits et analyses d'actualité photographique.",
    benefits: [
      "Accès anticipé aux nouvelles fonctionnalités",
      "Données exclusives pour vos articles",
      "Interviews équipe technique",
      "Contenu co-brandé et études sectorielles",
      "API dédiée pour intégrations"
    ],
    requirements: [
      "Média reconnu dans l'univers photo",
      "Audience qualifiée minimum 10K lecteurs",
      "Publication régulière de tests matériel",
      "Équipe éditoriale dédiée photo"
    ],
    contact: "presse@judgemyjpeg.com", 
    icon: "📰"
  },
  {
    title: "Développeurs & Intégrateurs",
    description: "API et outils pour intégrer notre moteur d'analyse photo dans vos applications et services.",
    benefits: [
      "API gratuite jusqu'à 1000 analyses/mois",
      "Documentation technique complète",
      "Support prioritaire développeur",
      "Revenue sharing sur les intégrations",
      "White-label possible selon projet"
    ],
    requirements: [
      "Application ou service existant",
      "Audience photographes/créateurs",
      "Intégration technique propre",
      "Respect des guidelines d'usage"
    ],
    contact: "dev@judgemyjpeg.com",
    icon: "⚙️"
  }
]

export default function PartenariatsPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Partenariats JudgeMyJPEG - Collaboration avec Influenceurs & Professionnels Photo</title>
        <meta name="description" content="Devenez partenaire JudgeMyJPEG ! Programmes pour bloggers photo, écoles, médias et développeurs. Accès gratuit, codes promo et collaborations exclusives." />
        <meta name="keywords" content="partenariat photo, collaboration influenceur, partenaire blog photo, programme affiliation, API analyse photo" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Partenariats JudgeMyJPEG - Collaboration Professionnelle" />
        <meta property="og:description" content="Rejoignez notre réseau de partenaires et bénéficiez d'avantages exclusifs pour promouvoir l'analyse photo par IA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr/partenariats" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://www.judgemyjpeg.fr/partenariats" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-4 w-20 h-20 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-8 w-28 h-28 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              🤝{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Partenariats
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-3xl mx-auto">
              Rejoignez notre réseau de{' '}
              <span className="text-neon-cyan font-semibold">créateurs</span>,{' '}
              <span className="text-neon-pink font-semibold">professionnels</span>{' '}
              et <span className="text-neon-cyan font-semibold">institutionnels</span>{' '}
              pour démocratiser l'analyse photo par IA
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
            
            <div className="flex space-x-3">
              <Link href="/ressources" className="btn-neon-secondary">
                🎓 Ressources
              </Link>
              <Link href="/contact" className="btn-neon-secondary">
                📧 Contact
              </Link>
            </div>
          </div>

          {/* Intro Benefits */}
          <div className="glass-card p-8 mb-12 text-center">
            <h2 className="text-2xl font-bold text-text-white mb-4">
              🚀 Pourquoi devenir partenaire ?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl mb-2">💎</div>
                <h3 className="font-bold text-neon-cyan mb-2">Accès Premium Gratuit</h3>
                <p className="text-text-gray text-sm">Toutes les fonctionnalités avancées sans limitation</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-bold text-neon-pink mb-2">Revenue Sharing</h3>
                <p className="text-text-gray text-sm">Monétisez votre audience avec nos codes promo</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-bold text-neon-cyan mb-2">Innovation Continue</h3>
                <p className="text-text-gray text-sm">Accès anticipé aux nouvelles fonctionnalités IA</p>
              </div>
            </div>
          </div>

          {/* Partnerships Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {partnerships.map((partnership, index) => (
              <div key={index} className="glass-card p-8 hover-glow">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">{partnership.icon}</div>
                  <h3 className="text-xl font-bold text-text-white">
                    {partnership.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-text-gray mb-6 line-height-relaxed">
                  {partnership.description}
                </p>

                {/* Benefits */}
                <div className="mb-6">
                  <h4 className="font-bold text-neon-cyan mb-3">✅ Avantages :</h4>
                  <ul className="space-y-2">
                    {partnership.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-text-gray text-sm flex items-start">
                        <span className="text-green-400 mr-2 mt-1">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="mb-6">
                  <h4 className="font-bold text-yellow-400 mb-3">📋 Prérequis :</h4>
                  <ul className="space-y-2">
                    {partnership.requirements.map((requirement, reqIndex) => (
                      <li key={reqIndex} className="text-text-gray text-sm flex items-start">
                        <span className="text-yellow-400 mr-2 mt-1">•</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div className="border-t border-cosmic-glassborder pt-4">
                  <a
                    href={`mailto:${partnership.contact}?subject=Demande de partenariat - ${partnership.title}`}
                    className="btn-neon-pink w-full text-center"
                  >
                    📧 Candidater : {partnership.contact}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Success Stories */}
          <div className="glass-card p-8 mb-12">
            <h2 className="text-2xl font-bold text-text-white mb-6 text-center">
              🌟 Témoignages Partenaires
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-cosmic-glass p-6 rounded-lg border border-cosmic-glassborder">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-neon-pink rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">MP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-white">Marie Photographe</h4>
                    <p className="text-text-muted text-sm">@mariephoto • 12K followers</p>
                  </div>
                </div>
                <p className="text-text-gray italic">
                  "En 3 mois de partenariat, j'ai vu mes photos progresser énormément. Mes abonnés adorent les analyses avant/après que je partage !"
                </p>
              </div>
              
              <div className="bg-cosmic-glass p-6 rounded-lg border border-cosmic-glassborder">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-neon-cyan rounded-full flex items-center justify-center mr-4">
                    <span className="text-black font-bold">EP</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-white">École Photographie</h4>
                    <p className="text-text-muted text-sm">Paris • 200+ étudiants</p>
                  </div>
                </div>
                <p className="text-text-gray italic">
                  "L'intégration dans nos cours a révolutionné l'apprentissage. Les étudiants comprennent leurs erreurs plus rapidement."
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Partenariats */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-text-white mb-6 text-center">
              ❓ Questions Fréquentes
            </h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-neon-cyan mb-2">Combien ça coûte d'être partenaire ?</h4>
                <p className="text-text-gray">C'est gratuit ! Nous cherchons des collaborations mutuellement bénéfiques, pas à vendre nos services.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-neon-cyan mb-2">Quelle exclusivité demandez-vous ?</h4>
                <p className="text-text-gray">Aucune exclusivité requise. Vous pouvez travailler avec d'autres outils d'analyse photo en parallèle.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-neon-cyan mb-2">Comment sont calculées les commissions ?</h4>
                <p className="text-text-gray">20% de commission sur tous les abonnements générés par votre code promo, avec tracking transparent.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}