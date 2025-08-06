/**
 * PWA Manager
 * Gestion de l'installation, mise à jour et fonctionnalités PWA
 */

import { useState, useEffect } from 'react'
import { useAccessibility } from './AccessibilityProvider'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    // Détecter si l'app est installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true
    setIsInstalled(isStandalone)

    // État de connexion
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      announceToScreenReader(online ? 'Connexion rétablie' : 'Mode hors ligne activé')
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Événement d'installation PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      
      // Afficher banner après 30 secondes si pas installé
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallBanner(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Événement après installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallBanner(false)
      announceToScreenReader('Application installée avec succès')
      
      // Analytics
      if (typeof gtag !== 'undefined') {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'App Installed'
        })
      }
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Enregistrement du Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [announceToScreenReader, isInstalled])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('[PWA] Service Worker enregistré:', registration.scope)

      // Écouter les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
              announceToScreenReader('Mise à jour de l\'application disponible')
            }
          })
        }
      })

      // Contrôler immédiatement si nouveau SW
      if (registration.waiting) {
        setUpdateAvailable(true)
      }

    } catch (error) {
      console.error('[PWA] Erreur enregistrement SW:', error)
    }
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('[PWA] Installation acceptée')
        announceToScreenReader('Installation de l\'application en cours')
      } else {
        console.log('[PWA] Installation refusée')
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
      }

      setDeferredPrompt(null)
      setIsInstallable(false)
      setShowInstallBanner(false)

    } catch (error) {
      console.error('[PWA] Erreur installation:', error)
    }
  }

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  const dismissInstallBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const addToHomeScreen = () => {
    // iOS Safari fallback
    if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      announceToScreenReader('Pour installer: tapez sur Partager puis Ajouter à l\'écran d\'accueil')
      alert('Pour installer JudgeMyJPEG:\n1. Tapez sur l\'icône Partager (carré avec flèche)\n2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n3. Tapez "Ajouter"')
    } else {
      handleInstallClick()
    }
  }

  // Ne rien afficher si pas de fonctionnalité PWA
  if (!isInstallable && !updateAvailable && !showInstallBanner && isOnline) {
    return null
  }

  return (
    <>
      {/* Badge de statut en ligne/hors ligne */}
      {!isOnline && (
        <div className="fixed top-16 left-4 right-4 z-50">
          <div className="bg-yellow-900/90 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-3 flex items-center justify-center">
            <span className="text-yellow-300 text-sm font-medium">
              <span aria-hidden="true">📡</span> Mode hors ligne - Fonctionnalités limitées
            </span>
          </div>
        </div>
      )}

      {/* Banner d'installation PWA */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-cosmic-glass/95 backdrop-blur-md border border-cosmic-glassborder rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-3">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2" aria-hidden="true">📱</span>
                  <h3 className="font-semibold text-text-white text-sm">
                    Installer JudgeMyJPEG
                  </h3>
                </div>
                <p className="text-xs text-text-gray mb-3">
                  Accès rapide, notifications et mode hors ligne disponibles
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={addToHomeScreen}
                    className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg text-xs font-medium hover:bg-neon-cyan/30 transition-colors focus-visible"
                    aria-label="Installer l'application JudgeMyJPEG"
                  >
                    Installer
                  </button>
                  <button
                    onClick={dismissInstallBanner}
                    className="px-3 py-2 text-text-muted hover:text-text-white text-xs transition-colors focus-visible"
                    aria-label="Fermer la bannière d'installation"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={dismissInstallBanner}
                className="text-text-muted hover:text-text-white transition-colors focus-visible p-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification de mise à jour */}
      {updateAvailable && (
        <div className="fixed top-20 right-4 z-50">
          <div className="bg-green-900/90 backdrop-blur-sm border border-green-500/30 rounded-lg p-3 max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-green-300 text-sm mb-1">
                  <span aria-hidden="true">🔄</span> Mise à jour disponible
                </h4>
                <p className="text-xs text-green-200 mb-3">
                  Une nouvelle version est prête à être installée
                </p>
                <button
                  onClick={handleUpdateClick}
                  className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-300 border border-green-500/30 rounded text-xs font-medium transition-colors focus-visible"
                  aria-label="Installer la mise à jour"
                >
                  Mettre à jour
                </button>
              </div>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-green-400 hover:text-green-300 transition-colors focus-visible p-1 ml-2"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'installation fixe (desktop) */}
      {isInstallable && !showInstallBanner && !isInstalled && (
        <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
          <button
            onClick={handleInstallClick}
            className="bg-neon-pink/20 backdrop-blur-sm border border-neon-pink/30 rounded-full p-4 hover:bg-neon-pink/30 transition-colors focus-visible group"
            title="Installer l'application"
            aria-label="Installer JudgeMyJPEG sur cet appareil"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block" aria-hidden="true">
              📲
            </span>
          </button>
        </div>
      )}
    </>
  )
}

// Hook pour fonctionnalités PWA
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true
      setIsInstalled(isStandalone)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    checkInstalled()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const queueAnalysis = async (formData: FormData) => {
    // Queue pour analyse hors ligne (utilisation IndexedDB)
    try {
      const analysisData = {
        id: Date.now().toString(),
        formData,
        timestamp: Date.now(),
        status: 'pending'
      }

      // Stocker dans IndexedDB
      const request = indexedDB.open('JudgeMyJPEGQueue', 1)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('analyses')) {
          db.createObjectStore('analyses', { keyPath: 'id' })
        }
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(['analyses'], 'readwrite')
        const store = transaction.objectStore('analyses')
        store.add(analysisData)

        // Registrer pour background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('photo-analysis-queue')
          })
        }
      }

      return analysisData.id
    } catch (error) {
      console.error('[PWA] Erreur queue analysis:', error)
      throw error
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  return {
    isOnline,
    isInstalled,
    queueAnalysis,
    requestNotificationPermission
  }
}