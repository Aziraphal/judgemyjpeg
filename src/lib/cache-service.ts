import { PhotoAnalysis } from '@/types/analysis'
import crypto from 'crypto'
import { logger } from '@/lib/logger'

// Interface pour le cache
interface CacheConfig {
  redis?: {
    url: string
    password?: string
  }
  fallback: 'memory' | 'none'
  ttl: number // Time to live en secondes
}

// Cache en mémoire comme fallback
class MemoryCache {
  private cache = new Map<string, { data: any, expires: number }>()
  
  set(key: string, value: any, ttlSeconds: number): void {
    const expires = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { data: value, expires })
    
    // Nettoyage automatique
    setTimeout(() => {
      if (this.cache.has(key)) {
        const item = this.cache.get(key)
        if (item && Date.now() > item.expires) {
          this.cache.delete(key)
        }
      }
    }, ttlSeconds * 1000)
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

export class CacheService {
  private static instance: CacheService
  private redisClient: any = null
  private memoryCache = new MemoryCache()
  private config: CacheConfig
  
  private constructor() {
    this.config = {
      redis: process.env.REDIS_URL ? {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD
      } : undefined,
      fallback: 'memory',
      ttl: 3600 // 1 heure par défaut
    }
    
    this.initializeRedis()
  }
  
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }
  
  private async initializeRedis() {
    if (!this.config.redis?.url) {
      logger.debug('📦 Cache: Utilisation mémoire locale (Redis non configuré)')
      return
    }
    
    try {
      // Import dynamique de Redis seulement si nécessaire
      const { createClient } = await import('redis')
      
      this.redisClient = createClient({
        url: this.config.redis.url,
        password: this.config.redis.password,
        socket: {
          connectTimeout: 5000
        }
      })
      
      this.redisClient.on('error', (err: Error) => {
        logger.error('❌ Redis error:', err.message)
        this.redisClient = null
      })
      
      this.redisClient.on('connect', () => {
        logger.debug('✅ Cache Redis connecté')
      })
      
      await this.redisClient.connect()
    } catch (error) {
      logger.warn('⚠️ Redis non disponible, fallback vers cache mémoire:', error)
      this.redisClient = null
    }
  }
  
  // Génère un hash unique pour une image
  generateImageHash(imageData: string | Buffer): string {
    return crypto
      .createHash('sha256')
      .update(typeof imageData === 'string' ? imageData : imageData)
      .digest('hex')
      .substring(0, 16) // Raccourci pour optimiser
  }
  
  // Cache une analyse photo
  async cacheAnalysis(
    imageHash: string, 
    analysis: PhotoAnalysis, 
    tone: string,
    language: string,
    ttlSeconds: number = this.config.ttl
  ): Promise<void> {
    const key = `analysis:${imageHash}:${tone}:${language}`
    const data = {
      analysis,
      cached_at: new Date().toISOString(),
      version: '1.0'
    }
    
    try {
      if (this.redisClient?.isReady) {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(data))
        logger.debug(`📦 Cache Redis: Analyse sauvée (${key})`)
      } else {
        this.memoryCache.set(key, data, ttlSeconds)
        logger.debug(`📦 Cache Mémoire: Analyse sauvée (${key})`)
      }
    } catch (error) {
      logger.error('❌ Erreur cache:', error)
      // Fallback vers mémoire en cas d'erreur Redis
      this.memoryCache.set(key, data, ttlSeconds)
    }
  }
  
  // Récupère une analyse en cache
  async getCachedAnalysis(
    imageHash: string, 
    tone: string,
    language: string
  ): Promise<PhotoAnalysis | null> {
    const key = `analysis:${imageHash}:${tone}:${language}`
    
    try {
      let data: any = null
      
      if (this.redisClient?.isReady) {
        const cached = await this.redisClient.get(key)
        data = cached ? JSON.parse(cached) : null
        if (data) logger.debug(`🎯 Cache Redis: Hit (${key})`)
      } else {
        data = this.memoryCache.get(key)
        if (data) logger.debug(`🎯 Cache Mémoire: Hit (${key})`)
      }
      
      return data?.analysis || null
    } catch (error) {
      logger.error('❌ Erreur lecture cache:', error)
      return null
    }
  }
  
  // Invalidation du cache pour un utilisateur
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      if (this.redisClient?.isReady) {
        const keys = await this.redisClient.keys(`analysis:*`)
        const userKeys = keys.filter((key: string) => key.includes(userId))
        if (userKeys.length > 0) {
          await this.redisClient.del(userKeys)
          logger.debug(`🗑️ Cache invalidé pour user ${userId}: ${userKeys.length} clés`)
        }
      }
      // Pour le cache mémoire, on ne peut pas facilement filtrer par user
      // donc on le laisse expirer naturellement
    } catch (error) {
      logger.error('❌ Erreur invalidation cache:', error)
    }
  }
  
  // Statistiques du cache
  async getCacheStats(): Promise<{
    type: string
    memory_size?: number
    redis_info?: any
    hit_rate?: number
  }> {
    try {
      if (this.redisClient?.isReady) {
        const info = await this.redisClient.info('memory')
        return {
          type: 'redis',
          redis_info: info
        }
      } else {
        return {
          type: 'memory',
          memory_size: this.memoryCache.size()
        }
      }
    } catch (error) {
      return {
        type: 'error',
        memory_size: this.memoryCache.size()
      }
    }
  }
  
  // Nettoyage manuel
  async clearCache(): Promise<void> {
    try {
      if (this.redisClient?.isReady) {
        await this.redisClient.flushAll()
        logger.debug('🗑️ Cache Redis vidé')
      }
      this.memoryCache.clear()
      logger.debug('🗑️ Cache mémoire vidé')
    } catch (error) {
      logger.error('❌ Erreur nettoyage cache:', error)
    }
  }
}

// Export singleton
export const cacheService = CacheService.getInstance()