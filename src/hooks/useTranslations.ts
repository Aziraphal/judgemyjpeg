import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

// Types pour les traductions
export interface Translations {
  nav: {
    analyze: string
    gallery: string  
    dashboard: string
    pricing: string
    faq: string
    login: string
    logout: string
    signup: string
  }
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    close: string
    save: string
    delete: string
    edit: string
  }
  analyze: {
    title: string
    upload_prompt: string
    upload_click: string
    analyzing: string
    analyses_remaining: string
    analyses_unlimited: string
    limit_reached: string
    last_analysis: string
    upgrade: string
  }
  pricing: {
    free_plan: string
    premium_plan: string
    annual_plan: string
    per_month: string
    per_year: string
    free_analyses: string
    unlimited_analyses: string
    choose_plan: string
    current_plan: string
    popular: string
    best_value: string
  }
  disclaimer: {
    title: string
    message: string
    creativity: string
    art_truth: string
    inspiration: string
  }
  footer: {
    made_with: string
    in_france: string
    legal: string
    privacy: string
    terms: string
    contact: string
  }
}

// Configuration des devises - Euro partout pour simplicité
export const CURRENCY_CONFIG = {
  fr: { symbol: '€', code: 'EUR', position: 'after' },
  en: { symbol: '€', code: 'EUR', position: 'after' },
  es: { symbol: '€', code: 'EUR', position: 'after' },
  de: { symbol: '€', code: 'EUR', position: 'after' },
  it: { symbol: '€', code: 'EUR', position: 'after' },
  pt: { symbol: '€', code: 'EUR', position: 'after' },
} as const

// Hook principal
export function useTranslations() {
  const router = useRouter()
  const { locale = 'fr' } = router
  const [translations, setTranslations] = useState<Translations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTranslations(locale as string)
  }, [locale])

  const loadTranslations = async (currentLocale: string) => {
    try {
      // Import dynamique des traductions
      const translations = await import(`../../locales/${currentLocale}/common.json`)
      setTranslations(translations.default)
    } catch (error) {
      console.error(`Failed to load translations for ${currentLocale}:`, error)
      // Fallback vers le français
      try {
        const fallbackTranslations = await import('../../locales/fr/common.json')
        setTranslations(fallbackTranslations.default)
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour formater les prix - Euro partout
  const formatPrice = (price: number, period?: 'month' | 'year') => {
    const periodText = translations ? 
      (period === 'month' ? translations.pricing.per_month : 
       period === 'year' ? translations.pricing.per_year : '') : ''

    // Format français pour tous (virgule décimale)
    return `${price.toFixed(2).replace('.', ',')}€${periodText}`
  }

  // Fonction pour interpoler les variables dans les traductions
  const t = (key: string, variables?: Record<string, string | number>): string => {
    if (!translations) return key

    // Navigation dans l'objet de traductions
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    // Interpolation des variables
    if (variables) {
      return value.replace(/\{(\w+)\}/g, (match: string, varName: string) => {
        return variables[varName]?.toString() || match
      })
    }

    return value
  }

  return {
    t,
    translations,
    locale: locale as string,
    loading,
    formatPrice,
    currency: CURRENCY_CONFIG[locale as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.fr,
    changeLanguage: (newLocale: string) => {
      router.push(router.pathname, router.asPath, { locale: newLocale })
    }
  }
}

// Hook simplifié pour les cas basiques
export function useT() {
  const { t } = useTranslations()
  return t
}