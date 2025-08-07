/**
 * Cookie Consent Banner
 * Banner RGPD-compliant pour la gestion du consentement aux cookies
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  personalization: boolean
  social: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    personalization: false,
    social: false
  })

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
    // Analytics (Google Analytics)
    if (prefs.analytics) {
      // Activer Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    } else {
      // Désactiver Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }

    // Personnalisation
    if (prefs.personalization) {
      localStorage.setItem('personalization-enabled', 'true')
    } else {
      localStorage.removeItem('personalization-enabled')
    }

    // Réseaux sociaux
    if (!prefs.social) {
      // Supprimer les cookies de réseaux sociaux
      const socialCookies = ['_fbp', '_fbc', 'fr', '__ar_v4']
      socialCookies.forEach(cookie => {
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

      {/* Banner principal */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 bg-cosmic-glass/95 backdrop-blur-md border-t border-cosmic-glassborder z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              
              {/* Contenu */}
              <div className="flex-1">
                <div className="flex items-start space-x-3 mb-4">
                  <span className="text-2xl">🍪</span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-white mb-2">
                      Gestion des cookies
                    </h3>
                    <p className="text-sm text-text-gray">
                      Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic. 
                      Les cookies essentiels au fonctionnement sont automatiquement acceptés.
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      En continuant, vous acceptez notre utilisation des cookies. 
                      Consultez notre{' '}
                      <Link href="/legal/cookies" className="text-neon-cyan hover:underline">
                        politique de cookies
                      </Link>{' '}
                      pour plus d'informations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded transition-colors"
                >
                  Personnaliser
                </button>
                <button
                  onClick={rejectOptional}
                  className="px-4 py-2 text-sm bg-red-600 text-white border border-red-500 rounded hover:bg-red-700 transition-colors"
                >
                  Refuser optionnels
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm bg-neon-cyan text-black border border-neon-cyan rounded hover:bg-neon-cyan/80 transition-colors font-semibold"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de paramétrage détaillé */}
      {showSettings && (
        <div className="fixed inset-4 bg-cosmic-glass/95 backdrop-blur-md rounded-xl border border-cosmic-glassborder z-50 overflow-auto">
          <div className="p-6 h-full flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-cosmic-glassborder">
              <div>
                <h2 className="text-xl font-bold text-text-white">Paramètres des cookies</h2>
                <p className="text-sm text-text-gray">
                  Choisissez les cookies que vous souhaitez autoriser
                </p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-text-gray hover:text-text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-auto">
              
              {/* Cookies Nécessaires */}
              <div className="bg-cosmic-glass/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-white">🔧 Cookies Nécessaires</h3>
                  <div className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-xs">
                    Toujours activé
                  </div>
                </div>
                <p className="text-sm text-text-gray mb-2">
                  Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                </p>
                <details className="text-xs text-text-muted">
                  <summary className="cursor-pointer hover:text-text-gray">Voir les détails</summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    <li>• Session utilisateur et authentification</li>
                    <li>• Protection CSRF et sécurité</li>
                    <li>• Panier d'achat et processus de paiement</li>
                    <li>• Préférences essentielles (langue, accessibilité)</li>
                  </ul>
                </details>
              </div>

              {/* Cookies Analytics */}
              <div className="bg-cosmic-glass/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-white">📊 Cookies Analytiques</h3>
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
                <p className="text-sm text-text-gray mb-2">
                  Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                </p>
                <details className="text-xs text-text-muted">
                  <summary className="cursor-pointer hover:text-text-gray">Voir les détails</summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    <li>• Google Analytics (données anonymisées)</li>
                    <li>• Statistiques de pages visitées</li>
                    <li>• Métriques de performance</li>
                    <li>• Analytics internes JudgeMyJPEG</li>
                  </ul>
                </details>
              </div>

              {/* Cookies Personnalisation */}
              <div className="bg-cosmic-glass/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-white">🎨 Cookies de Personnalisation</h3>
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
                <p className="text-sm text-text-gray mb-2">
                  Mémorisent vos préférences pour personnaliser votre expérience.
                </p>
                <details className="text-xs text-text-muted">
                  <summary className="cursor-pointer hover:text-text-gray">Voir les détails</summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    <li>• Mode d'analyse préféré (Pro/Cassant)</li>
                    <li>• Langue d'interface</li>
                    <li>• Thème et préférences visuelles</li>
                    <li>• Recommandations personnalisées</li>
                  </ul>
                </details>
              </div>

              {/* Cookies Réseaux Sociaux */}
              <div className="bg-cosmic-glass/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-white">📱 Cookies Réseaux Sociaux</h3>
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
                <p className="text-sm text-text-gray mb-2">
                  Permettent le partage de contenu sur les réseaux sociaux.
                </p>
                <details className="text-xs text-text-muted">
                  <summary className="cursor-pointer hover:text-text-gray">Voir les détails</summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    <li>• Boutons de partage Twitter/X</li>
                    <li>• Intégrations Facebook</li>
                    <li>• Partage LinkedIn</li>
                    <li>• Widgets sociaux intégrés</li>
                  </ul>
                </details>
              </div>

              {/* Information importante */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">ℹ️ Information importante</h4>
                <ul className="text-xs text-text-gray space-y-1">
                  <li>• Vos préférences sont conservées 13 mois</li>
                  <li>• Vous pouvez les modifier à tout moment</li>
                  <li>• La désactivation peut limiter certaines fonctionnalités</li>
                  <li>• Les données sont traitées conformément au RGPD</li>
                </ul>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-cosmic-glassborder">
              <div className="text-xs text-text-muted">
                <Link href="/legal/cookies" className="text-neon-cyan hover:underline">
                  Politique complète des cookies
                </Link>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={rejectOptional}
                  className="px-4 py-2 text-sm bg-red-600/20 text-red-300 border border-red-500/30 rounded hover:bg-red-600/30 transition-colors"
                >
                  Refuser optionnels
                </button>
                <button
                  onClick={saveCustomPreferences}
                  className="px-6 py-2 text-sm bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded hover:bg-neon-cyan/30 transition-colors font-semibold"
                >
                  Enregistrer mes choix
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}