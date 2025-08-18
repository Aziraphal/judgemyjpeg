import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function LightroomPluginPage() {
  const router = useRouter()
  const [downloadStarted, setDownloadStarted] = useState(false)

  const handleDownload = () => {
    setDownloadStarted(true)
    // Le téléchargement sera géré côté serveur avec un ZIP généré
    window.open('/api/lightroom-plugin/download', '_blank')
  }

  const features = [
    {
      icon: '📊',
      title: 'Analyse Intégrée',
      description: 'Analysez vos photos directement depuis Lightroom sans export manuel'
    },
    {
      icon: '🔄',
      title: 'Analyse par Lot',
      description: 'Traitez jusqu\'à 50 photos simultanément avec gestion intelligente'
    },
    {
      icon: '🏷️',
      title: 'Métadonnées Auto',
      description: 'Scores automatiquement sauvés dans les métadonnées Lightroom'
    },
    {
      icon: '🎯',
      title: '3 Modes IA',
      description: 'Professionnel, Cassant, Expert - adaptés à vos besoins'
    },
    {
      icon: '🌍',
      title: 'Multilingue',
      description: 'Support 6 langues : FR, EN, ES, DE, IT, PT'
    },
    {
      icon: '⚡',
      title: 'Workflow Natif',
      description: 'Interface intégrée au menu Lightroom, zéro friction'
    }
  ]

  const installSteps = [
    {
      step: '1',
      title: 'Télécharger',
      description: 'Cliquez sur le bouton de téléchargement et dézippez le fichier',
      icon: '📥'
    },
    {
      step: '2', 
      title: 'Installer',
      description: 'Lightroom → Fichier → Gestionnaire de modules externes → Ajouter',
      icon: '🔧'
    },
    {
      step: '3',
      title: 'Configurer',
      description: 'Saisissez votre clé API JudgeMyJPEG dans les paramètres du plugin',
      icon: '🔑'
    },
    {
      step: '4',
      title: 'Analyser',
      description: 'Sélectionnez une photo et lancez l\'analyse depuis le menu Bibliothèque',
      icon: '🚀'
    }
  ]

  const requirements = [
    'Adobe Lightroom Classic CC 2015 ou plus récent',
    'Compte JudgeMyJPEG avec clé API',
    'Connexion internet pour les analyses',
    'Espace disque : 2MB pour le plugin'
  ]

  const faqItems = [
    {
      question: 'Le plugin est-il gratuit ?',
      answer: 'Oui, le plugin Lightroom est entièrement gratuit. Seuls les crédits d\'analyse JudgeMyJPEG sont payants selon votre abonnement.'
    },
    {
      question: 'Fonctionne-t-il avec Lightroom CC ?',
      answer: 'Le plugin est conçu pour Lightroom Classic. Lightroom CC (cloud) n\'est pas supporté pour le moment.'
    },
    {
      question: 'Mes photos sont-elles envoyées sur internet ?',
      answer: 'Oui, les photos sont temporairement envoyées cryptées à notre API IA pour analyse, puis immédiatement supprimées. Aucun stockage permanent.'
    },
    {
      question: 'Puis-je analyser mes RAW ?',
      answer: 'Le plugin exporte automatiquement vos RAW en JPEG optimisé pour l\'analyse. Vos fichiers originaux ne sont jamais modifiés.'
    },
    {
      question: 'Combien de photos puis-je analyser ?',
      answer: 'Selon votre abonnement JudgeMyJPEG : gratuit (10/mois), premium (illimité). Le plugin gère les lots de 1 à 50 photos.'
    }
  ]

  return (
    <>
      <Head>
        <title>Plugin Lightroom - JudgeMyJPEG | Analyse IA intégrée</title>
        <meta name="description" content="Plugin officiel Adobe Lightroom pour analyser vos photos avec l'IA JudgeMyJPEG. Installation en 2 minutes, workflow natif, métadonnées automatiques." />
        <meta name="keywords" content="lightroom plugin, analyse photo IA, adobe lightroom, workflow photo, metadata, batch analysis" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Plugin Lightroom JudgeMyJPEG - Analyse IA Intégrée" />
        <meta property="og:description" content="Analysez vos photos directement depuis Lightroom. Plugin gratuit avec analyse par lot et sauvegarde automatique des scores." />
        <meta property="og:image" content="https://www.judgemyjpeg.fr/images/lightroom-plugin-preview.jpg" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Plugin Lightroom JudgeMyJPEG" />
        <meta name="twitter:description" content="Workflow photo révolutionné avec IA intégrée" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "JudgeMyJPEG Lightroom Plugin",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Windows, macOS",
            "downloadUrl": "https://www.judgemyjpeg.fr/lightroom-plugin",
            "author": {
              "@type": "Organization",
              "name": "JudgeMyJPEG"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Background effects */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-glow-pink rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-glow-cyan rounded-full blur-3xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header avec navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary text-sm"
            >
              ← Accueil
            </button>
            
            <div className="flex space-x-4">
              <Link href="/faq" className="btn-neon-secondary text-sm">
                FAQ
              </Link>
              <Link href="/contact" className="btn-neon-secondary text-sm">
                Support
              </Link>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center items-center mb-6">
              <div className="text-6xl mr-4">📸</div>
              <div className="text-6xl mr-4">💙</div>
              <div className="text-6xl">🔧</div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Plugin Lightroom
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-text-gray mb-8 max-w-3xl mx-auto">
              Analysez vos photos avec l'IA <span className="text-neon-cyan font-semibold">JudgeMyJPEG</span> directement depuis 
              <span className="text-neon-pink font-semibold"> Adobe Lightroom</span>. 
              Workflow natif, métadonnées automatiques, analyse par lot.
            </p>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={handleDownload}
                className="btn-neon-pink text-xl px-8 py-4 font-semibold hover:scale-105 transition-all duration-300"
              >
                📦 Télécharger le Plugin (Gratuit)
              </button>
              
              <Link 
                href="/analyze" 
                className="btn-neon-secondary text-lg px-6 py-3"
              >
                🎯 Tester l'IA en ligne
              </Link>
            </div>

            {downloadStarted && (
              <div className="glass-card p-4 max-w-md mx-auto animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <div className="spinner-neon w-5 h-5"></div>
                  <span className="text-neon-cyan">Téléchargement en cours...</span>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center mt-8">
              <div>
                <div className="text-2xl font-bold text-neon-cyan">2 min</div>
                <div className="text-text-muted text-sm">Installation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-pink">50</div>
                <div className="text-text-muted text-sm">Photos/lot</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-cyan">6</div>
                <div className="text-text-muted text-sm">Langues</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="text-neon-cyan">Fonctionnalités</span> du Plugin
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="glass-card p-6 hover-glow transition-all duration-300">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-text-white mb-3">{feature.title}</h3>
                  <p className="text-text-gray">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Installation Guide */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Installation en <span className="text-neon-pink">4 étapes</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {installSteps.map((step, index) => (
                <div key={index} className="glass-card p-6 text-center hover-glow">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="w-12 h-12 bg-neon-cyan rounded-full flex items-center justify-center text-xl font-bold text-black mb-4 mx-auto">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-text-white mb-3">{step.title}</h3>
                  <p className="text-text-gray text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* System Requirements */}
          <section className="mb-16">
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">
                <span className="text-neon-cyan">Prérequis</span> Système
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-text-white mb-4 flex items-center">
                    <span className="text-2xl mr-3">💻</span>
                    Configuration requise
                  </h3>
                  <ul className="space-y-3">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-neon-cyan mr-2">✓</span>
                        <span className="text-text-gray">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-text-white mb-4 flex items-center">
                    <span className="text-2xl mr-3">🔑</span>
                    Obtenir une clé API
                  </h3>
                  <div className="space-y-3">
                    <p className="text-text-gray">
                      1. Créez un compte sur JudgeMyJPEG (gratuit)
                    </p>
                    <p className="text-text-gray">
                      2. Accédez à votre tableau de bord
                    </p>
                    <p className="text-text-gray">
                      3. Copiez votre clé API personnelle
                    </p>
                    <Link href="/auth/signup" className="btn-neon-secondary text-sm inline-block mt-3">
                      Créer un compte →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Questions <span className="text-neon-pink">Fréquentes</span>
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqItems.map((item, index) => (
                <details key={index} className="glass-card p-6 group">
                  <summary className="cursor-pointer text-lg font-semibold text-text-white list-none flex items-center justify-between">
                    <span>{item.question}</span>
                    <span className="text-neon-cyan group-open:rotate-45 transition-transform duration-300">+</span>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-cosmic-glassborder">
                    <p className="text-text-gray leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA Final */}
          <section className="text-center">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Prêt à <span className="text-neon-cyan">révolutionner</span> votre workflow ?
              </h2>
              
              <p className="text-text-gray mb-8">
                Rejoignez les photographes qui optimisent leur tri et sélection avec l'IA intégrée à Lightroom.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="btn-neon-pink text-xl px-8 py-4 font-semibold"
                >
                  📦 Télécharger maintenant
                </button>
                
                <Link href="/contact" className="btn-neon-secondary text-lg px-6 py-3">
                  💬 Besoin d'aide ?
                </Link>
              </div>
              
              <p className="text-text-muted text-sm mt-4">
                Plugin 100% gratuit • Compatible Lightroom Classic • Support inclus
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}