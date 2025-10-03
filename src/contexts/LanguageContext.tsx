/**
 * Contexte global pour la langue de l'interface
 * Permet de partager la langue détectée/choisie dans toute l'app
 */

import { createContext, useContext, ReactNode } from 'react'
import type { AnalysisLanguage } from '@/types/analysis'
import { useTranslation } from '@/hooks/useTranslation'
import { Translations } from '@/lib/translations'

interface LanguageContextType {
  t: Translations
  language: AnalysisLanguage
  setLanguage: (lang: AnalysisLanguage) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const translation = useTranslation()

  return (
    <LanguageContext.Provider value={translation}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
