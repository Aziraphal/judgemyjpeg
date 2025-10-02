/**
 * Redis Cache Service avec Upstash (Serverless)
 * Performance optimisée pour analyses photo et embeddings RAG
 */

import { Redis } from '@upstash/redis'
import { PhotoAnalysis } from '@/types/analysis'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

// Upstash Redis (serverless, edge-optimized)
let redis: Redis | null = null

// Initialisation lazy
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    logger.debug('📦 Redis: Variables UPSTASH non configurées, cache désactivé')
    return null
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    logger.info('✅ Redis Upstash initialisé')
  }

  return redis
}

/**
 * Génère un hash unique pour une image
 */
export function generateImageHash(imageData: string | Buffer): string {
  return crypto
    .createHash('sha256')
    .update(typeof imageData === 'string' ? imageData : imageData)
    .digest('hex')
    .substring(0, 16) // 16 chars suffisent
}

/**
 * Cache une analyse photo
 */
export async function cacheAnalysis(
  imageHash: string,
  analysis: PhotoAnalysis,
  tone: string,
  language: string,
  ttlSeconds: number = 86400 // 24h par défaut
): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  const key = `analysis:${imageHash}:${tone}:${language}`

  try {
    await client.setex(key, ttlSeconds, JSON.stringify({
      analysis,
      cached_at: Date.now(),
      version: '2.0'
    }))

    logger.debug(`📦 Redis: Analyse cached (${key}, TTL: ${ttlSeconds}s)`)
    return true
  } catch (error) {
    logger.error('❌ Redis cache error:', error)
    return false
  }
}

/**
 * Récupère une analyse en cache
 */
export async function getCachedAnalysis(
  imageHash: string,
  tone: string,
  language: string
): Promise<PhotoAnalysis | null> {
  const client = getRedis()
  if (!client) return null

  const key = `analysis:${imageHash}:${tone}:${language}`

  try {
    const cached = await client.get<string>(key)
    if (!cached) return null

    const data = JSON.parse(cached as string)
    logger.debug(`🎯 Redis: Cache hit (${key})`)

    return data.analysis
  } catch (error) {
    logger.error('❌ Redis get error:', error)
    return null
  }
}

/**
 * Cache un embedding RAG
 */
export async function cacheEmbedding(
  imageHash: string,
  embedding: number[],
  ttlSeconds: number = 604800 // 7 jours
): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  const key = `embedding:${imageHash}`

  try {
    await client.setex(key, ttlSeconds, JSON.stringify({
      embedding,
      cached_at: Date.now()
    }))

    logger.debug(`📦 Redis: Embedding cached (${key})`)
    return true
  } catch (error) {
    logger.error('❌ Redis cache embedding error:', error)
    return false
  }
}

/**
 * Récupère un embedding en cache
 */
export async function getCachedEmbedding(
  imageHash: string
): Promise<number[] | null> {
  const client = getRedis()
  if (!client) return null

  const key = `embedding:${imageHash}`

  try {
    const cached = await client.get<string>(key)
    if (!cached) return null

    const data = JSON.parse(cached as string)
    logger.debug(`🎯 Redis: Embedding hit (${key})`)

    return data.embedding
  } catch (error) {
    logger.error('❌ Redis get embedding error:', error)
    return null
  }
}

/**
 * Cache une liste de suggestions (pour autocomplete)
 */
export async function cacheSuggestions(
  category: string,
  suggestions: string[],
  ttlSeconds: number = 3600 // 1h
): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  const key = `suggestions:${category}`

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(suggestions))
    logger.debug(`📦 Redis: Suggestions cached (${key})`)
    return true
  } catch (error) {
    logger.error('❌ Redis cache suggestions error:', error)
    return false
  }
}

/**
 * Récupère suggestions en cache
 */
export async function getCachedSuggestions(
  category: string
): Promise<string[] | null> {
  const client = getRedis()
  if (!client) return null

  const key = `suggestions:${category}`

  try {
    const cached = await client.get<string>(key)
    if (!cached) return null

    return JSON.parse(cached as string)
  } catch (error) {
    logger.error('❌ Redis get suggestions error:', error)
    return null
  }
}

/**
 * Invalide le cache pour un utilisateur
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  const client = getRedis()
  if (!client) return 0

  try {
    // Upstash ne supporte pas SCAN, on utilise une approche différente
    // On stocke les clés par user dans un SET
    const userKeysSet = `user:${userId}:keys`
    const keys = await client.smembers(userKeysSet)

    if (keys.length > 0) {
      await client.del(...keys)
      await client.del(userKeysSet)
      logger.debug(`🗑️ Redis: ${keys.length} clés invalidées pour user ${userId}`)
      return keys.length
    }

    return 0
  } catch (error) {
    logger.error('❌ Redis invalidate error:', error)
    return 0
  }
}

/**
 * Statistiques du cache
 */
export async function getCacheStats(): Promise<{
  type: string
  dbsize?: number
  memory_used?: string
  uptime?: number
  hit_rate?: number
}> {
  const client = getRedis()

  if (!client) {
    return { type: 'disabled' }
  }

  try {
    const dbsize = await client.dbsize()

    return {
      type: 'upstash',
      dbsize,
      memory_used: 'N/A (serverless)',
      uptime: 0,
    }
  } catch (error) {
    logger.error('❌ Redis stats error:', error)
    return { type: 'error' }
  }
}

/**
 * Incrémente un compteur (analytics)
 */
export async function incrementCounter(
  key: string,
  ttlSeconds: number = 86400
): Promise<number> {
  const client = getRedis()
  if (!client) return 0

  try {
    const count = await client.incr(key)

    // Set TTL only on first increment
    if (count === 1) {
      await client.expire(key, ttlSeconds)
    }

    return count
  } catch (error) {
    logger.error('❌ Redis incr error:', error)
    return 0
  }
}

/**
 * Récupère un compteur
 */
export async function getCounter(key: string): Promise<number> {
  const client = getRedis()
  if (!client) return 0

  try {
    const count = await client.get<number>(key)
    return count || 0
  } catch (error) {
    logger.error('❌ Redis get counter error:', error)
    return 0
  }
}

/**
 * Nettoyage complet du cache (admin only)
 */
export async function flushCache(): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    await client.flushdb()
    logger.warn('🗑️ Redis: Cache complètement vidé')
    return true
  } catch (error) {
    logger.error('❌ Redis flush error:', error)
    return false
  }
}
