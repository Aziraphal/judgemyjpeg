/**
 * Cookie Consent Banner
 * Banner RGPD-compliant pour la gestion du consentement aux cookies
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { useLanguage } from '@/contexts/LanguageContext'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  personalization: boolean
  social: boolean
}

export default function CookieConsent() {
  const { t } = useLanguage()
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    personalization: false,
    social: false
  })

  // Function to open settings from external trigger
  const openSettings = () => {
    setShowSettings(true)
    // If user hasn't seen banner, show current preferences
    if (!showBanner) {
      const consent = localStorage.getItem('cookie-consent')
      if (consent) {
        try {
          const saved = JSON.parse(consent)
          setPreferences(saved)
        } catch (e) {
          // Keep default preferences
        }
      }
    }
  }

  // Expose function globally for footer link
  useEffect(() => {
    (window as any).openCookieSettings = openSettings
    return () => {
      delete (window as any).openCookieSettings
    }
  }, [])

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem('cookie-consent')
    const consentDate = localStorage.getItem('cookie-consent-date')
    
    if (!consent || !consentDate) {
      setShowBanner(true)
    } else {
      // Vérifier si le consentement a plus de 13 mois
      const consentAge = Date.now() - parseInt(consentDate)
      const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000
      
      if (consentAge > thirteenMonths) {
        setShowBanner(true)
        localStorage.removeItem('cookie-consent')
        localStorage.removeItem('cookie-consent-date')
      } else {
        // Charger les préférences existantes
        try {
          const saved = JSON.parse(consent)
          setPreferences(saved)
        } catch (e) {
          setShowBanner(true)
        }
      }
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', Date.now().toString())
    
    // Appliquer les préférences
    applyCookiePreferences(prefs)
    
    setShowBanner(false)
    setShowSettings(false)
  }

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Update Google Consent Mode v2 with comprehensive consent settings
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const consentUpdate = {
        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
        'ad_storage': 'denied', // Never granted - no advertising
        'ad_user_data': 'denied', // Never granted - no advertising
        'ad_personalization': 'denied', // Never granted - no advertising
        'functionality_storage': prefs.personalization ? 'granted' : 'denied',
        'personalization_storage': prefs.personalization ? 'granted' : 'denied',
        'security_storage': 'granted' // Always granted for security
      }
      
      ;(window as any).gtag('consent', 'update', consentUpdate)
      
      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Cookie preferences applied:', { prefs, consentUpdate })
      }
    }

    // Personnalisation - Local storage management
    if (prefs.personalization) {
      localStorage.setItem('personalization-enabled', 'true')
    } else {
      localStorage.removeItem('personalization-enabled')
    }

    // Réseaux sociaux - Cleanup if disabled
    if (!prefs.social) {
      // Supprimer les cookies de réseaux sociaux potentiels
      const socialCookies = ['_fbp', '_fbc', 'fr', '__ar_v4', '_twitter_sess', 'guest_id']
      socialCookies.forEach(cookie => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      personalization: true,
      social: true
    }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
  }

  const rejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      personalization: false,
      social: false
    }
    setPreferences(onlyNecessary)
    saveConsent(onlyNecessary)
  }

  const saveCustomPreferences = () => {
    saveConsent(preferences)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      )}

      {/* Banner principal - FOND GRIS + ÉCRITURE BLANCHE */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/98 border-t-2 border-gray-600 shadow-lg z-50">
          <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              
              {/* Contenu */}
              <div className="flex-1">
                <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl flex-shrink-0">🍪</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                      🍪 {t.cookies.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200">
                      {t.cookies.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-white bg-gray-600 hover:bg-gray-500 border border-gray-500 rounded transition-colors whitespace-nowrap"
                >
                  ⚙️ {t.cookies.customize}
                </button>
                <button
                  onClick={rejectOptional}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-600 text-white border border-gray-500 rounded hover:bg-gray-500 transition-colors whitespace-nowrap"
                >
                  🛡️ {t.cookies.necessaryOnly}
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-green-600 text-white border border-green-500 rounded hover:bg-green-700 transition-colors font-semibold whitespace-nowrap"
                >
                  ✅ {t.cookies.acceptAll}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de paramétrage détaillé - FOND GRIS + ÉCRITURE BLANCHE */}
      {showSettings && (
        <div className="fixed inset-4 bg-gray-800/98 rounded-xl border-2 border-gray-600 z-50 overflow-auto shadow-2xl">
          <div className="p-6 h-full flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-600">
              <div>
                <h2 className="text-xl font-bold text-white">{t.cookies.settingsTitle}</h2>
                <p className="text-sm text-gray-300">
                  {t.cookies.description}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-300 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-auto">
              
              {/* Cookies Nécessaires */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">🔧 {t.cookies.necessary}</h3>
                  <div className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-xs">
                    {t.cookies.necessaryAlways}
                  </div>
                </div>
                <p className="text-sm text-gray-200 mb-2">
                  {t.cookies.necessaryDesc}
                </p>
              </div>

              {/* Cookies Analytics */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">📊 {t.cookies.analytics}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-200 mb-2">
                  {t.cookies.analyticsDesc}
                </p>
              </div>

              {/* Cookies Personnalisation */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">🎨 {t.cookies.personalization}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={(e) => setPreferences({...preferences, personalization: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-200 mb-2">
                  {t.cookies.personalizationDesc}
                </p>
              </div>

              {/* Cookies Réseaux Sociaux */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">📱 {t.cookies.social}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.social}
                      onChange={(e) => setPreferences({...preferences, social: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-200 mb-2">
                  {t.cookies.socialDesc}
                </p>
              </div>

              {/* Information importante */}
              <div className="bg-blue-800/30 border border-blue-500 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">ℹ️ {t.cookies.importantInfo}</h4>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-600">
              <div className="text-xs text-gray-300">
                <Link href="/legal/cookies" className="text-blue-400 hover:underline">
                  {t.footer.cookies}
                </Link>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={rejectOptional}
                  className="px-4 py-2 text-sm bg-red-600 text-white border border-red-500 rounded hover:bg-red-700 transition-colors"
                >
                  {t.cookies.necessaryOnly}
                </button>
                <button
                  onClick={saveCustomPreferences}
                  className="px-6 py-2 text-sm bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700 transition-colors font-semibold"
                >
                  {t.cookies.save}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}