/**
 * Session Security Middleware
 * Middleware pour valider et sécuriser les sessions
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { validateSession, createSecureSession, cleanupOldSessions } from './advanced-session'
import { AuditLogger } from './audit-trail'

export interface SecureSessionContext {
  isValid: boolean
  sessionInfo?: any
  risk: 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
  user?: {
    id: string
    email: string
  }
}

/**
 * Middleware pour valider les sessions avec sécurité avancée
 */
export async function withSecureSession(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse, ctx: SecureSessionContext) => Promise<void>
) {
  try {
    // Récupérer le token NextAuth
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token?.id || !token?.email) {
      const ctx: SecureSessionContext = {
        isValid: false,
        risk: 'high',
        reasons: ['No valid session token']
      }
      return handler(req, res, ctx)
    }

    // Nettoyer les sessions expirées de temps en temps
    if (Math.random() < 0.1) { // 10% de chance
      await cleanupOldSessions(token.id as string)
    }

    // Pour l'instant, on utilise NextAuth comme base mais on peut ajouter notre validation
    const ctx: SecureSessionContext = {
      isValid: true,
      risk: 'low',
      reasons: [],
      user: {
        id: token.id as string,
        email: token.email as string
      }
    }

    // TODO: Intégrer validateSession() si on veut une double validation
    // const sessionValidation = await validateSession(sessionId, req)
    // if (!sessionValidation.isValid) {
    //   ctx.isValid = false
    //   ctx.risk = sessionValidation.risk
    //   ctx.reasons = sessionValidation.reasons
    // }

    await handler(req, res, ctx)

  } catch (error) {
    console.error('Session middleware error:', error)
    const ctx: SecureSessionContext = {
      isValid: false,
      risk: 'critical',
      reasons: ['Session middleware error']
    }
    await handler(req, res, ctx)
  }
}

/**
 * Helper pour les routes API qui nécessitent une authentification
 */
export function requireAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, ctx: SecureSessionContext) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await withSecureSession(req, res, async (req, res, ctx) => {
      if (!ctx.isValid) {
        return res.status(401).json({
          success: false,
          message: 'Session invalide ou expirée',
          risk: ctx.risk,
          reasons: ctx.reasons
        })
      }

      if (ctx.risk === 'critical' || ctx.risk === 'high') {
        // Log l'activité suspecte
        const auditLogger = new AuditLogger(req, ctx.user?.id, ctx.user?.email)
        await auditLogger.logSecurity('suspicious_session_blocked', {
          description: 'High-risk session blocked from accessing API',
          metadata: { 
            risk: ctx.risk,
            reasons: ctx.reasons 
          },
          success: false,
          riskLevel: ctx.risk
        })

        return res.status(403).json({
          success: false,
          message: 'Session à risque - accès refusé',
          risk: ctx.risk,
          reasons: ctx.reasons
        })
      }

      await handler(req, res, ctx)
    })
  }
}

/**
 * Session timeout intelligent pour NextAuth
 */
export function getIntelligentSessionDuration(
  userAgent?: string,
  ipAddress?: string,
  riskFactors?: string[]
): number {
  let baseDuration = 24 * 60 * 60 // 24h en secondes
  
  // Réduction basée sur les facteurs de risque
  const riskCount = riskFactors?.length || 0
  if (riskCount > 2) baseDuration *= 0.25      // 6h si très risqué
  else if (riskCount > 0) baseDuration *= 0.5  // 12h si quelques risques
  
  // Appareils mobiles = sessions plus courtes
  if (userAgent && /mobile/i.test(userAgent)) {
    baseDuration *= 0.75 // 18h pour mobile
  }
  
  // IPs suspectes = sessions très courtes  
  if (ipAddress && (
    ipAddress.includes('tor') || 
    ipAddress.includes('proxy') ||
    !ipAddress.match(/^[0-9.]+$/) // Non-IP standard
  )) {
    baseDuration *= 0.1 // 2.4h pour IPs suspectes
  }

  return Math.max(baseDuration, 30 * 60) // Min 30 minutes
}

/**
 * Nettoyage automatique des sessions (à exécuter périodiquement)
 */
export async function runSessionCleanup(): Promise<void> {
  try {
    console.log('Running session cleanup...')
    const cleaned = await cleanupOldSessions()
    console.log(`Cleaned up ${cleaned} expired sessions`)
  } catch (error) {
    console.error('Session cleanup failed:', error)
  }
}

/**
 * Vérifie si une session est dans une période d'inactivité suspecte
 */
export function isInactivitySuspicious(
  lastActivity: Date,
  currentActivity: Date = new Date()
): { suspicious: boolean; inactiveMinutes: number } {
  const inactiveMinutes = (currentActivity.getTime() - lastActivity.getTime()) / (1000 * 60)
  
  // Plus de 4h d'inactivité puis reprise = suspect
  const suspicious = inactiveMinutes > 240
  
  return { suspicious, inactiveMinutes }
}

/**
 * Détecte les patterns de navigation suspects
 */
export function detectSuspiciousPattern(
  sessions: any[],
  currentRequest: NextApiRequest
): string[] {
  const suspiciousReasons: string[] = []
  
  // Trop de sessions simultanées
  if (sessions.length > 5) {
    suspiciousReasons.push('Too many concurrent sessions')
  }
  
  // Sessions depuis des locations très éloignées
  const locations = sessions.map(s => s.location).filter(Boolean)
  if (new Set(locations).size > 3) {
    suspiciousReasons.push('Sessions from multiple distant locations')
  }
  
  // Patterns d'User-Agent suspects
  const userAgent = currentRequest.headers['user-agent']
  if (userAgent && (
    userAgent.includes('bot') ||
    userAgent.includes('crawler') ||
    userAgent.length < 20
  )) {
    suspiciousReasons.push('Suspicious User-Agent pattern')
  }
  
  return suspiciousReasons
}