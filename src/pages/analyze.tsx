import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import PhotoUpload from '@/components/PhotoUpload'
import AnalysisResult from '@/components/AnalysisResult'
import ToneSelector from '@/components/ToneSelector'
import SmartLanguageSelector from '@/components/SmartLanguageSelector'
import SubscriptionStatus from '@/components/SubscriptionStatus'
import InteractiveTutorial, { useTutorial } from '@/components/InteractiveTutorial'
import ProgressiveDisclosure, { useProgressiveDisclosure, SkillLevelGroup } from '@/components/ProgressiveDisclosure'
import ContextualTooltip, { RichTooltip } from '@/components/ContextualTooltip'
import StarterPackModal from '@/components/StarterPackModal'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage, PhotoType } from '@/types/analysis'
import { trackPhotoAnalysis } from '@/lib/gtag'
import { useAnalysisLimit } from '@/hooks/useAnalysisLimit'
import { useTranslation } from '@/hooks/useTranslation'

export default function AnalyzePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [result, setResult] = useState<{
    photo: any
    analysis: PhotoAnalysis
  } | null>(null)
  const [selectedTone, setSelectedTone] = useState<AnalysisTone>('professional')
  const [selectedLanguage, setSelectedLanguage] = useState<AnalysisLanguage>('fr')
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType>('general')
  const [isUploading, setIsUploading] = useState(false)
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showStarterModal, setShowStarterModal] = useState(false)
  
  // Hook de traduction avec détection automatique
  const { t, language: detectedLanguage, setLanguage } = useTranslation()
  
  // Synchroniser la langue détectée avec le state selectedLanguage
  useEffect(() => {
    if (detectedLanguage && detectedLanguage !== selectedLanguage) {
      setSelectedLanguage(detectedLanguage)
    }
  }, [detectedLanguage])
  
  // Gestionnaire pour changement de langue
  const handleLanguageChange = (lang: AnalysisLanguage) => {
    setSelectedLanguage(lang)
    setLanguage(lang) // Met à jour le système de traduction
  }
  
  // Tutorial système
  const { isActive: tutorialActive, hasCompleted: tutorialCompleted, startTutorial, completeTutorial } = useTutorial('analyze-page')
  const { isOpen: progressiveOpen, toggleSection } = useProgressiveDisclosure(userLevel)
  
  // Hook pour gérer les limites d'analyses
  const { 
    canAnalyze, 
    isExhausted, 
    shouldShowStarterModal, 
    daysUntilReset, 
    starterPack,
    refreshStatus 
  } = useAnalysisLimit()

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

  // Afficher le modal starter pack si les analyses sont épuisées
  useEffect(() => {
    // Ne jamais afficher le modal si l'utilisateur peut analyser
    if (shouldShowStarterModal && !showStarterModal && !canAnalyze) {
      // Délai de 1 seconde pour l'UX
      const timer = setTimeout(() => {
        setShowStarterModal(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [shouldShowStarterModal, showStarterModal, canAnalyze])

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

  const handleAnalysisComplete = (analysisResult: { photo: any; analysis: PhotoAnalysis; tracking?: any }) => {
    setResult(analysisResult)
    
    // Track vers Google Analytics si données tracking disponibles
    if (analysisResult.tracking) {
      trackPhotoAnalysis(
        analysisResult.tracking.tone,
        analysisResult.tracking.language,
        analysisResult.tracking.score
      )
    }
  }

  const handleNewAnalysis = () => {
    setResult(null)
  }

  return (
    <>
      <Head>
        <title>{t.analyze.title} | JudgeMyJPEG</title>
        <meta name="description" content={t.analyze.subtitle} />
        <link rel="canonical" href="https://www.judgemyjpeg.fr/analyze" />
      </Head>

      <main className={`min-h-screen particles-container relative transition-all duration-1000 ${
        isUploading && selectedTone === 'roast' 
          ? 'bg-red-900/20 bg-gradient-to-br from-red-900/30 to-black'
        : isUploading && selectedTone === 'learning'
          ? 'bg-amber-900/10 bg-gradient-to-br from-amber-800/20 to-black'
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
                  {t.analyze.title}
                </span>
              </h1>
              <p className="text-base text-text-gray">
                <span className="text-neon-cyan">{t.analyze.subtitle}</span>
              </p>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2">
              {/* Bouton Options avancées sur mobile */}
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="md:hidden btn-neon-secondary text-sm px-3 py-2"
              >
                ⚙️
              </button>

              {/* Options toujours visibles sur desktop */}
              <div className="hidden md:flex items-center space-x-2">
                {/* Sélecteur de langue compact pour desktop */}
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

                {/* Bouton tutorial */}
                <ContextualTooltip content={tutorialCompleted ? "Relancer le tutoriel" : "Démarrer le tutoriel"}>
                  <button
                    onClick={startTutorial}
                    className="btn-neon-secondary text-sm px-3 py-2"
                  >
                    💡
                  </button>
                </ContextualTooltip>
              </div>
              
              {result && (
                <button
                  onClick={handleNewAnalysis}
                  className="btn-neon-pink text-sm px-2 py-2 md:px-4"
                >
                  <span className="hidden sm:inline">📸 Nouvelle analyse</span>
                  <span className="sm:hidden">🔄</span>
                </button>
              )}
            </div>

            {/* Options avancées sur mobile (pliables) */}
            {showAdvancedOptions && (
              <div className="md:hidden mt-4 p-4 bg-cosmic-glass border border-cosmic-glassborder rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-neon-cyan font-semibold">⚙️ Options avancées</h3>
                  <button
                    onClick={() => setShowAdvancedOptions(false)}
                    className="text-text-muted hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Sélecteur de langue intelligent mobile */}
                <div className="mb-4">
                  <SmartLanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    showAutoDetection={true}
                    autoApply={true}
                  />
                </div>

                {/* Bouton tutorial mobile */}
                <button
                  onClick={() => {
                    startTutorial()
                    setShowAdvancedOptions(false)
                  }}
                  className="w-full btn-neon-secondary text-sm py-3"
                >
                  💡 {tutorialCompleted ? "Relancer le tutoriel" : "Démarrer le tutoriel"}
                </button>
              </div>
            )}
          </div>

          {/* Contenu principal */}
          {!result ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Colonne gauche : Modes d'analyse */}
                <div>
                  <div className="glass-card p-6" data-tutorial="tone-selector">
                    <h2 className="text-xl font-bold text-text-white mb-6 flex items-center">
                      <span className="text-neon-pink mr-3">🎭</span>
                      {t.analyze.selectMode}
                    </h2>
                    
                    <ToneSelector 
                      selectedTone={selectedTone}
                      onToneChange={setSelectedTone}
                    />
                  </div>

                  {/* Note: Options avancées supprimées car non implémentées dans l'API */}
                </div>

                {/* Colonne droite : Upload photo */}
                <div>
                  <div className="glass-card p-6 h-full" data-tutorial="photo-upload">
                    <h2 className="text-xl font-bold text-text-white mb-6 flex items-center">
                      <span className="text-neon-cyan mr-3">📸</span>
                      {t.analyze.uploadPhoto}
                    </h2>
                    
                    <PhotoUpload 
                      onAnalysisComplete={handleAnalysisComplete} 
                      tone={selectedTone}
                      language={selectedLanguage}
                      photoType={selectedPhotoType}
                      onPhotoTypeChange={setSelectedPhotoType}
                      onUploadStateChange={setIsUploading}
                      onAnalysisLimitReached={() => setShowStarterModal(true)}
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
            <AnalysisResult 
              photo={result.photo} 
              analysis={result.analysis} 
              tone={selectedTone}
              onNewAnalysis={() => {
                setResult(null)
                setIsUploading(false)
                // Scroll vers le haut pour l'upload
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
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

      {/* Modal Starter Pack */}
      <StarterPackModal
        isOpen={showStarterModal}
        onClose={() => setShowStarterModal(false)}
        remainingDays={daysUntilReset}
      />
    </>
  )
}