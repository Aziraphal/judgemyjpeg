import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

interface TutorialStep {
  id: string
  title: string
  content: string
  target: string // Sélecteur CSS de l'élément à highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'scroll' | 'wait'
  delay?: number
  skippable?: boolean
  highlightStyle?: 'spotlight' | 'outline' | 'glow'
}

interface TutorialProps {
  steps: TutorialStep[]
  isActive: boolean
  onComplete: () => void
  onSkip?: () => void
  autoStart?: boolean
  theme?: 'dark' | 'cosmic'
}

export default function InteractiveTutorial({
  steps,
  isActive,
  onComplete,
  onSkip,
  autoStart = true,
  theme = 'cosmic'
}: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  // Démarrage automatique
  useEffect(() => {
    if (isActive && autoStart && steps.length > 0) {
      startTutorial()
    }
  }, [isActive, autoStart, steps])

  // Mise à jour de l'élément ciblé
  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      updateTargetElement()
    }
  }, [currentStep, isVisible])

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isVisible) return

      switch (e.key) {
        case 'Escape':
          if (steps[currentStep]?.skippable !== false) {
            skipTutorial()
          }
          break
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previousStep()
          break
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible, currentStep])

  const startTutorial = () => {
    setCurrentStep(0)
    setIsVisible(true)
    document.body.style.overflow = 'hidden'
  }

  const updateTargetElement = () => {
    const step = steps[currentStep]
    if (!step?.target) return

    const element = document.querySelector(step.target) as HTMLElement
    if (element) {
      setTargetElement(element)
      calculateTooltipPosition(element, step.position)
      
      // Scroll vers l'élément si nécessaire
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })

      // Highlight avec délai optionnel
      setTimeout(() => {
        highlightElement(element, step.highlightStyle || 'spotlight')
      }, step.delay || 300)
    }
  }

  const calculateTooltipPosition = (element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect()
    const tooltip = tooltipRef.current
    if (!tooltip) return

    const tooltipRect = tooltip.getBoundingClientRect()
    const margin = 20

    let x = 0
    let y = 0

    switch (position) {
      case 'top':
        x = rect.left + (rect.width - tooltipRect.width) / 2
        y = rect.top - tooltipRect.height - margin
        break
      case 'bottom':
        x = rect.left + (rect.width - tooltipRect.width) / 2
        y = rect.bottom + margin
        break
      case 'left':
        x = rect.left - tooltipRect.width - margin
        y = rect.top + (rect.height - tooltipRect.height) / 2
        break
      case 'right':
        x = rect.right + margin
        y = rect.top + (rect.height - tooltipRect.height) / 2
        break
      case 'center':
        x = (window.innerWidth - tooltipRect.width) / 2
        y = (window.innerHeight - tooltipRect.height) / 2
        break
    }

    // Ajustements pour rester dans la fenêtre
    x = Math.max(margin, Math.min(x, window.innerWidth - tooltipRect.width - margin))
    y = Math.max(margin, Math.min(y, window.innerHeight - tooltipRect.height - margin))

    setTooltipPosition({ x, y })
  }

  const highlightElement = (element: HTMLElement, style: string) => {
    // Supprimer anciens highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight', 'tutorial-spotlight', 'tutorial-outline', 'tutorial-glow')
    })

    // Ajouter nouveau highlight
    element.classList.add('tutorial-highlight', `tutorial-${style}`)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    setIsVisible(false)
    document.body.style.overflow = 'auto'
    cleanupHighlights()
    onSkip?.()
  }

  const completeTutorial = () => {
    setIsVisible(false)
    document.body.style.overflow = 'auto'
    cleanupHighlights()
    onComplete()
  }

  const cleanupHighlights = () => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight', 'tutorial-spotlight', 'tutorial-outline', 'tutorial-glow')
    })
  }

  if (!isVisible || !steps[currentStep]) return null

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={(e) => {
          if (e.target === overlayRef.current && step.skippable !== false) {
            skipTutorial()
          }
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[9999] max-w-sm transition-all duration-300 ${
          theme === 'cosmic' 
            ? 'glass-card border-neon-pink/50' 
            : 'bg-white border border-gray-200 shadow-xl rounded-lg'
        }`}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(0, 0)'
        }}
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                theme === 'cosmic' 
                  ? 'bg-neon-pink text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {currentStep + 1}
              </div>
              <h3 className={`font-semibold ${
                theme === 'cosmic' ? 'text-text-white' : 'text-gray-900'
              }`}>
                {step.title}
              </h3>
            </div>
            
            {step.skippable !== false && (
              <button
                onClick={skipTutorial}
                className={`text-sm opacity-70 hover:opacity-100 transition-opacity ${
                  theme === 'cosmic' ? 'text-text-muted' : 'text-gray-500'
                }`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Contenu */}
          <div className={`mb-4 text-sm leading-relaxed ${
            theme === 'cosmic' ? 'text-text-gray' : 'text-gray-600'
          }`}>
            {step.content}
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className={`flex justify-between text-xs mb-2 ${
              theme === 'cosmic' ? 'text-text-muted' : 'text-gray-500'
            }`}>
              <span>Étape {currentStep + 1} sur {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              theme === 'cosmic' ? 'bg-cosmic-glass' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  theme === 'cosmic' 
                    ? 'bg-gradient-to-r from-neon-pink to-neon-cyan' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'cosmic'
                    ? 'text-neon-cyan hover:text-neon-pink'
                    : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              ← Précédent
            </button>

            <div className="flex space-x-2">
              {step.skippable !== false && (
                <button
                  onClick={skipTutorial}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    theme === 'cosmic'
                      ? 'text-text-muted hover:text-text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Passer
                </button>
              )}
              
              <button
                onClick={nextStep}
                className={`text-sm px-4 py-2 rounded font-medium transition-colors ${
                  theme === 'cosmic'
                    ? 'btn-neon-pink'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant →'}
              </button>
            </div>
          </div>

          {/* Raccourcis clavier */}
          <div className={`mt-3 pt-3 border-t text-xs ${
            theme === 'cosmic' 
              ? 'border-cosmic-glassborder text-text-muted' 
              : 'border-gray-200 text-gray-400'
          }`}>
            <span>Raccourcis: </span>
            <span className="font-mono">Espace</span> = Suivant, 
            <span className="font-mono"> ←→</span> = Navigation, 
            <span className="font-mono"> Echap</span> = Quitter
          </div>
        </div>
      </div>

      {/* Styles CSS injectés */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9997;
        }

        .tutorial-spotlight {
          box-shadow: 0 0 0 4px rgba(255, 0, 110, 0.5), 
                      0 0 0 9999px rgba(0, 0, 0, 0.7);
          border-radius: 8px;
        }

        .tutorial-outline {
          outline: 3px solid #FF006E;
          outline-offset: 2px;
          border-radius: 8px;
        }

        .tutorial-glow {
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.8),
                      0 0 40px rgba(0, 245, 255, 0.4);
          border-radius: 8px;
        }

        .tutorial-highlight {
          animation: tutorialPulse 2s ease-in-out infinite;
        }

        @keyframes tutorialPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </>
  )
}

// Hook pour gérer l'état du tutorial
export function useTutorial(tutorialKey: string) {
  const [isActive, setIsActive] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà complété ce tutorial
    const completed = localStorage.getItem(`tutorial_${tutorialKey}`)
    if (completed) {
      setHasCompleted(true)
    }
  }, [tutorialKey])

  const startTutorial = () => {
    setIsActive(true)
  }

  const completeTutorial = () => {
    setIsActive(false)
    setHasCompleted(true)
    localStorage.setItem(`tutorial_${tutorialKey}`, 'completed')
  }

  const resetTutorial = () => {
    setHasCompleted(false)
    localStorage.removeItem(`tutorial_${tutorialKey}`)
  }

  return {
    isActive,
    hasCompleted,
    startTutorial,
    completeTutorial,
    resetTutorial
  }
}