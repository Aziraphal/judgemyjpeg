import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Resource {
  title: string
  description: string
  type: 'guide' | 'tool' | 'template' | 'study'
  link: string
  tags: string[]
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
  downloadable?: boolean
}

const resources: Resource[] = [
  {
    title: "Guide Complet : 10 Erreurs Photo que l'IA Détecte Instantanément",
    description: "Découvrez les défauts techniques et artistiques les plus courants analysés par notre IA. Avec exemples avant/après et solutions pratiques.",
    type: "guide",
    link: "/blog/10-erreurs-photos-ia-detecte",
    tags: ["erreurs photo", "technique", "IA", "amélioration"],
    difficulty: "débutant"
  },
  {
    title: "Checklist PDF : Optimiser ses Photos pour les Réseaux Sociaux", 
    description: "Liste de vérification complète pour maximiser l'impact de vos photos Instagram, Facebook et TikTok.",
    type: "template",
    link: "/ressources/checklist-reseaux-sociaux.pdf",
    tags: ["réseaux sociaux", "checklist", "optimisation"],
    difficulty: "débutant",
    downloadable: true
  },
  {
    title: "Étude de Cas : 100 Photos Analysées par l'IA",
    description: "Analyse statistique complète des défauts les plus fréquents et des améliorations possibles sur un échantillon de 100 photos.",
    type: "study", 
    link: "/blog/etude-100-photos-ia",
    tags: ["étude", "statistiques", "analyse", "tendances"],
    difficulty: "intermédiaire"
  },
  {
    title: "Templates Lightroom : Corrections Basées sur l'IA",
    description: "Presets Lightroom créés à partir des recommandations les plus fréquentes de notre IA pour différents types de photos.",
    type: "template",
    link: "/ressources/presets-lightroom-ia.zip",
    tags: ["Lightroom", "presets", "correction", "retouche"],
    difficulty: "avancé",
    downloadable: true
  },
  {
    title: "Formation Gratuite : Comprendre les Scores IA",
    description: "Mini-cours pour décoder les évaluations de l'IA et appliquer les conseils d'amélioration efficacement.",
    type: "guide",
    link: "/formation/scores-ia",
    tags: ["formation", "scores", "compréhension", "application"],
    difficulty: "débutant"
  },
  {
    title: "API Documentation : Intégrer l'Analyse IA",
    description: "Documentation technique complète pour intégrer notre moteur d'analyse photo dans vos applications.",
    type: "tool",
    link: "/api/documentation",
    tags: ["API", "développement", "intégration", "technique"],
    difficulty: "avancé"
  }
]

const typeIcons = {
  guide: '📚',
  tool: '🛠️', 
  template: '📄',
  study: '📊'
}

const difficultyColors = {
  débutant: 'text-green-400',
  intermédiaire: 'text-yellow-400',
  avancé: 'text-red-400'
}

export default function RessourcesPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Ressources Photo Gratuites - Guides, Templates & Outils IA | JudgeMyJPEG</title>
        <meta name="description" content="Accédez à nos ressources photographiques gratuites : guides d'amélioration, templates Lightroom, études de cas et formations pour perfectionner vos photos." />
        <meta name="keywords" content="ressources photo gratuites, guides photographie, templates Lightroom, formation photo, outils IA photographie" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Ressources Photo Gratuites - JudgeMyJPEG" />
        <meta property="og:description" content="Guides, templates et outils gratuits pour améliorer vos photos avec l'aide de l'intelligence artificielle." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.judgemyjpeg.fr/ressources" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://www.judgemyjpeg.fr/ressources" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-32 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              🎓{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Ressources Photo
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-3xl mx-auto">
              Guides, templates et outils{' '}
              <span className="text-neon-cyan font-semibold">gratuits</span>{' '}
              pour améliorer vos photos avec l'aide de{' '}
              <span className="text-neon-pink font-semibold">l'intelligence artificielle</span>
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
              <Link href="/blog" className="btn-neon-secondary">
                📝 Blog
              </Link>
              <Link href="/faq" className="btn-neon-secondary">
                ❓ FAQ
              </Link>
            </div>
          </div>

          {/* CTA Premium */}
          <div className="glass-card p-6 mb-12 border border-neon-pink/30">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-text-white mb-2">
                  🚀 Accès Premium aux Ressources Avancées
                </h3>
                <p className="text-text-gray">
                  Templates exclusifs, formations vidéo et outils professionnels pour photographes
                </p>
              </div>
              <Link href="/tarifs" className="btn-neon-pink whitespace-nowrap">
                💎 Voir les Plans
              </Link>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {['guide', 'tool', 'template', 'study'].map(type => (
              <button
                key={type}
                className="btn-neon-secondary text-sm px-4 py-2 capitalize"
              >
                {typeIcons[type as keyof typeof typeIcons]} {type}s
              </button>
            ))}
          </div>

          {/* Ressources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div key={index} className="glass-card p-6 hover-glow group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">
                    {typeIcons[resource.type]}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${difficultyColors[resource.difficulty]}`}>
                      {resource.difficulty.toUpperCase()}
                    </span>
                    {resource.downloadable && (
                      <span className="text-neon-cyan text-xs">📥 PDF</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-text-white mb-3 group-hover:text-neon-cyan transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-text-gray text-sm mb-4 line-height-relaxed">
                  {resource.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-cosmic-glass rounded-full text-xs text-text-muted border border-cosmic-glassborder"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <Link
                  href={resource.link}
                  className="btn-neon-secondary w-full text-center group-hover:bg-neon-cyan group-hover:text-black transition-all duration-300"
                >
                  {resource.downloadable ? '📥 Télécharger' : '👀 Consulter'}
                </Link>
              </div>
            ))}
          </div>

          {/* Call to Action Final */}
          <div className="glass-card p-8 mt-12 text-center">
            <h2 className="text-2xl font-bold text-text-white mb-4">
              🤖 Prêt à analyser vos photos ?
            </h2>
            <p className="text-text-gray mb-6 max-w-2xl mx-auto">
              Utilisez ces ressources avec notre IA pour obtenir des analyses personnalisées et améliorer rapidement vos compétences photographiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyser-photo" className="btn-neon-pink">
                📸 Analyser une Photo
              </Link>
              <Link href="/analyse-lot" className="btn-neon-secondary">
                📊 Analyse en Lot
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}