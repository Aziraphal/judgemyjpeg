/**
 * Admin Security Stats API
 * Statistiques de sécurité pour le dashboard admin
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdminAuth } from './auth'
import { getSecuritySummary } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'

interface SecurityStatsResponse {
  success: boolean
  data?: any
  message?: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SecurityStatsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Statistiques de sécurité détaillées
    const [
      securitySummary,
      userStats,
      sessionStats,
      criticalEvents,
      systemHealth
    ] = await Promise.all([
      getSecuritySummary(7), // 7 derniers jours
      getUserSecurityStats(),
      getSessionStats(),
      getCriticalSecurityEvents(),
      getSystemHealth()
    ])

    const data = {
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      totalSessions: sessionStats.totalSessions,
      suspiciousSessions: sessionStats.suspiciousSessions,
      recentSecurityEvents: securitySummary.recentEvents.map(event => ({
        eventType: event.eventType,
        description: event.description,
        riskLevel: event.riskLevel,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
        email: event.email
      })),
      criticalAlerts: criticalEvents,
      systemHealth,
      summary: {
        totalSecurityEvents: securitySummary.totalEvents,
        criticalEvents: securitySummary.criticalEvents,
        failedLogins: securitySummary.failedLogins,
        suspiciousActivity: securitySummary.suspiciousActivity,
        period: securitySummary.period
      }
    }

    res.status(200).json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Security stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de sécurité'
    })
  }
}

/**
 * Statistiques utilisateurs pour la sécurité
 */
async function getUserSecurityStats() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalUsers, activeUsers, newUsers] = await Promise.all([
    prisma.user.count(),
    
    prisma.user.count({
      where: {
        updatedAt: { gte: weekAgo }
      }
    }),
    
    prisma.user.count({
      where: {
        createdAt: { gte: todayStart }
      }
    })
  ])

  return {
    totalUsers,
    activeUsers,
    newUsers
  }
}

/**
 * Statistiques des sessions
 */
async function getSessionStats() {
  const [totalSessions, suspiciousSessions, recentSessions] = await Promise.all([
    prisma.userSession.count({
      where: { isActive: true }
    }),
    
    prisma.userSession.count({
      where: { 
        isActive: true,
        OR: [
          { isSuspicious: true },
          { riskScore: { gte: 50 } }
        ]
      }
    }),
    
    prisma.userSession.count({
      where: {
        createdAt: { 
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  return {
    totalSessions,
    suspiciousSessions,
    recentSessions
  }
}

/**
 * Événements de sécurité critiques nécessitant une attention
 */
async function getCriticalSecurityEvents() {
  const criticalEvents = await prisma.auditLog.findMany({
    where: {
      riskLevel: 'critical',
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 10
  })

  return criticalEvents.map(event => ({
    title: `${event.eventType.replace('_', ' ').toUpperCase()}`,
    description: event.description,
    timestamp: event.timestamp,
    ipAddress: event.ipAddress,
    userId: event.userId,
    email: event.email
  }))
}

/**
 * Santé générale du système
 */
async function getSystemHealth() {
  try {
    // Vérifier la dernière exécution du nettoyage automatique
    const lastCleanupLog = await prisma.auditLog.findFirst({
      where: { eventType: 'system_cleanup' },
      orderBy: { timestamp: 'desc' }
    })

    // Compter les événements critiques récents
    const recentCriticalCount = await prisma.auditLog.count({
      where: {
        riskLevel: 'critical',
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1h
        }
      }
    })

    // Calculer l'uptime approximatif (depuis le dernier redémarrage/deploy)
    const oldestSession = await prisma.userSession.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    })

    const uptime = oldestSession 
      ? formatUptime(Date.now() - oldestSession.createdAt.getTime())
      : 'Indéterminé'

    // Déterminer le statut de santé
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    if (recentCriticalCount >= 5) {
      status = 'critical'
    } else if (recentCriticalCount >= 2) {
      status = 'warning'
    }

    // Vérifier si le nettoyage a été fait récemment
    const lastCleanupAge = lastCleanupLog 
      ? Date.now() - lastCleanupLog.timestamp.getTime()
      : null

    if (!lastCleanupAge || lastCleanupAge > 24 * 60 * 60 * 1000) {
      status = status === 'healthy' ? 'warning' : status
    }

    return {
      status,
      uptime,
      lastCleanup: lastCleanupLog 
        ? lastCleanupLog.timestamp.toLocaleString('fr-FR')
        : 'Jamais',
      recentCriticalEvents: recentCriticalCount,
      databaseConnected: true // On arrive ici donc DB OK
    }

  } catch (error) {
    return {
      status: 'critical' as const,
      uptime: 'Erreur',
      lastCleanup: 'Erreur',
      recentCriticalEvents: 0,
      databaseConnected: false
    }
  }
}

/**
 * Formate une durée en millisecondes en texte lisible
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}j ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export default requireAdminAuth(handler)