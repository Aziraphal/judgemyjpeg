import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
  maxRequests: number
}

interface RateLimitResult {
  success: boolean
  remainingRequests?: number
  resetTime?: number
}

// Simple in-memory rate limiting (pour dev/test)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  
  // Identifier l'utilisateur (IP + session si disponible)
  const identifier = getIdentifier(req)
  const now = Date.now()
  const windowStart = now - config.interval
  
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
  
  // Vérifier la limite
  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remainingRequests: 0,
      resetTime: record.resetTime
    }
  }
  
  // Incrémenter le compteur
  record.count++
  requestCounts.set(identifier, record)
  
  return {
    success: true,
    remainingRequests: config.maxRequests - record.count,
    resetTime: record.resetTime
  }
}

function getIdentifier(req: NextApiRequest): string {
  // Utiliser l'IP et user-agent comme identifiant
  const forwarded = req.headers['x-forwarded-for']
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0] 
    : req.socket.remoteAddress || 'unknown'
  
  const userAgent = req.headers['user-agent'] || 'unknown'
  
  return `${ip}-${userAgent.slice(0, 50)}`
}

export default rateLimit