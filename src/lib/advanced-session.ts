/**
 * Advanced Session Security System
 * Gestion avancée des sessions avec tracking et sécurité
 */

import { prisma } from '@/lib/prisma'
import { getFullDeviceContext, generateDeviceFingerprint } from './device-detection'
import { sendCriticalSecurityAlert } from './email-service'
import { AuditLogger } from './audit-trail'
import type { NextApiRequest } from 'next'
import crypto from 'crypto'
import { logger } from '@/lib/logger'

export interface SessionInfo {
  id: string
  userId: string
  deviceFingerprint: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  location: string
  createdAt: Date
  lastActivity: Date
  isActive: boolean
  isSuspicious: boolean
  riskScore: number
}

export interface SessionValidationResult {
  isValid: boolean
  session?: SessionInfo
  risk: 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
}

/**
 * Crée une nouvelle session sécurisée
 */
export async function createSecureSession(
  userId: string,
  req: NextApiRequest
): Promise<string> {
  const sessionId = crypto.randomUUID()
  const deviceContext = await getFullDeviceContext(req)
  const deviceFingerprint = generateDeviceFingerprint(
    deviceContext.device, 
    deviceContext.location.ip
  )

  // Vérifier les sessions existantes pour ce user
  await cleanupOldSessions(userId)
  await enforceConcurrentSessionLimits(userId)

  // Créer la nouvelle session
  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId,
      deviceFingerprint,
      deviceName: deviceContext.device.deviceName,
      browser: deviceContext.device.browser,
      os: deviceContext.device.os,
      ipAddress: deviceContext.location.ip,
      location: deviceContext.location.location || 'Unknown',
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      isSuspicious: false,
      riskScore: 0,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h par défaut
    }
  })

  // Audit log
  const auditLogger = new AuditLogger(req, userId)
  await auditLogger.logSecurity('session_created', {
    description: 'New secure session created',
    metadata: {
      sessionId,
      deviceFingerprint,
      deviceName: deviceContext.device.deviceName,
      location: deviceContext.location.location
    }
  })

  return sessionId
}

/**
 * Valide une session existante avec checks de sécurité
 */
export async function validateSession(
  sessionId: string,
  req: NextApiRequest
): Promise<SessionValidationResult> {
  const session = await prisma.userSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || !session.isActive) {
    return {
      isValid: false,
      risk: 'high',
      reasons: ['Session not found or inactive']
    }
  }

  // Vérifier l'expiration
  if (session.expiresAt < new Date()) {
    await invalidateSession(sessionId, 'expired')
    return {
      isValid: false,
      risk: 'medium',
      reasons: ['Session expired']
    }
  }

  const deviceContext = await getFullDeviceContext(req)
  const currentFingerprint = generateDeviceFingerprint(
    deviceContext.device, 
    deviceContext.location.ip
  )

  const reasons: string[] = []
  let riskScore = session.riskScore

  // 1. Device fingerprint mismatch (possible session hijacking)
  if (session.deviceFingerprint !== currentFingerprint) {
    reasons.push('Device fingerprint mismatch')
    riskScore += 50
  }

  // 2. Changement d'IP suspect
  if (session.ipAddress !== deviceContext.location.ip) {
    const ipDistance = await calculateIPDistance(session.ipAddress, deviceContext.location.ip)
    if (ipDistance > 1000) { // Plus de 1000km
      reasons.push('Suspicious IP change (>1000km)')
      riskScore += 30
    } else if (ipDistance > 100) {
      reasons.push('IP change detected')
      riskScore += 10
    }
  }

  // 3. Inactivité prolongée suivie d'activité
  const inactivityMinutes = (Date.now() - session.lastActivity.getTime()) / (1000 * 60)
  if (inactivityMinutes > 120) { // Plus de 2h d'inactivité
    reasons.push('Long inactivity period')
    riskScore += 10
  }

  // 4. Patterns d'usage suspects
  const recentSessions = await getRecentUserSessions(session.userId, 24)
  if (recentSessions.length > 10) { // Trop de sessions récentes
    reasons.push('Unusual session activity')
    riskScore += 20
  }

  // Déterminer le niveau de risque
  let risk: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (riskScore >= 80) risk = 'critical'
  else if (riskScore >= 50) risk = 'high'  
  else if (riskScore >= 25) risk = 'medium'

  // Session suspecte - invalider si risque critique
  if (risk === 'critical') {
    await invalidateSession(sessionId, 'suspicious_activity')
    await sendSessionSecurityAlert(session.userId, session, reasons)
    return {
      isValid: false,
      risk: 'critical',
      reasons
    }
  }

  // Mettre à jour l'activité et le score de risque
  await prisma.userSession.update({
    where: { id: sessionId },
    data: {
      lastActivity: new Date(),
      riskScore: Math.min(riskScore, 100),
      isSuspicious: risk === 'high'
    }
  })

  return {
    isValid: true,
    session: {
      id: session.id,
      userId: session.userId,
      deviceFingerprint: session.deviceFingerprint,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      createdAt: session.createdAt,
      lastActivity: new Date(),
      isActive: session.isActive,
      isSuspicious: risk === 'high',
      riskScore
    },
    risk,
    reasons
  }
}

/**
 * Invalide une session avec raison
 */
export async function invalidateSession(
  sessionId: string, 
  reason: string
): Promise<void> {
  await prisma.userSession.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      invalidatedAt: new Date(),
      invalidationReason: reason
    }
  })
}

/**
 * Invalide toutes les sessions d'un utilisateur sauf la courante
 */
export async function invalidateOtherUserSessions(
  userId: string, 
  currentSessionId: string,
  reason: string = 'user_requested'
): Promise<number> {
  const result = await prisma.userSession.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      isActive: true
    },
    data: {
      isActive: false,
      invalidatedAt: new Date(),
      invalidationReason: reason
    }
  })

  return result.count
}

/**
 * Nettoie les sessions expirées
 */
export async function cleanupOldSessions(userId?: string): Promise<number> {
  const where = userId 
    ? { userId, expiresAt: { lt: new Date() } }
    : { expiresAt: { lt: new Date() } }

  const result = await prisma.userSession.updateMany({
    where,
    data: {
      isActive: false,
      invalidatedAt: new Date(),
      invalidationReason: 'expired'
    }
  })

  return result.count
}

/**
 * Limite les sessions concurrentes
 */
export async function enforceConcurrentSessionLimits(
  userId: string,
  maxSessions: number = 5
): Promise<void> {
  const activeSessions = await prisma.userSession.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: { lastActivity: 'asc' }
  })

  if (activeSessions.length >= maxSessions) {
    // Invalider les plus anciennes sessions
    const sessionsToInvalidate = activeSessions.slice(0, activeSessions.length - maxSessions + 1)
    
    await prisma.userSession.updateMany({
      where: {
        id: { in: sessionsToInvalidate.map(s => s.id) }
      },
      data: {
        isActive: false,
        invalidatedAt: new Date(),
        invalidationReason: 'concurrent_session_limit'
      }
    })
  }
}

/**
 * Récupère les sessions récentes d'un utilisateur
 */
export async function getRecentUserSessions(
  userId: string, 
  hoursBack: number = 24
): Promise<SessionInfo[]> {
  const sessions = await prisma.userSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - hoursBack * 60 * 60 * 1000)
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return sessions.map(s => ({
    id: s.id,
    userId: s.userId,
    deviceFingerprint: s.deviceFingerprint,
    deviceName: s.deviceName,
    browser: s.browser,
    os: s.os,
    ipAddress: s.ipAddress,
    location: s.location,
    createdAt: s.createdAt,
    lastActivity: s.lastActivity,
    isActive: s.isActive,
    isSuspicious: s.isSuspicious || false,
    riskScore: s.riskScore || 0
  }))
}

/**
 * Récupère toutes les sessions actives d'un utilisateur
 */
export async function getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
  const sessions = await prisma.userSession.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: { lastActivity: 'desc' }
  })

  return sessions.map(s => ({
    id: s.id,
    userId: s.userId,
    deviceFingerprint: s.deviceFingerprint,
    deviceName: s.deviceName,
    browser: s.browser,
    os: s.os,
    ipAddress: s.ipAddress,
    location: s.location,
    createdAt: s.createdAt,
    lastActivity: s.lastActivity,
    isActive: s.isActive,
    isSuspicious: s.isSuspicious || false,
    riskScore: s.riskScore || 0
  }))
}

/**
 * Calcule la distance approximative entre deux IPs (simulation)
 */
async function calculateIPDistance(ip1: string, ip2: string): Promise<number> {
  // Simulation - en production, utiliser un service de géolocalisation
  if (ip1 === ip2) return 0
  
  // IPs locales = même réseau
  if (ip1.startsWith('192.168') && ip2.startsWith('192.168')) return 0
  if (ip1 === '127.0.0.1' || ip2 === '127.0.0.1') return 0
  
  // Simulation basique - différentes IPs = distance aléatoire
  return Math.floor(Math.random() * 2000) // 0-2000km
}

/**
 * Envoie une alerte de sécurité pour session suspecte
 */
async function sendSessionSecurityAlert(
  userId: string,
  session: any,
  reasons: string[]
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (user?.email) {
      await sendCriticalSecurityAlert(
        'suspicious_session_detected',
        `Suspicious session activity detected for user ${user.email}`,
        {
          userId,
          sessionId: session.id,
          deviceName: session.deviceName,
          ipAddress: session.ipAddress,
          location: session.location,
          reasons,
          riskScore: session.riskScore
        }
      )
    }
  } catch (error) {
    logger.error('Failed to send session security alert:', error)
  }
}

/**
 * Session timeout intelligent basé sur l'activité
 */
export function calculateIntelligentTimeout(
  lastActivity: Date,
  riskScore: number,
  deviceTrust: 'trusted' | 'new' | 'suspicious' = 'new'
): Date {
  const now = Date.now()
  const baseTimeout = 24 * 60 * 60 * 1000 // 24h de base

  let timeoutMultiplier = 1

  // Réduction basée sur le score de risque
  if (riskScore > 50) timeoutMultiplier *= 0.25 // 6h max si très risqué
  else if (riskScore > 25) timeoutMultiplier *= 0.5  // 12h si risqué
  else if (riskScore < 10) timeoutMultiplier *= 1.5   // 36h si très sûr

  // Ajustement basé sur la confiance de l'appareil
  if (deviceTrust === 'trusted') timeoutMultiplier *= 2    // Appareils de confiance = plus long
  else if (deviceTrust === 'suspicious') timeoutMultiplier *= 0.1 // Suspects = très court

  const finalTimeout = baseTimeout * timeoutMultiplier
  return new Date(now + finalTimeout)
}