// Utilitaires IndexedDB pour le cache et la queue offline
interface AnalysisQueueItem {
  id: string
  timestamp: number
  formData: FormData
  metadata: {
    filename: string
    tone: string
    language: string
    size: number
  }
}

interface CachedAnalysis {
  id: string
  imageHash: string
  analysis: any
  tone: string
  language: string
  cached_at: number
  expires_at: number
}

class IndexedDBManager {
  private static instance: IndexedDBManager
  private db: IDBDatabase | null = null
  private dbName = 'JudgeMyJPEGDB'
  private version = 2

  private constructor() {}

  static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager()
    }
    return IndexedDBManager.instance
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve()
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur ouverture:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('✅ IndexedDB: Base initialisée')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store pour la queue d'analyses offline
        if (!db.objectStoreNames.contains('analysisQueue')) {
          const queueStore = db.createObjectStore('analysisQueue', { keyPath: 'id' })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Store pour le cache des analyses
        if (!db.objectStoreNames.contains('analysisCache')) {
          const cacheStore = db.createObjectStore('analysisCache', { keyPath: 'id' })
          cacheStore.createIndex('imageHash', 'imageHash', { unique: false })
          cacheStore.createIndex('expires_at', 'expires_at', { unique: false })
        }

        // Store pour les préférences utilisateur
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' })
        }

        console.log('🔧 IndexedDB: Schema mis à jour vers version', this.version)
      }
    })
  }

  // === QUEUE D'ANALYSES OFFLINE ===

  async addToAnalysisQueue(item: Omit<AnalysisQueueItem, 'id' | 'timestamp'>): Promise<string> {
    await this.initialize()
    
    const id = crypto.randomUUID()
    const queueItem: AnalysisQueueItem = {
      id,
      timestamp: Date.now(),
      ...item
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisQueue'], 'readwrite')
      const store = transaction.objectStore('analysisQueue')
      const request = store.add(queueItem)

      request.onsuccess = () => {
        console.log('📝 IndexedDB: Analyse ajoutée à la queue:', id)
        resolve(id)
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur ajout queue:', request.error)
        reject(request.error)
      }
    })
  }

  async getAnalysisQueue(): Promise<AnalysisQueueItem[]> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisQueue'], 'readonly')
      const store = transaction.objectStore('analysisQueue')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur lecture queue:', request.error)
        reject(request.error)
      }
    })
  }

  async removeFromAnalysisQueue(id: string): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisQueue'], 'readwrite')
      const store = transaction.objectStore('analysisQueue')
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log('🗑️ IndexedDB: Analyse supprimée de la queue:', id)
        resolve()
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur suppression queue:', request.error)
        reject(request.error)
      }
    })
  }

  // === CACHE DES ANALYSES ===

  async cacheAnalysis(item: Omit<CachedAnalysis, 'id' | 'cached_at'>): Promise<void> {
    await this.initialize()

    const cachedItem: CachedAnalysis = {
      id: `${item.imageHash}_${item.tone}_${item.language}`,
      cached_at: Date.now(),
      ...item
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisCache'], 'readwrite')
      const store = transaction.objectStore('analysisCache')
      const request = store.put(cachedItem)

      request.onsuccess = () => {
        console.log('💾 IndexedDB: Analyse mise en cache:', cachedItem.id)
        resolve()
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur cache analyse:', request.error)
        reject(request.error)
      }
    })
  }

  async getCachedAnalysis(imageHash: string, tone: string, language: string): Promise<CachedAnalysis | null> {
    await this.initialize()

    const id = `${imageHash}_${tone}_${language}`

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisCache'], 'readonly')
      const store = transaction.objectStore('analysisCache')
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result

        // Vérifier expiration
        if (result && result.expires_at > Date.now()) {
          console.log('🎯 IndexedDB: Cache hit:', id)
          resolve(result)
        } else if (result) {
          // Supprimer si expiré
          this.removeCachedAnalysis(id)
          resolve(null)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur lecture cache:', request.error)
        reject(request.error)
      }
    })
  }

  async removeCachedAnalysis(id: string): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisCache'], 'readwrite')
      const store = transaction.objectStore('analysisCache')
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log('🗑️ IndexedDB: Cache analyse supprimé:', id)
        resolve()
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur suppression cache:', request.error)
        reject(request.error)
      }
    })
  }

  // === NETTOYAGE AUTOMATIQUE ===

  async cleanExpiredCache(): Promise<number> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analysisCache'], 'readwrite')
      const store = transaction.objectStore('analysisCache')
      const index = store.index('expires_at')
      const range = IDBKeyRange.upperBound(Date.now())
      const request = index.openCursor(range)
      
      let deletedCount = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          deletedCount++
          cursor.continue()
        } else {
          console.log(`🧹 IndexedDB: ${deletedCount} analyses expirées supprimées`)
          resolve(deletedCount)
        }
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur nettoyage cache:', request.error)
        reject(request.error)
      }
    })
  }

  // === PRÉFÉRENCES UTILISATEUR ===

  async setUserPreference(key: string, value: any): Promise<void> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userPreferences'], 'readwrite')
      const store = transaction.objectStore('userPreferences')
      const request = store.put({ key, value, updated_at: Date.now() })

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur sauvegarde préférence:', request.error)
        reject(request.error)
      }
    })
  }

  async getUserPreference(key: string): Promise<any> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userPreferences'], 'readonly')
      const store = transaction.objectStore('userPreferences')
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result?.value || null)
      }

      request.onerror = () => {
        console.error('❌ IndexedDB: Erreur lecture préférence:', request.error)
        reject(request.error)
      }
    })
  }

  // === STATISTIQUES ===

  async getStorageStats(): Promise<{
    queueSize: number
    cacheSize: number
    preferencesSize: number
    totalSize: number
  }> {
    await this.initialize()

    const [queueSize, cacheSize, preferencesSize] = await Promise.all([
      this.getStoreCount('analysisQueue'),
      this.getStoreCount('analysisCache'),
      this.getStoreCount('userPreferences')
    ])

    return {
      queueSize,
      cacheSize,
      preferencesSize,
      totalSize: queueSize + cacheSize + preferencesSize
    }
  }

  private async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

// Export singleton
export const indexedDBManager = IndexedDBManager.getInstance()

// Fonctions globales pour le Service Worker
declare global {
  function getAnalysisQueue(): Promise<any[]>
  function removeFromQueue(id: string): Promise<void>
}

// Faire les fonctions disponibles globalement pour le SW
if (typeof window !== 'undefined') {
  (window as any).getAnalysisQueue = async () => {
    return await indexedDBManager.getAnalysisQueue()
  }
  
  (window as any).removeFromQueue = async (id: string) => {
    return await indexedDBManager.removeFromAnalysisQueue(id)
  }
}