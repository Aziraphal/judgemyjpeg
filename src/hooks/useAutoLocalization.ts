/**
 * Hook pour la localisation automatique basée sur la géolocalisation
 * Détecte automatiquement la langue préférée de l'utilisateur selon sa localisation
 */

import { useState, useEffect } from 'react'
import type { AnalysisLanguage } from '@/types/analysis'
import { logger } from '@/lib/logger'

interface LocationData {
  country: string
  countryCode: string
  city?: string
  region?: string
}

interface AutoLocalizationState {
  detectedLanguage: AnalysisLanguage | null
  detectedCountry: string | null
  isDetecting: boolean
  hasDetected: boolean
  confidence: number // 0-100, confidence dans la détection
}

// Mapping pays -> langue préférée
const COUNTRY_LANGUAGE_MAP: Record<string, AnalysisLanguage> = {
  // Anglophone
  'US': 'en', 'GB': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en',
  'ZA': 'en', 'IN': 'en', 'SG': 'en', 'MY': 'en', 'PH': 'en',
  
  // Espagnole
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es',
  'CL': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es',
  'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es',
  'UY': 'es', 'GQ': 'es',
  
  // Allemande
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  
  // Italienne
  'IT': 'it', 'SM': 'it', 'VA': 'it',
  
  // Portugaise
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt', 'GW': 'pt', 'CV': 'pt',
  'ST': 'pt', 'TL': 'pt',
  
  // Française (par défaut pour certains pays francophones)
  'FR': 'fr', 'BE': 'fr', 'MC': 'fr', 'SN': 'fr', 'CI': 'fr', 'MA': 'fr', 'TN': 'fr', 'DZ': 'fr',
  
  // Pays multilingues - priorité par taille de marché
  'CH': 'de', // Suisse: allemand prioritaire
  'LU': 'fr', // Luxembourg: français prioritaire  
  'CA': 'en'  // Canada: anglais prioritaire
}

// Priorité des langues par taille de marché
const LANGUAGE_PRIORITY: Record<AnalysisLanguage, number> = {
  'en': 100, // Anglais = marché le plus large
  'es': 90,  // Espagnol = 2e marché
  'fr': 80,  // Français = marché initial
  'de': 70,  // Allemagne = marché premium
  'pt': 60,  // Portugais/Brésil = croissance
  'it': 50   // Italien = niche
}

export function useAutoLocalization() {
  const [state, setState] = useState<AutoLocalizationState>({
    detectedLanguage: null,
    detectedCountry: null,
    isDetecting: false,
    hasDetected: false,
    confidence: 0
  })

  // Fonction pour détecter via IP géolocalisation (gratuit)
  const detectLocationByIP = async (): Promise<LocationData | null> => {
    try {
      // Utilise notre propre API qui peut accéder aux headers Cloudflare
      const response = await fetch('/api/detect-location', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          region: data.region
        }
      }
    } catch (error) {
      logger.debug('IP geolocation failed:', error)
    }
    return null
  }

  // Fonction pour détecter via browser language (fallback)
  const detectLanguageFromBrowser = (): AnalysisLanguage => {
    if (typeof navigator !== 'undefined') {
      // Récupère la langue préférée du navigateur
      const browserLang = navigator.language || (navigator as any).userLanguage
      const langCode = browserLang.split('-')[0].toLowerCase()
      
      // Mappe vers nos langues supportées
      switch (langCode) {
        case 'en': return 'en'
        case 'es': return 'es' 
        case 'de': return 'de'
        case 'it': return 'it'
        case 'pt': return 'pt'
        case 'fr': 
        default: return 'fr' // Français par défaut
      }
    }
    return 'fr' // Fallback si pas de navigateur
  }

  // Fonction principale de détection
  const detectLanguage = async () => {
    setState(prev => ({ ...prev, isDetecting: true }))

    try {
      // 1. Vérifier si déjà en cache (localStorage)
      const cachedLanguage = localStorage.getItem('auto_detected_language')
      const cachedCountry = localStorage.getItem('auto_detected_country')
      const cacheTimestamp = localStorage.getItem('auto_detection_timestamp')
      
      // Cache valide pendant 24h
      if (cachedLanguage && cachedCountry && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp)
        if (cacheAge < 24 * 60 * 60 * 1000) {
          setState({
            detectedLanguage: cachedLanguage as AnalysisLanguage,
            detectedCountry: cachedCountry,
            isDetecting: false,
            hasDetected: true,
            confidence: 85 // Cache = bonne confidence
          })
          return cachedLanguage as AnalysisLanguage
        }
      }

      // 2. Essayer la géolocalisation IP
      const locationData = await detectLocationByIP()
      
      if (locationData?.countryCode) {
        const detectedLang = COUNTRY_LANGUAGE_MAP[locationData.countryCode]
        
        if (detectedLang) {
          // Sauvegarder en cache
          localStorage.setItem('auto_detected_language', detectedLang)
          localStorage.setItem('auto_detected_country', locationData.country)
          localStorage.setItem('auto_detection_timestamp', Date.now().toString())
          
          const confidence = 95 // IP géolocalisation = très fiable
          
          setState({
            detectedLanguage: detectedLang,
            detectedCountry: locationData.country,
            isDetecting: false,
            hasDetected: true,
            confidence
          })
          
          logger.info('Auto-localization success:', {
            country: locationData.country,
            language: detectedLang,
            confidence
          })
          
          return detectedLang
        }
      }

      // 3. Fallback: langue du navigateur
      const browserLang = detectLanguageFromBrowser()
      
      setState({
        detectedLanguage: browserLang,
        detectedCountry: 'Unknown',
        isDetecting: false,
        hasDetected: true,
        confidence: 60 // Browser lang = confidence moyenne
      })
      
      logger.info('Auto-localization fallback to browser:', {
        language: browserLang,
        confidence: 60
      })
      
      return browserLang

    } catch (error) {
      logger.error('Auto-localization failed:', error)
      
      // En cas d'erreur complète, fallback français
      setState({
        detectedLanguage: 'fr',
        detectedCountry: null,
        isDetecting: false,
        hasDetected: false,
        confidence: 20
      })
      
      return 'fr'
    }
  }

  // Fonction pour forcer une nouvelle détection
  const refreshDetection = () => {
    localStorage.removeItem('auto_detected_language')
    localStorage.removeItem('auto_detected_country') 
    localStorage.removeItem('auto_detection_timestamp')
    detectLanguage()
  }

  // Auto-détection au montage du hook
  useEffect(() => {
    detectLanguage()
  }, [])

  return {
    ...state,
    detectLanguage,
    refreshDetection,
    // Helpers
    isHighConfidence: state.confidence >= 80,
    shouldAutoApply: state.confidence >= 70,
    marketPriority: state.detectedLanguage ? LANGUAGE_PRIORITY[state.detectedLanguage] : 0
  }
}