/**
 * Admin Sessions API
 * Gestion des sessions pour les administrateurs
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdminAuth } from './auth'
import { prisma } from '@/lib/prisma'
import { invalidateSession } from '@/lib/advanced-session'
import { AuditLogger } from '@/lib/audit-trail'
import { logger } from '@/lib/logger'

interface SessionsResponse {
  success: boolean
  data?: any[]
  message?: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionsResponse>
) {
  const auditLogger = new AuditLogger(req, undefined, 'admin')

  try {
    if (req.method === 'GET') {
      // Récupérer toutes les sessions avec informations utilisateur
      const sessions = await prisma.userSession.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: [
          { isSuspicious: 'desc' },
          { riskScore: 'desc' },
          { lastActivity: 'desc' }
        ]
      })

      const formattedSessions = sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        userEmail: session.user.email,
        userName: session.user.name,
        deviceName: session.deviceName,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        location: session.location,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        isSuspicious: session.isSuspicious,
        riskScore: session.riskScore,
        deviceFingerprint: session.deviceFingerprint.slice(0, 8) + '...' // Masquer pour sécurité
      }))

      await auditLogger.logSecurity('admin_sessions_viewed', {
        description: 'Admin viewed sessions list',
        success: true,
        metadata: { sessionsCount: sessions.length }
      })

      res.status(200).json({
        success: true,
        data: formattedSessions
      })

    } else if (req.method === 'DELETE') {
      const { sessionId } = req.body

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID requis'
        })
      }

      // Récupérer les infos de la session avant invalidation
      const session = await prisma.userSession.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            select: { email: true }
          }
        }
      })

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session non trouvée'
        })
      }

      // Invalider la session
      await invalidateSession(sessionId, 'admin_forced_invalidation')

      await auditLogger.logSecurity('admin_session_invalidated', {
        description: `Admin invalidated session for user ${session.user.email}`,
        success: true,
        riskLevel: 'medium',
        metadata: {
          sessionId,
          targetUserId: session.userId,
          targetUserEmail: session.user.email,
          deviceName: session.deviceName,
          ipAddress: session.ipAddress
        }
      })

      res.status(200).json({
        success: true,
        message: 'Session invalidée avec succès'
      })

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed'
      })
    }

  } catch (error) {
    logger.error('Admin sessions API error:', error)
    
    await auditLogger.logSecurity('admin_sessions_error', {
      description: 'Admin sessions API error',
      success: false,
      riskLevel: 'high',
      metadata: { error: String(error) }
    })

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
}

export default requireAdminAuth(handler)