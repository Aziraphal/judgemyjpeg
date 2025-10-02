/**
 * Tutorial onboarding interactif
 * Guide les nouveaux utilisateurs étape par étape
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Step {
  id: number
  title: string
  description: string
  icon: string
  action?: string
  actionLabel?: string
}

const steps: Step[] = [
  {
    id: 1,
    title: "Bienvenue sur JudgeMyJPEG ! 👋",
    description: "Votre coach photo IA qui analyse vos images en 3 secondes et vous aide à progresser.",
    icon: "🎉"
  },
  {
    id: 2,
    title: "Choisissez votre mode d'analyse 🎭",
    description: "3 personnalités IA : Pro (technique), Cassant (fun), ou Formation (apprentissage).",
    icon: "🎯",
    action: "/analyze",
    actionLabel: "Voir les modes"
  },
  {
    id: 3,
    title: "Uploadez votre photo 📸",
    description: "Formats JPG, PNG, WebP acceptés. L'IA s'adapte au type : portrait, paysage, street...",
    icon: "⬆️"
  },
  {
    id: 4,
    title: "Recevez votre analyse complète 📊",
    description: "Note /100, conseils détaillés, suggestions d'amélioration, et tips Lightroom/Photoshop !",
    icon: "✨",
    action: "/analyze",
    actionLabel: "Essayer maintenant"
  }
]

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tutorial
    const seen = localStorage.getItem('hasSeenOnboarding')
    if (!seen) {
      // Afficher après 2 secondes
      setTimeout(() => {
        setIsVisible(true)
      }, 2000)
    } else {
      setHasSeenTutorial(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsVisible(false)
    setHasSeenTutorial(true)
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsVisible(false)
    setHasSeenTutorial(true)

    // Rediriger vers /analyze
    const lastStep = steps[steps.length - 1]
    if (lastStep.action) {
      router.push(lastStep.action)
    }
  }

  const handleAction = () => {
    const step = steps[currentStep]
    if (step.action) {
      localStorage.setItem('hasSeenOnboarding', 'true')
      router.push(step.action)
    }
  }

  if (!isVisible || hasSeenTutorial) return null

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-cosmic-dark border-2 border-neon-cyan rounded-2xl max-w-2xl w-full p-8 shadow-2xl shadow-neon-cyan/20 animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{step.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-text-white">{step.title}</h3>
                <p className="text-text-muted text-sm">Étape {currentStep + 1}/{steps.length}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-text-muted hover:text-text-white transition-colors text-sm"
            >
              Passer ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-cosmic-glass rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <p className="text-text-gray text-lg mb-8 leading-relaxed">
            {step.description}
          </p>

          {/* Visual hint */}
          <div className="bg-cosmic-glass border border-cosmic-glassborder rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {currentStep === 0 && '🎨'}
                {currentStep === 1 && '👔🔥📚'}
                {currentStep === 2 && '📤'}
                {currentStep === 3 && '💯'}
              </div>
              <div className="flex-1 text-sm text-text-muted">
                {currentStep === 0 && 'Une IA spécialisée en photographie, formée sur des milliers d\'images'}
                {currentStep === 1 && 'Pro = Technique | Cassant = Fun | Formation = Pédagogique'}
                {currentStep === 2 && 'Glissez-déposez ou cliquez pour sélectionner'}
                {currentStep === 3 && 'Composition • Exposition • Lumière • Créativité • Technique'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-neon-secondary flex-1"
              >
                ← Précédent
              </button>
            )}

            {step.action ? (
              <button
                onClick={handleAction}
                className="btn-gradient-pink flex-1 text-lg"
              >
                {step.actionLabel || 'Continuer'} →
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-neon-pink flex-1"
              >
                {currentStep === steps.length - 1 ? 'Terminer 🎉' : 'Suivant →'}
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 text-center">
            <p className="text-text-muted text-xs">
              💡 Astuce : Vous avez <span className="text-neon-cyan font-semibold">3 analyses gratuites</span> par mois sans inscription
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
