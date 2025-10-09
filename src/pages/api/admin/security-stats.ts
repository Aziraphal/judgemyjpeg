import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { getClientIP, logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)

  // 🔒 VÉRIFICATION ADMIN
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    logger.warn('🚨 TENTATIVE ACCÈS NON AUTORISÉ - Security Stats', {
      userId: req.user.id,
      email: req.user.email,
    }, req.user.id, ip)
    return res.status(403).json({ error: 'Accès interdit' })
  }

  try {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 1. Stats utilisateurs
    const [totalUsers, activeUsersCount] = await Promise.all([
      prisma.user.count(),
      prisma.userSession.count({
        where: {
          isActive: true,
          lastActivity: { gte: last24h }
        }
      })
    ])

    // 2. Sessions suspectes (riskScore > 50 ou isSuspicious = true)
    const [totalSessions, suspiciousSessions] = await Promise.all([
      prisma.userSession.count({
        where: { isActive: true }
      }),
      prisma.userSession.findMany({
        where: {
          OR: [
            { isSuspicious: true },
            { riskScore: { gte: 50 } }
          ],
          isActive: true
        },
        include: {
          user: {
            select: {
              email: true,
              id: true
            }
          }
        },
        orderBy: { riskScore: 'desc' },
        take: 10
      })
    ])

    // 3. Événements de sécurité récents (24h)
    const recentSecurityEvents = await prisma.auditLog.findMany({
      where: {
        timestamp: { gte: last24h },
        OR: [
          { riskLevel: { in: ['high', 'critical'] } },
          { success: false },
          { eventType: { in: ['login_failed', 'unauthorized_access', 'content_blocked'] } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        id: true,
        eventType: true,
        description: true,
        riskLevel: true,
        timestamp: true,
        email: true,
        ipAddress: true,
        success: true
      }
    })

    // 4. Alertes critiques (7 derniers jours)
    const criticalAlerts = await prisma.auditLog.findMany({
      where: {
        riskLevel: 'critical',
        timestamp: { gte: last7days }
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        eventType: true,
        description: true,
        timestamp: true,
        email: true,
        ipAddress: true
      }
    })

    // 5. Santé du système
    const failedLogins24h = await prisma.auditLog.count({
      where: {
        eventType: 'login_failed',
        timestamp: { gte: last24h }
      }
    })

    const blockedContent24h = await prisma.auditLog.count({
      where: {
        eventType: 'content_blocked',
        timestamp: { gte: last24h }
      }
    })

    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (criticalAlerts.length > 0) systemStatus = 'critical'
    else if (suspiciousSessions.length > 5 || failedLogins24h > 20) systemStatus = 'warning'

    const data = {
      totalUsers,
      activeUsers: activeUsersCount,
      totalSessions,
      suspiciousSessions: suspiciousSessions.length,
      suspiciousSessionsList: suspiciousSessions.map(s => ({
        id: s.id,
        userEmail: s.user.email,
        riskScore: s.riskScore,
        ipAddress: s.ipAddress,
        location: s.location,
        browser: s.browser,
        lastActivity: s.lastActivity,
        isSuspicious: s.isSuspicious
      })),
      recentSecurityEvents: recentSecurityEvents.map(e => ({
        id: e.id,
        type: e.eventType,
        description: e.description,
        risk: e.riskLevel,
        timestamp: e.timestamp,
        email: e.email || 'N/A',
        ip: e.ipAddress,
        success: e.success
      })),
      criticalAlerts: criticalAlerts.map(a => ({
        id: a.id,
        type: a.eventType,
        description: a.description,
        timestamp: a.timestamp,
        email: a.email || 'N/A',
        ip: a.ipAddress
      })),
      systemHealth: {
        status: systemStatus,
        uptime: '99.9%', // TODO: implémenter vraie uptime
        lastCleanup: new Date().toISOString(),
        failedLogins24h,
        blockedContent24h
      }
    }

    logger.info('📊 Security stats response:', {
      totalUsers,
      suspiciousSessionsCount: suspiciousSessions.length,
      eventsCount: recentSecurityEvents.length,
      alertsCount: criticalAlerts.length,
      systemStatus
    }, req.user.id, ip)

    res.status(200).json({ success: true, data })
  } catch (error) {
    logger.error('Security stats error:', error, req.user.id, ip)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})