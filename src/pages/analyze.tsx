import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import PhotoUpload from '@/components/PhotoUpload'
import AnalysisResult from '@/components/AnalysisResult'
import ToneSelector from '@/components/ToneSelector'
import LanguageSelector from '@/components/LanguageSelector'
import SubscriptionStatus from '@/components/SubscriptionStatus'
import InteractiveTutorial, { useTutorial } from '@/components/InteractiveTutorial'
import ProgressiveDisclosure, { useProgressiveDisclosure, SkillLevelGroup } from '@/components/ProgressiveDisclosure'
import ContextualTooltip, { RichTooltip } from '@/components/ContextualTooltip'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage } from '@/services/openai'

export default function AnalyzePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [result, setResult] = useState<{
    photo: any
    analysis: PhotoAnalysis
  } | null>(null)
  const [selectedTone, setSelectedTone] = useState<AnalysisTone>('professional')
  const [selectedLanguage, setSelectedLanguage] = useState<AnalysisLanguage>('fr')
  const [isUploading, setIsUploading] = useState(false)
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  
  // Tutorial système
  const { isActive: tutorialActive, hasCompleted: tutorialCompleted, startTutorial, completeTutorial } = useTutorial('analyze-page')
  const { isOpen: progressiveOpen, toggleSection } = useProgressiveDisclosure(userLevel)

  // Déterminer niveau utilisateur basé sur l'historique
  useEffect(() => {
    if (session?.user) {
      const visits = localStorage.getItem('analyze_visits') || '0'
      const visitCount = parseInt(visits)
      
      // Si l'utilisateur a déjà terminé le tutoriel, le considérer comme intermédiaire minimum
      const tutorialCompleted = localStorage.getItem('tutorial_analyze-page')
      
      if (tutorialCompleted || visitCount > 10) {
        setUserLevel('advanced')
      } else if (visitCount > 3) {
        setUserLevel('intermediate')
      } else {
        setUserLevel('beginner')
      }
      
      localStorage.setItem('analyze_visits', (visitCount + 1).toString())
    }
  }, [session])

  // Démarrer tutorial automatiquement pour nouveaux utilisateurs (désactivé pour éviter les répétitions)
  useEffect(() => {
    // Auto-déclenchement désactivé - l'utilisateur peut cliquer sur le bouton 💡 pour lancer le tutoriel
    // if (session?.user && !tutorialCompleted && userLevel === 'beginner') {
    //   setTimeout(() => startTutorial(), 1000)
    // }
  }, [session, tutorialCompleted, userLevel, startTutorial])

  // Étapes du tutorial
  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'Bienvenue sur JudgeMyJPEG !',
      content: 'Découvrez comment obtenir une analyse IA professionnelle de vos photos en quelques clics.',
      target: '[data-tutorial="welcome"]',
      position: 'center' as const,
      skippable: false
    },
    {
      id: 'tone-selector',
      title: 'Choisissez votre style',
      content: 'Sélectionnez le ton de l\'analyse : professionnel, amical, ou même humoristique !',
      target: '[data-tutorial="tone-selector"]',
      position: 'right' as const,
      highlightStyle: 'glow' as const
    },
    {
      id: 'photo-upload',
      title: 'Uploadez votre photo',
      content: 'Glissez-déposez votre image ou cliquez pour la sélectionner. Formats acceptés : JPG, PNG, WebP.',
      target: '[data-tutorial="photo-upload"]',
      position: 'left' as const,
      highlightStyle: 'spotlight' as const
    },
    {
      id: 'language',
      title: 'Langue de l\'analyse',
      content: 'Choisissez la langue pour votre analyse. Disponible en 6 langues !',
      target: '[data-tutorial="language-selector"]',
      position: 'bottom' as const
    },
    {
      id: 'advanced-options',
      title: 'Options avancées',
      content: 'Explorez les options avancées pour personnaliser votre analyse selon vos besoins.',
      target: '[data-tutorial="advanced-options"]',
      position: 'top' as const,
      delay: 500
    }
  ]

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/')
    return null
  }

  const handleAnalysisComplete = (analysisResult: { photo: any; analysis: PhotoAnalysis }) => {
    setResult(analysisResult)
  }

  const handleNewAnalysis = () => {
    setResult(null)
  }

  return (
    <>
      <Head>
        <title>Analyser une photo - JudgeMyJPEG</title>
        <meta name="description" content="L'IA qui juge vos photos avec humour ou professionnalisme" />
      </Head>

      <main className={`min-h-screen particles-container relative transition-all duration-1000 ${
        isUploading && selectedTone === 'roast' 
          ? 'bg-red-900/20 bg-gradient-to-br from-red-900/30 to-black'
        : isUploading && selectedTone === 'expert'
          ? 'bg-yellow-900/10 bg-gradient-to-br from-yellow-800/20 to-black'
          : 'bg-cosmic-overlay'
      }`}>
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-5 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-glow-pink rounded-full blur-lg opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header avec navigation */}
          <div className="flex justify-between items-center mb-8" data-tutorial="welcome">
            {/* Bouton retour */}
            <ContextualTooltip content="Retour à la page d'accueil">
              <button
                onClick={() => router.push('/')}
                className="btn-neon-secondary text-sm"
              >
                ← Accueil
              </button>
            </ContextualTooltip>

            {/* Titre centré */}
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  Analyse Photo IA
                </span>
              </h1>
              <p className="text-base text-text-gray">
                <span className="text-neon-cyan">Analyse IA professionnelle</span> de vos photos
              </p>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2">
              {/* Sélecteur de langue */}
              <RichTooltip 
                title="Langue d'analyse"
                description="Choisissez la langue dans laquelle vous souhaitez recevoir votre analyse détaillée"
                icon="🌍"
              >
                <div className="relative" data-tutorial="language-selector">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as AnalysisLanguage)}
                    className="btn-neon-secondary text-sm appearance-none pr-8 cursor-pointer"
                    style={{
                      color: 'white',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)'
                    }}
                  >
                    <option value="fr" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇫🇷 Français</option>
                    <option value="en" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇬🇧 English</option>
                    <option value="es" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇪🇸 Español</option>
                    <option value="de" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇩🇪 Deutsch</option>
                    <option value="it" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇮🇹 Italiano</option>
                    <option value="pt" style={{ backgroundColor: '#1e293b', color: 'white' }}>🇵🇹 Português</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <span className="text-text-gray">▼</span>
                  </div>
                </div>
              </RichTooltip>

              {/* Bouton tutorial */}
              <ContextualTooltip content={tutorialCompleted ? "Relancer le tutoriel" : "Démarrer le tutoriel"}>
                <button
                  onClick={startTutorial}
                  className="btn-neon-secondary text-sm px-3 py-2"
                >
                  💡
                </button>
              </ContextualTooltip>
              
              {result && (
                <button
                  onClick={handleNewAnalysis}
                  className="btn-neon-pink text-sm"
                >
                  📸 Nouvelle analyse
                </button>
              )}
            </div>
          </div>

          {/* Contenu principal */}
          {!result ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Colonne gauche : Modes d'analyse */}
                <div>
                  <div className="glass-card p-6" data-tutorial="tone-selector">
                    <RichTooltip 
                      title="Modes d'analyse"
                      description="Chaque mode offre une perspective différente sur votre photo. Choisissez selon votre humeur !"
                      icon="🎭"
                    >
                      <h2 className="text-xl font-bold text-text-white mb-6 flex items-center cursor-help">
                        <span className="text-neon-pink mr-3">🎭</span>
                        Mode d'analyse
                      </h2>
                    </RichTooltip>
                    
                    <ToneSelector 
                      selectedTone={selectedTone}
                      onToneChange={setSelectedTone}
                    />
                  </div>

                  {/* Options avancées avec Progressive Disclosure */}
                  {userLevel !== 'beginner' && (
                    <div className="mt-6" data-tutorial="advanced-options">
                      <SkillLevelGroup level={userLevel}>
                        <ProgressiveDisclosure
                          trigger="Options avancées"
                          level={userLevel}
                          title="Personnalisation approfondie"
                          description="Configurez les paramètres avancés de l'analyse"
                        >
                          <div className="space-y-4 mt-4">
                            <div className="glass-card p-4">
                              <h4 className="text-sm font-semibold text-neon-cyan mb-3">
                                🎯 Ciblage de l'analyse
                              </h4>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-text-gray text-sm">Focus sur la composition</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-text-gray text-sm">Analyse des couleurs détaillée</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-text-gray text-sm">Conseils d'amélioration spécifiques</span>
                                </label>
                              </div>
                            </div>

                            <div className="glass-card p-4">
                              <h4 className="text-sm font-semibold text-neon-cyan mb-3">
                                ⚡ Performance
                              </h4>
                              <div className="space-y-2">
                                <label className="flex items-center justify-between">
                                  <span className="text-text-gray text-sm">Analyse rapide</span>
                                  <input type="checkbox" className="rounded" />
                                </label>
                                <label className="flex items-center justify-between">
                                  <span className="text-text-gray text-sm">Cache local</span>
                                  <input type="checkbox" className="rounded" defaultChecked />
                                </label>
                              </div>
                            </div>
                          </div>
                        </ProgressiveDisclosure>
                      </SkillLevelGroup>
                    </div>
                  )}
                </div>

                {/* Colonne droite : Upload photo */}
                <div>
                  <div className="glass-card p-6 h-full" data-tutorial="photo-upload">
                    <RichTooltip 
                      title="Upload de photo"
                      description="Supports JPG, PNG, WebP jusqu'à 10MB. Glissez-déposez ou cliquez pour sélectionner."
                      icon="📸"
                    >
                      <h2 className="text-xl font-bold text-text-white mb-6 flex items-center cursor-help">
                        <span className="text-neon-cyan mr-3">📸</span>
                        Votre photo
                      </h2>
                    </RichTooltip>
                    
                    <PhotoUpload 
                      onAnalysisComplete={handleAnalysisComplete} 
                      tone={selectedTone}
                      language={selectedLanguage}
                      onUploadStateChange={setIsUploading}
                    />
                  </div>
                </div>
              </div>

              {/* Section inférieure : Abonnements */}
              <div className="w-full">
                <SubscriptionStatus />
              </div>
            </div>
          ) : (
            <AnalysisResult photo={result.photo} analysis={result.analysis} tone={selectedTone} />
          )}
        </div>

        {/* Tutorial interactif */}
        <InteractiveTutorial
          steps={tutorialSteps}
          isActive={tutorialActive}
          onComplete={completeTutorial}
          onSkip={completeTutorial}
          theme="cosmic"
        />
      </main>
    </>
  )
}