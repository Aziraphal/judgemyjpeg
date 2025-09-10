import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger, getClientIP } from '@/lib/logger'

interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
  maxRequests: number
  authenticatedMaxRequests?: number // Limite différente pour users authentifiés
}

interface RateLimitResult {
  success: boolean
  remainingRequests?: number
  resetTime?: number
  identifier: string
  isAuthenticated: boolean
}

// Simple in-memory rate limiting (pour dev/test)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  
  // Récupérer session et identifier utilisateur de manière robuste
  const session = await getServerSession(req, res, authOptions)
  const { identifier, isAuthenticated, userId } = await getSecureIdentifier(req, session)
  
  const now = Date.now()
  const windowStart = now - config.interval
  
  // Choisir la limite appropriée selon authentification
  const maxRequests = isAuthenticated && config.authenticatedMaxRequests 
    ? config.authenticatedMaxRequests 
    : config.maxRequests
  
  // Nettoyer les anciens records
  const keysToDelete: string[] = []
  requestCounts.forEach((data, key) => {
    if (data.resetTime <= now) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => requestCounts.delete(key))
  
  // Récupérer ou créer le record pour cet identifier
  let record = requestCounts.get(identifier)
  if (!record || record.resetTime <= now) {
    record = {
      count: 0,
      resetTime: now + config.interval
    }
    requestCounts.set(identifier, record)
  }
  
  // Vérifier la limite avec log détaillé
  if (record.count >= maxRequests) {
    // Logger tentative de dépassement
    logger.security('Rate limit exceeded', {
      identifier,
      isAuthenticated,
      userId,
      currentCount: record.count,
      maxRequests,
      endpoint: req.url,
      method: req.method,
      userAgent: req.headers['user-agent']
    }, userId, getClientIP(req))
    
    return {
      success: false,
      remainingRequests: 0,
      resetTime: record.resetTime,
      identifier,
      isAuthenticated
    }
  }
  
  // Incrémenter le compteur
  record.count++
  requestCounts.set(identifier, record)
  
  // Logger requête acceptée pour monitoring
  if (record.count > maxRequests * 0.8) { // Alert à 80% de la limite
    logger.info('Rate limit approaching threshold', {
      identifier,
      isAuthenticated,
      userId,
      currentCount: record.count,
      maxRequests,
      percentage: Math.round((record.count / maxRequests) * 100)
    })
  }
  
  return {
    success: true,
    remainingRequests: maxRequests - record.count,
    resetTime: record.resetTime,
    identifier,
    isAuthenticated
  }
}

async function getSecureIdentifier(
  req: NextApiRequest, 
  session: any
): Promise<{ identifier: string; isAuthenticated: boolean; userId?: string }> {
  
  // Si utilisateur authentifié, utiliser son ID en priorité
  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      
      if (user) {
        return {
          identifier: `user:${user.id}`,
          isAuthenticated: true,
          userId: user.id
        }
      }
    } catch (error) {
      logger.error('Failed to fetch user for rate limiting', error)
    }
  }
  
  // Fallback : identifier basé IP + fingerprint sécurisé
  const ip = getClientIP(req)
  const userAgent = req.headers['user-agent'] || 'unknown'
  const acceptLanguage = req.headers['accept-language'] || 'unknown'
  
  // Créer fingerprint plus robuste
  const fingerprint = Buffer.from(`${ip}-${userAgent.slice(0, 100)}-${acceptLanguage.slice(0, 50)}`).toString('base64')
  
  return {
    identifier: `anon:${fingerprint}`,
    isAuthenticated: false
  }
}

export default rateLimit