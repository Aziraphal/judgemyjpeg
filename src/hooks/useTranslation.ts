/**
 * Hook pour utiliser le système de traductions avec détection automatique
 */

import { useState, useEffect } from 'react'
import type { AnalysisLanguage } from '@/types/analysis'
import { translations, Translations } from '@/lib/translations'
import { useAutoLocalization } from './useAutoLocalization'

export function useTranslation(forceLanguage?: AnalysisLanguage): {
  t: Translations
  language: AnalysisLanguage
  setLanguage: (lang: AnalysisLanguage) => void
} {
  const { detectedLanguage, shouldAutoApply } = useAutoLocalization()
  const [currentLanguage, setCurrentLanguage] = useState<AnalysisLanguage>('fr')

  // Déterminer la langue à utiliser
  useEffect(() => {
    if (forceLanguage) {
      setCurrentLanguage(forceLanguage)
    } else {
      // Vérifier si l'utilisateur a fait un choix manuel
      const manualChoice = localStorage.getItem('manual_language_choice')
      const manualLanguage = localStorage.getItem('manual_chosen_language') as AnalysisLanguage
      
      if (manualChoice && manualLanguage) {
        setCurrentLanguage(manualLanguage)
      } else if (detectedLanguage && shouldAutoApply) {
        setCurrentLanguage(detectedLanguage)
      } else {
        setCurrentLanguage('fr') // Fallback
      }
    }
  }, [forceLanguage, detectedLanguage, shouldAutoApply])

  const setLanguage = (lang: AnalysisLanguage) => {
    setCurrentLanguage(lang)
    // Sauvegarder le choix manuel
    localStorage.setItem('manual_language_choice', 'true')
    localStorage.setItem('manual_chosen_language', lang)
  }

  return {
    t: translations[currentLanguage] || translations.fr,
    language: currentLanguage,
    setLanguage
  }
}