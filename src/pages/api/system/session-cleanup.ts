/**
 * API Session Cleanup - Nettoyage automatique des sessions
 * À exécuter périodiquement (cron job ou webhook)
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  cleanupOldSessions, 
  getUserActiveSessions,
  invalidateSession 
} from '@/lib/advanced-session'
import { sendCriticalSecurityAlert } from '@/lib/email-service'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface CleanupResponse {
  success: boolean
  message: string
  stats: {
    expiredSessionsCleared: number
    suspiciousSessionsFound: number
    suspiciousSessionsInvalidated: number
    usersAffected: number
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CleanupResponse>
) {
  // Sécurité : vérifier que c'est un appel système autorisé
  const authHeader = req.headers.authorization
  const expectedToken = process.env.SYSTEM_CLEANUP_TOKEN

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized system call',
      stats: {
        expiredSessionsCleared: 0,
        suspiciousSessionsFound: 0,
        suspiciousSessionsInvalidated: 0,
        usersAffected: 0
      }
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      stats: {
        expiredSessionsCleared: 0,
        suspiciousSessionsFound: 0,
        suspiciousSessionsInvalidated: 0,
        usersAffected: 0
      }
    })
  }

  try {
    logger.debug('🧹 Starting automatic session cleanup...')

    // 1. Nettoyer les sessions expirées
    const expiredSessionsCleared = await cleanupOldSessions()
    logger.debug(`✅ Cleared ${expiredSessionsCleared} expired sessions`)

    // 2. Analyser les sessions suspectes
    const suspiciousResults = await detectAndHandleSuspiciousSessions()
    
    // 3. Nettoyer les sessions inactives depuis plus de 7 jours
    const longInactiveSessions = await cleanupLongInactiveSessions()

    const stats = {
      expiredSessionsCleared,
      suspiciousSessionsFound: suspiciousResults.found,
      suspiciousSessionsInvalidated: suspiciousResults.invalidated,
      usersAffected: suspiciousResults.usersAffected + longInactiveSessions.usersAffected
    }

    logger.debug('📊 Cleanup stats:', stats)

    res.status(200).json({
      success: true,
      message: 'Session cleanup completed successfully',
      stats
    })

  } catch (error) {
    logger.error('❌ Session cleanup failed:', error)
    res.status(500).json({
      success: false,
      message: 'Session cleanup failed',
      stats: {
        expiredSessionsCleared: 0,
        suspiciousSessionsFound: 0,
        suspiciousSessionsInvalidated: 0,
        usersAffected: 0
      }
    })
  }
}

/**
 * Détecte et gère les sessions suspectes
 */
async function detectAndHandleSuspiciousSessions(): Promise<{
  found: number
  invalidated: number
  usersAffected: number
}> {
  logger.debug('🔍 Detecting suspicious sessions...')

  // Récupérer toutes les sessions avec un score de risque élevé
  const suspiciousSessions = await prisma.userSession.findMany({
    where: {
      isActive: true,
      OR: [
        { riskScore: { gte: 80 } },
        { isSuspicious: true }
      ]
    },
    include: {
      user: {
        select: { id: true, email: true, name: true }
      }
    }
  })

  logger.debug(`Found ${suspiciousSessions.length} suspicious sessions`)

  let invalidatedCount = 0
  const affectedUsers = new Set<string>()

  for (const session of suspiciousSessions) {
    try {
      // Analyser plus en détail la session
      const shouldInvalidate = await analyzeSuspiciousSession(session)

      if (shouldInvalidate) {
        await invalidateSession(session.id, 'automatic_security_invalidation')
        invalidatedCount++
        affectedUsers.add(session.userId)

        // Envoyer une alerte à l'utilisateur
        if (session.user.email) {
          await sendCriticalSecurityAlert(
            'suspicious_session_invalidated',
            `Suspicious session automatically invalidated for user ${session.user.email}`,
            {
              sessionId: session.id,
              deviceName: session.deviceName,
              location: session.location,
              riskScore: session.riskScore,
              reason: 'Automatic security system detected suspicious activity'
            }
          )
        }

        logger.debug(`🚫 Invalidated suspicious session ${session.id} for user ${session.user.email}`)
      }

    } catch (error) {
      logger.error(`Failed to handle suspicious session ${session.id}:`, error)
    }
  }

  return {
    found: suspiciousSessions.length,
    invalidated: invalidatedCount,
    usersAffected: affectedUsers.size
  }
}

/**
 * Analyse une session suspecte pour déterminer si elle doit être invalidée
 */
async function analyzeSuspiciousSession(session: any): Promise<boolean> {
  // Critères d'invalidation automatique
  const reasons: string[] = []

  // 1. Score de risque critique
  if (session.riskScore >= 90) {
    reasons.push('Critical risk score')
  }

  // 2. Inactivité très longue puis reprise
  const inactiveHours = (Date.now() - session.lastActivity.getTime()) / (1000 * 60 * 60)
  if (inactiveHours > 48) { // Plus de 48h d'inactivité
    reasons.push('Long inactivity period')
  }

  // 3. IP géographiquement impossible
  const userSessions = await prisma.userSession.findMany({
    where: {
      userId: session.userId,
      isActive: true,
      id: { not: session.id }
    },
    orderBy: { lastActivity: 'desc' },
    take: 5
  })

  // Si l'utilisateur a une autre session active depuis une location très différente en même temps
  const recentSessions = userSessions.filter(s => {
    const timeDiff = Math.abs(s.lastActivity.getTime() - session.lastActivity.getTime())
    return timeDiff < 30 * 60 * 1000 // Dans les 30 dernières minutes
  })

  if (recentSessions.length > 0) {
    // Simulation de détection géographique
    const hasConflictingLocations = recentSessions.some(s => 
      s.location !== session.location && 
      !s.location.includes('Unknown') && 
      !session.location.includes('Unknown')
    )

    if (hasConflictingLocations) {
      reasons.push('Simultaneous sessions from distant locations')
    }
  }

  // 4. Patterns de User-Agent suspects
  if (session.browser.includes('bot') || session.browser.length < 10) {
    reasons.push('Suspicious user agent')
  }

  // Invalidar si au moins 2 critères critiques sont remplis
  return reasons.length >= 2 || session.riskScore >= 95
}

/**
 * Nettoie les sessions inactives depuis trop longtemps
 */
async function cleanupLongInactiveSessions(): Promise<{
  cleaned: number
  usersAffected: number
}> {
  logger.debug('🕰️ Cleaning up long inactive sessions...')

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const longInactiveSessions = await prisma.userSession.findMany({
    where: {
      isActive: true,
      lastActivity: { lt: sevenDaysAgo }
    },
    select: { id: true, userId: true }
  })

  const affectedUsers = new Set(longInactiveSessions.map(s => s.userId))

  const result = await prisma.userSession.updateMany({
    where: {
      id: { in: longInactiveSessions.map(s => s.id) }
    },
    data: {
      isActive: false,
      invalidatedAt: new Date(),
      invalidationReason: 'long_inactivity_cleanup'
    }
  })

  logger.debug(`🧹 Cleaned ${result.count} long inactive sessions`)

  return {
    cleaned: result.count,
    usersAffected: affectedUsers.size
  }
}