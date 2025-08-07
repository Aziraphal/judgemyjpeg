/**
 * Admin Authentication API
 * Authentification sécurisée pour l'accès admin
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { AuditLogger } from '@/lib/audit-trail'
import crypto from 'crypto'

interface AdminAuthRequest {
  adminSecret: string
}

interface AdminAuthResponse {
  success: boolean
  message: string
  token?: string
  expiresAt?: string
}

// Cache simple pour limiter les tentatives (en production, utiliser Redis)
const attemptCache = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminAuthResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const clientIP = req.headers['x-forwarded-for'] as string || 
                   req.headers['x-real-ip'] as string || 
                   req.socket.remoteAddress || 
                   'unknown'

  const auditLogger = new AuditLogger(req)

  try {
    const { adminSecret }: AdminAuthRequest = req.body

    if (!adminSecret) {
      await auditLogger.logSecurity('admin_login_failed', {
        description: 'Admin login attempt without credentials',
        success: false,
        riskLevel: 'medium',
        metadata: { reason: 'missing_credentials' }
      })

      return res.status(400).json({
        success: false,
        message: 'Clé d\'administration requise'
      })
    }

    // Rate limiting par IP
    const attempts = attemptCache.get(clientIP) || { count: 0, lastAttempt: 0 }
    const now = Date.now()
    
    // Reset après 1 heure
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
      attempts.count = 0
    }

    // Vérifier si IP bloquée
    if (attempts.blockedUntil && now < attempts.blockedUntil) {
      const remainingMinutes = Math.ceil((attempts.blockedUntil - now) / (60 * 1000))
      
      await auditLogger.logSecurity('admin_login_blocked', {
        description: `Admin login blocked due to too many failed attempts from IP ${clientIP}`,
        success: false,
        riskLevel: 'high',
        metadata: { 
          attemptsCount: attempts.count,
          remainingMinutes 
        }
      })

      return res.status(429).json({
        success: false,
        message: `IP bloquée. Réessayez dans ${remainingMinutes} minutes.`
      })
    }

    // Vérifier la clé secrète
    const expectedSecret = process.env.ADMIN_SECRET
    if (!expectedSecret) {
      await auditLogger.logSecurity('admin_config_error', {
        description: 'ADMIN_SECRET not configured in environment',
        success: false,
        riskLevel: 'critical'
      })

      return res.status(500).json({
        success: false,
        message: 'Configuration d\'administration manquante'
      })
    }

    if (adminSecret !== expectedSecret) {
      // Incrémenter les tentatives échouées
      attempts.count++
      attempts.lastAttempt = now

      // Bloquer après 5 tentatives pour 30 minutes
      if (attempts.count >= 5) {
        attempts.blockedUntil = now + (30 * 60 * 1000)
      }

      attemptCache.set(clientIP, attempts)

      await auditLogger.logSecurity('admin_login_failed', {
        description: `Admin login failed with invalid credentials from IP ${clientIP}`,
        success: false,
        riskLevel: attempts.count >= 3 ? 'high' : 'medium',
        metadata: { 
          attemptsCount: attempts.count,
          blocked: attempts.count >= 5
        }
      })

      return res.status(401).json({
        success: false,
        message: 'Clé d\'administration invalide'
      })
    }

    // Authentification réussie - générer un token de session admin
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 heures

    // Stocker le token en cache (en production, utiliser Redis)
    const adminTokens = (global as any).adminTokens || new Map()
    adminTokens.set(sessionToken, {
      createdAt: new Date(),
      expiresAt,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown'
    })
    ;(global as any).adminTokens = adminTokens

    // Reset des tentatives pour cette IP
    attemptCache.delete(clientIP)

    await auditLogger.logSecurity('admin_login_success', {
      description: `Successful admin login from IP ${clientIP}`,
      success: true,
      riskLevel: 'low',
      metadata: { 
        sessionToken: sessionToken.substring(0, 8) + '...',
        expiresAt: expiresAt.toISOString()
      }
    })

    res.status(200).json({
      success: true,
      message: 'Authentification réussie',
      token: sessionToken,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Admin auth error:', error)
    
    await auditLogger.logSecurity('admin_auth_error', {
      description: 'Admin authentication system error',
      success: false,
      riskLevel: 'critical',
      metadata: { error: String(error) }
    })

    res.status(500).json({
      success: false,
      message: 'Erreur système d\'authentification'
    })
  }
}

// Fonction utilitaire pour valider un token admin (à utiliser dans d'autres APIs)
export function validateAdminToken(token: string): boolean {
  if (!token) return false

  const adminTokens = (global as any).adminTokens || new Map()
  const tokenData = adminTokens.get(token)

  if (!tokenData) return false

  // Vérifier l'expiration
  if (new Date() > tokenData.expiresAt) {
    adminTokens.delete(token)
    return false
  }

  return true
}

// Middleware pour protéger les routes admin
export function requireAdminAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!validateAdminToken(token || '')) {
      return res.status(401).json({
        success: false,
        message: 'Token admin invalide ou expiré'
      })
    }

    return handler(req, res)
  }
}