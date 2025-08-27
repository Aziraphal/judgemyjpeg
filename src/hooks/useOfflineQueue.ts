/**
 * Hook pour gérer la file d'attente hors ligne
 * Utilise IndexedDB pour stocker les actions en attente
 */

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'

interface QueueItem {
  id: string
  type: 'photo_analysis' | 'user_action'
  data: any
  timestamp: number
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface OfflineQueueHook {
  isOnline: boolean
  queueSize: number
  addToQueue: (type: QueueItem['type'], data: any) => Promise<string>
  removeFromQueue: (id: string) => Promise<void>
  getQueueItems: () => Promise<QueueItem[]>
  processQueue: () => Promise<void>
  clearQueue: () => Promise<void>
}

const DB_NAME = 'JudgeMyJPEGOfflineQueue'
const DB_VERSION = 1
const STORE_NAME = 'queue'

export function useOfflineQueue(): OfflineQueueHook {
  const [isOnline, setIsOnline] = useState(true)
  const [queueSize, setQueueSize] = useState(0)
  const [db, setDb] = useState<IDBDatabase | null>(null)

  // Initialiser IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result
          
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
            store.createIndex('status', 'status', { unique: false })
            store.createIndex('type', 'type', { unique: false })
            store.createIndex('timestamp', 'timestamp', { unique: false })
          }
        }

        request.onsuccess = (event) => {
          const database = (event.target as IDBOpenDBRequest).result
          setDb(database)
          updateQueueSize(database)
        }

        request.onerror = (event) => {
          logger.error('[Queue] Erreur ouverture IndexedDB:', event)
        }
      } catch (error) {
        logger.error('[Queue] Erreur initialisation IndexedDB:', error)
      }
    }

    initDB()
  }, [])

  // Surveiller l'état de connexion
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      // Traiter la queue quand on revient en ligne
      if (online && db) {
        processQueue()
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [db])

  const updateQueueSize = async (database: IDBDatabase) => {
    try {
      const transaction = database.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const countRequest = store.count()
      
      countRequest.onsuccess = () => {
        setQueueSize(countRequest.result)
      }
    } catch (error) {
      logger.error('[Queue] Erreur mise à jour taille queue:', error)
    }
  }

  const addToQueue = useCallback(async (type: QueueItem['type'], data: any): Promise<string> => {
    if (!db) throw new Error('Base de données non initialisée')

    const item: QueueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    }

    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      await new Promise<void>((resolve, reject) => {
        const request = store.add(item)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      updateQueueSize(db)
      
      // Essayer de traiter immédiatement si en ligne
      if (isOnline) {
        setTimeout(() => processQueue(), 1000)
      }

      return item.id
    } catch (error) {
      logger.error('[Queue] Erreur ajout à la queue:', error)
      throw error
    }
  }, [db, isOnline])

  const removeFromQueue = useCallback(async (id: string): Promise<void> => {
    if (!db) return

    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      updateQueueSize(db)
    } catch (error) {
      logger.error('[Queue] Erreur suppression de la queue:', error)
      throw error
    }
  }, [db])

  const getQueueItems = useCallback(async (): Promise<QueueItem[]> => {
    if (!db) return []

    try {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      
      return new Promise((resolve, reject) => {
        const request = index.getAll()
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      logger.error('[Queue] Erreur récupération queue:', error)
      return []
    }
  }, [db])

  const processQueue = useCallback(async (): Promise<void> => {
    if (!db || !isOnline) return

    try {
      const items = await getQueueItems()
      const pendingItems = items.filter(item => 
        item.status === 'pending' && item.retryCount < 3
      )

      logger.debug(`[Queue] Traitement de ${pendingItems.length} éléments`)

      for (const item of pendingItems) {
        try {
          // Marquer comme en traitement
          await updateItemStatus(item.id, 'processing')

          let success = false

          // Traiter selon le type
          switch (item.type) {
            case 'photo_analysis':
              success = await processPhotoAnalysis(item)
              break
            case 'user_action':
              success = await processUserAction(item)
              break
            default:
              logger.warn(`[Queue] Type inconnu: ${item.type}`)
              success = false
          }

          if (success) {
            await updateItemStatus(item.id, 'completed')
            // Supprimer après succès
            setTimeout(() => removeFromQueue(item.id), 5000)
          } else {
            await incrementRetryCount(item.id)
          }

        } catch (error) {
          logger.error(`[Queue] Erreur traitement item ${item.id}:`, error)
          await incrementRetryCount(item.id)
        }
      }
    } catch (error) {
      logger.error('[Queue] Erreur traitement queue:', error)
    }
  }, [db, isOnline, getQueueItems, removeFromQueue])

  const updateItemStatus = async (id: string, status: QueueItem['status']) => {
    if (!db) return

    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.status = status
          store.put(item)
        }
      }
    } catch (error) {
      logger.error('[Queue] Erreur mise à jour statut:', error)
    }
  }

  const incrementRetryCount = async (id: string) => {
    if (!db) return

    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.retryCount += 1
          item.status = item.retryCount >= 3 ? 'failed' : 'pending'
          store.put(item)
        }
      }
    } catch (error) {
      logger.error('[Queue] Erreur incrément retry:', error)
    }
  }

  const processPhotoAnalysis = async (item: QueueItem): Promise<boolean> => {
    try {
      const { formData } = item.data

      const response = await fetch('/api/photos/analyze', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Déclencher une notification de succès
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Analyse terminée !', {
            body: 'Votre photo a été analysée avec succès',
            icon: '/icon-192x192.png',
            tag: 'analysis-complete'
          })
        }

        // Déclencher un événement personnalisé pour mettre à jour l'UI
        window.dispatchEvent(new CustomEvent('analysisComplete', {
          detail: { result, queueItemId: item.id }
        }))

        return true
      }

      return false
    } catch (error) {
      logger.error('[Queue] Erreur analyse photo:', error)
      return false
    }
  }

  const processUserAction = async (item: QueueItem): Promise<boolean> => {
    try {
      const { endpoint, method, data } = item.data

      const response = await fetch(endpoint, {
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(15000)
      })

      return response.ok
    } catch (error) {
      logger.error('[Queue] Erreur action utilisateur:', error)
      return false
    }
  }

  const clearQueue = useCallback(async (): Promise<void> => {
    if (!db) return

    try {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      setQueueSize(0)
    } catch (error) {
      logger.error('[Queue] Erreur nettoyage queue:', error)
      throw error
    }
  }, [db])

  return {
    isOnline,
    queueSize,
    addToQueue,
    removeFromQueue,
    getQueueItems,
    processQueue,
    clearQueue
  }
}