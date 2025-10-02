import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import PhotoUpload from '@/components/PhotoUpload'
import AnalysisResult from '@/components/AnalysisResult'
import ToneSelector from '@/components/ToneSelector'
import SmartLanguageSelector from '@/components/SmartLanguageSelector'
import SubscriptionStatus from '@/components/SubscriptionStatus'
import InteractiveTutorial, { useTutorial } from '@/components/InteractiveTutorial'
import ProgressiveDisclosure, { useProgressiveDisclosure, SkillLevelGroup } from '@/components/ProgressiveDisclosure'
import ContextualTooltip, { RichTooltip } from '@/components/ContextualTooltip'
import StarterPackModal from '@/components/StarterPackModal'
import SEOHead from '@/components/SEOHead'
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
  // DÉSACTIVÉ : Le modal ne s'affiche plus automatiquement, seulement quand l'API retourne une erreur
  // useEffect(() => {
  //   if (shouldShowStarterModal && !showStarterModal && !canAnalyze) {
  //     const timer = setTimeout(() => {
  //       setShowStarterModal(true)
  //     }, 1000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [shouldShowStarterModal, showStarterModal, canAnalyze])

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

  // Afficher écran d'inscription pour non-connectés au lieu de rediriger
  if (!session) {
    return (
      <>
        <SEOHead
          title="Analyser Photo IA | JudgeMyJPEG"
          description="Analysez vos photos avec une IA experte. Créez un compte gratuit pour commencer."
          canonicalUrl="https://www.judgemyjpeg.fr/analyze"
        />

        <main className="min-h-screen bg-cosmic-overlay particles-container flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 text-center">
            {/* Floating orbs */}
            <div className="absolute top-20 left-8 w-32 h-32 bg-glow-pink rounded-full blur-2xl opacity-20 animate-float"></div>
            <div className="absolute bottom-20 right-12 w-48 h-48 bg-glow-cyan rounded-full blur-2xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-8">
                <div className="inline-block p-6 bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 rounded-full border-2 border-neon-cyan/50">
                  <span className="text-6xl">📸</span>
                </div>
              </div>

              {/* Titre */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                  Prêt à analyser vos photos ?
                </span>
              </h1>

              <p className="text-xl text-text-gray mb-8 leading-relaxed">
                Créez un compte <span className="text-neon-cyan font-semibold">gratuit</span> pour analyser vos photos avec notre IA experte
              </p>

              {/* Benefits */}
              <div className="glass-card p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-neon-pink mb-4">✨ Inclus gratuitement :</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-text-gray"><span className="text-neon-cyan font-semibold">3 analyses IA</span> par mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-text-gray"><span className="text-neon-cyan font-semibold">3 modes</span> : Pro, Cassant, Formation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-text-gray">Note détaillée <span className="text-neon-cyan font-semibold">/100</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-text-gray">Conseils <span className="text-neon-cyan font-semibold">Lightroom/Photoshop</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-text-gray">Aucune carte bancaire requise</span>
                  </li>
                </ul>
              </div>

              {/* CTA Google Sign-In */}
              <button
                onClick={() => {
                  // Stocker l'intent pour revenir ici après connexion
                  sessionStorage.setItem('redirect_after_login', '/analyze')
                  // Connexion Google
                  window.location.href = '/api/auth/signin?callbackUrl=/analyze'
                }}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 mb-4"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuer avec Google</span>
              </button>

              <p className="text-sm text-text-muted">
                Inscription en 5 secondes • Gratuit • Aucune carte requise
              </p>
            </div>
          </div>
        </main>
      </>
    )
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
      <SEOHead
        title="Analyser Photo Gratuit IA | Upload & Critique Instantanée - JudgeMyJPEG"
        description="Uploadez votre photo et obtenez une analyse IA instantanée. 3 modes d'expertise : Roast (créatif), Professional (technique), Learning (pédagogique). Notation détaillée, conseils personnalisés, export PDF. Gratuit : 3 analyses/mois."
        keywords="upload photo analyse IA, analyser photo en ligne gratuit, critique photo instantanée, AI photo feedback, photo analysis tool, photography critique AI, improve photography skills, roast my photo, professional photo critique"
        canonicalUrl="https://www.judgemyjpeg.fr/analyze"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "JudgeMyJPEG Photo Analyzer",
          "applicationCategory": "PhotographyApplication",
          "description": "Outil d'analyse photo par intelligence artificielle. Uploadez votre photo et recevez une critique détaillée avec 3 modes d'analyse : Roast, Professional, et Learning.",
          "url": "https://www.judgemyjpeg.fr/analyze",
          "featureList": [
            "Analyse photo par IA en 3 modes distincts",
            "Mode Roast : Critique créative et humoristique",
            "Mode Professional : Conseils techniques experts (composition, exposition, lumière)",
            "Mode Learning : Analyse pédagogique pour progresser",
            "Notation sur 100 points avec détails",
            "Support 6 langues : FR, EN, ES, DE, IT, PT",
            "Types de photos spécialisés : Portrait, Paysage, Street, Macro, Architecture",
            "Export PDF et partage social",
            "3 analyses gratuites par mois"
          ],
          "potentialAction": {
            "@type": "UseAction",
            "name": "Analyser une photo",
            "description": "Uploadez votre photo pour obtenir une analyse IA détaillée",
            "target": "https://www.judgemyjpeg.fr/analyze"
          }
        }}
      />

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