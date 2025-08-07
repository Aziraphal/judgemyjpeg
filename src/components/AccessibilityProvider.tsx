/**
 * Accessibility Provider
 * Composant central pour améliorer l'accessibilité WCAG 2.1 AA
 */

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'normal' | 'large' | 'xl'
  toggleHighContrast: () => void
  setFontSize: (size: 'normal' | 'large' | 'xl') => void
  announceToScreenReader: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

interface AccessibilityProviderProps {
  children: ReactNode
}

export default function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xl'>('normal')
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Charger les préférences sauvegardées
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true'
    const savedFontSize = (localStorage.getItem('accessibility-font-size') as 'normal' | 'large' | 'xl') || 'normal'
    
    setHighContrast(savedHighContrast)
    setFontSizeState(savedFontSize)

    // Détecter les préférences système
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(prefersReducedMotion.matches)

    // Écouter les changements de préférences système
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    prefersReducedMotion.addEventListener('change', handleMotionChange)
    return () => prefersReducedMotion.removeEventListener('change', handleMotionChange)
  }, [])

  useEffect(() => {
    // Appliquer les préférences au document
    const root = document.documentElement

    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--animation-duration')
      root.classList.remove('reduce-motion')
    }

    // Appliquer la taille de police
    const fontSizeMap = {
      normal: '16px',
      large: '18px',
      xl: '20px'
    }
    root.style.fontSize = fontSizeMap[fontSize]

  }, [highContrast, reducedMotion, fontSize])

  // Annonce pour les lecteurs d'écran lors des changements de page
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Extraire le titre de la page depuis l'URL
      const pageName = url.split('/').pop() || 'accueil'
      const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1)
      
      setTimeout(() => {
        announceToScreenReader(`Page ${pageTitle} chargée`)
      }, 100)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router])

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem('accessibility-high-contrast', newValue.toString())
    announceToScreenReader(newValue ? 'Mode contraste élevé activé' : 'Mode contraste élevé désactivé')
  }

  const setFontSize = (size: 'normal' | 'large' | 'xl') => {
    setFontSizeState(size)
    localStorage.setItem('accessibility-font-size', size)
    const sizeLabels = {
      normal: 'normale',
      large: 'grande',
      xl: 'très grande'
    }
    announceToScreenReader(`Taille de police changée vers ${sizeLabels[size]}`)
  }

  const announceToScreenReader = (message: string) => {
    setAnnouncements(prev => [...prev, message])
    
    // Nettoyer les annonces après 1 seconde
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1))
    }, 1000)
  }

  const contextValue: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    toggleHighContrast,
    setFontSize,
    announceToScreenReader
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links - Navigation rapide */}
      <div className="sr-only focus-within:not-sr-only">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <a href="#main-navigation" className="skip-link">
          Aller à la navigation
        </a>
      </div>

      {/* Zone d'annonces pour les lecteurs d'écran */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      {/* Zone d'annonces urgentes */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only" id="urgent-announcements">
        {/* Les messages urgents seront injectés ici */}
      </div>

      {/* Bouton d'accessibilité flottant */}
      <div className="fixed top-20 right-4 z-40">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm hover:bg-gray-700 transition-colors focus-visible"
          title="Options d'accessibilité"
          aria-label="Ouvrir les options d'accessibilité"
          aria-expanded={showPanel}
        >
          ♿
        </button>
        
        {showPanel && (
          <div className="mt-2 space-y-2">
            <button
              onClick={toggleHighContrast}
              className="w-full bg-gray-800 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-sm hover:bg-gray-700 transition-colors focus-visible"
              title="Basculer le mode contraste élevé"
              aria-label={`${highContrast ? 'Désactiver' : 'Activer'} le mode contraste élevé`}
            >
              {highContrast ? '🔆' : '🌙'} {highContrast ? 'Normal' : 'Contraste'}
            </button>
            
            <div className="bg-gray-800 backdrop-blur-sm border border-gray-600 rounded-lg overflow-hidden">
          <div className="text-xs text-white p-2 border-b border-gray-600 flex justify-between items-center">
            <span>Taille police</span>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-white text-sm"
              aria-label="Fermer le panneau d'accessibilité"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col">
            {(['normal', 'large', 'xl'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-2 text-xs transition-colors focus-visible ${
                  fontSize === size 
                    ? 'bg-neon-cyan text-black font-semibold' 
                    : 'text-white hover:text-neon-cyan hover:bg-gray-700'
                }`}
                aria-label={`Changer la taille de police vers ${size}`}
                aria-pressed={fontSize === size}
              >
                {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
            </div>
          </div>
        )}
      </div>

      <main id="main-content">
        {children}
      </main>
    </AccessibilityContext.Provider>
  )
}

// Hook pour utiliser le contexte d'accessibilité
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

// Composant d'erreur accessible
export function AccessibleError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    announceToScreenReader(`Erreur : ${message}`)
  }, [message, announceToScreenReader])

  return (
    <div role="alert" className="error-message">
      <div className="flex items-center justify-between">
        <div>
          <span className="sr-only">Erreur : </span>
          {message}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-sm focus-visible"
            aria-label="Réessayer l'action qui a échoué"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  )
}

// Composant de succès accessible
export function AccessibleSuccess({ message }: { message: string }) {
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    announceToScreenReader(`Succès : ${message}`)
  }, [message, announceToScreenReader])

  return (
    <div role="status" className="success-message">
      <span className="sr-only">Succès : </span>
      {message}
    </div>
  )
}