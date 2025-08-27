/**
 * PWA Manager
 * Gestion de l'installation, mise à jour et fonctionnalités PWA
 */

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

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

  useEffect(() => {
    // Détecter si l'app est installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true
    setIsInstalled(isStandalone)

    // État de connexion
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Événement d'installation PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      
      // Banner auto supprimée - trop intrusive
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Événement après installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallBanner(false)
      
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
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
  }, [isInstalled])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      logger.debug('[PWA] Service Worker enregistré:', registration.scope)

      // Écouter les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        }
      })

      // Contrôler immédiatement si nouveau SW
      if (registration.waiting) {
        setUpdateAvailable(true)
      }

    } catch (error) {
      logger.error('[PWA] Erreur enregistrement SW:', error)
    }
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        logger.debug('[PWA] Installation acceptée')
      } else {
        logger.debug('[PWA] Installation refusée')
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
      }

      setDeferredPrompt(null)
      setIsInstallable(false)
      setShowInstallBanner(false)

    } catch (error) {
      logger.error('[PWA] Erreur installation:', error)
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

      {/* Banner d'installation PWA SUPPRIMÉE - trop intrusive */}
      {/* Possibilité d'installation disponible via menu utilisateur si nécessaire */}

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
            (registration as any).sync?.register('photo-analysis-queue')
          })
        }
      }

      return analysisData.id
    } catch (error) {
      logger.error('[PWA] Erreur queue analysis:', error)
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