/**
 * Hook pour synchroniser i18next avec le système de détection auto
 * Combine la détection géolocalisée avec i18next
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAutoLocalization } from './useAutoLocalization'
import { AnalysisLanguage } from '@/components/LanguageSelector'

export function useLanguageSync() {
  const { i18n } = useTranslation()
  const { detectedLanguage, confidence } = useAutoLocalization()

  useEffect(() => {
    // Vérifier si l'utilisateur a fait un choix manuel
    const manualChoice = localStorage.getItem('manual_language_choice')
    const manualLanguage = localStorage.getItem('manual_chosen_language')

    if (manualChoice && manualLanguage) {
      // Choix manuel prioritaire
      if (i18n.language !== manualLanguage) {
        i18n.changeLanguage(manualLanguage)
      }
      return
    }

    // Utiliser la détection géo si confiance ≥ 60%
    if (detectedLanguage && confidence >= 60) {
      // Mapper vers les codes i18next (qui utilise 'en' pas 'en-US')
      const langCode = detectedLanguage.split('-')[0] as AnalysisLanguage

      if (i18n.language !== langCode) {
        i18n.changeLanguage(langCode)
        // Sauvegarder pour i18next
        localStorage.setItem('i18nextLng', langCode)
      }
    }
  }, [detectedLanguage, confidence, i18n])

  // Fonction pour changer manuellement la langue
  const changeLanguage = (lang: AnalysisLanguage) => {
    i18n.changeLanguage(lang)

    // Marquer comme choix manuel
    localStorage.setItem('manual_language_choice', 'true')
    localStorage.setItem('manual_chosen_language', lang)
    localStorage.setItem('i18nextLng', lang)
  }

  return {
    currentLanguage: i18n.language as AnalysisLanguage,
    changeLanguage,
    isReady: i18n.isInitialized
  }
}