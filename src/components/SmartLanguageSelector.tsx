/**
 * Sélecteur de langue intelligent avec auto-localisation
 * Combine LanguageSelector existant avec détection automatique
 */

import { useState, useEffect } from 'react'
import type { AnalysisLanguage } from '@/types/analysis'
import LanguageSelector from './LanguageSelector'
import { useAutoLocalization } from '@/hooks/useAutoLocalization'

interface SmartLanguageSelectorProps {
  selectedLanguage: AnalysisLanguage
  onLanguageChange: (language: AnalysisLanguage) => void
  showAutoDetection?: boolean
  autoApply?: boolean
}

export default function SmartLanguageSelector({ 
  selectedLanguage, 
  onLanguageChange,
  showAutoDetection = true,
  autoApply = true
}: SmartLanguageSelectorProps) {
  const [hasAutoApplied, setHasAutoApplied] = useState(false)
  const [showDetectionBanner, setShowDetectionBanner] = useState(false)
  
  const {
    detectedLanguage,
    detectedCountry,
    isDetecting,
    hasDetected,
    confidence,
    isHighConfidence,
    shouldAutoApply,
    marketPriority
  } = useAutoLocalization()

  // Auto-application de la langue détectée
  useEffect(() => {
    if (
      autoApply && 
      !hasAutoApplied && 
      detectedLanguage && 
      shouldAutoApply &&
      detectedLanguage !== selectedLanguage
    ) {
      // Ne pas appliquer automatiquement si l'utilisateur a déjà fait un choix manuel
      const hasManualChoice = localStorage.getItem('manual_language_choice')
      
      if (!hasManualChoice) {
        onLanguageChange(detectedLanguage)
        setShowDetectionBanner(true)
        setHasAutoApplied(true)
        
        // Sauvegarder que l'auto-détection a été appliquée
        localStorage.setItem('auto_language_applied', 'true')
        localStorage.setItem('auto_applied_language', detectedLanguage)
      }
    }
  }, [detectedLanguage, shouldAutoApply, hasAutoApplied, selectedLanguage, onLanguageChange, autoApply])

  // Gérer le choix manuel (override auto-détection)
  const handleManualLanguageChange = (language: AnalysisLanguage) => {
    onLanguageChange(language)
    setShowDetectionBanner(false)
    
    // Marquer qu'un choix manuel a été fait
    localStorage.setItem('manual_language_choice', 'true')
    localStorage.setItem('manual_chosen_language', language)
  }

  // Revenir à la langue auto-détectée
  const revertToDetected = () => {
    if (detectedLanguage) {
      onLanguageChange(detectedLanguage)
      setShowDetectionBanner(true)
      
      // Retirer le flag de choix manuel
      localStorage.removeItem('manual_language_choice')
      localStorage.setItem('auto_language_applied', 'true')
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner de détection automatique */}
      {showAutoDetection && showDetectionBanner && detectedLanguage && isHighConfidence && (
        <div className="glass-card p-4 border border-neon-cyan/50 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌍</span>
              <div>
                <h4 className="text-neon-cyan font-semibold text-sm">
                  Langue détectée automatiquement
                </h4>
                <p className="text-text-muted text-xs">
                  {detectedCountry && `Depuis ${detectedCountry} • `}
                  Confiance: {confidence}%
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetectionBanner(false)}
              className="text-text-muted hover:text-text-white text-sm"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Indicateur de détection en cours */}
      {showAutoDetection && isDetecting && (
        <div className="glass-card p-3 border border-cosmic-glassborder animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="spinner-neon w-4 h-4"></div>
            <span className="text-text-muted text-sm">
              Détection automatique de votre région...
            </span>
          </div>
        </div>
      )}

      {/* Suggestion intelligente si pas auto-appliqué */}
      {showAutoDetection && hasDetected && detectedLanguage && !hasAutoApplied && selectedLanguage !== detectedLanguage && isHighConfidence && (
        <div className="glass-card p-4 border border-neon-pink/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-neon-pink font-semibold text-sm">
                  Suggestion : {detectedLanguage === 'en' ? 'English' : 
                                detectedLanguage === 'es' ? 'Español' : 
                                detectedLanguage === 'de' ? 'Deutsch' : 
                                detectedLanguage === 'it' ? 'Italiano' : 
                                detectedLanguage === 'pt' ? 'Português' : 'Français'}
                </h4>
                <p className="text-text-muted text-xs">
                  Basé sur votre localisation{detectedCountry && ` (${detectedCountry})`}
                </p>
              </div>
            </div>
            <button
              onClick={revertToDetected}
              className="btn-neon-pink text-xs px-3 py-1"
            >
              Utiliser
            </button>
          </div>
        </div>
      )}

      {/* Sélecteur de langue principal */}
      <LanguageSelector 
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleManualLanguageChange}
      />

      {/* Stats de marché pour debug (développement uniquement) */}
      {process.env.NODE_ENV === 'development' && detectedLanguage && (
        <div className="glass-card p-3 border border-cosmic-glassborder/50 opacity-70">
          <div className="text-xs text-text-muted space-y-1">
            <div>🎯 Marché détecté: {detectedLanguage.toUpperCase()} (priorité: {marketPriority})</div>
            <div>📍 Pays: {detectedCountry || 'Inconnu'}</div>
            <div>🎲 Confiance: {confidence}% {isHighConfidence ? '(Élevée)' : '(Faible)'}</div>
            <div>🤖 Auto-appliqué: {hasAutoApplied ? 'Oui' : 'Non'}</div>
          </div>
        </div>
      )}
    </div>
  )
}