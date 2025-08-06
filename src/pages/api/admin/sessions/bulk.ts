/**
 * Admin Bulk Sessions API
 * Actions en masse sur les sessions pour les administrateurs
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdminAuth } from '../auth'
import { prisma } from '@/lib/prisma'
import { invalidateSession } from '@/lib/advanced-session'
import { AuditLogger } from '@/lib/audit-trail'

interface BulkSessionsResponse {
  success: boolean
  message: string
  affected?: number
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkSessionsResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const auditLogger = new AuditLogger(req, undefined, 'admin')

  try {
    const { sessionIds, action = 'invalidate' } = req.body

    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste de sessions requise'
      })
    }

    if (sessionIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limite de 100 sessions par action en masse'
      })
    }

    // Récupérer les informations des sessions avant action
    const sessions = await prisma.userSession.findMany({
      where: {
        id: { in: sessionIds },
        isActive: true
      },
      include: {
        user: {
          select: { email: true, id: true }
        }
      }
    })

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune session active trouvée'
      })
    }

    let affectedCount = 0

    if (action === 'invalidate') {
      // Invalider toutes les sessions sélectionnées
      for (const session of sessions) {
        try {
          await invalidateSession(session.id, 'admin_bulk_invalidation')
          affectedCount++
        } catch (error) {
          console.error(`Failed to invalidate session ${session.id}:`, error)
        }
      }

      // Audit log pour l'action en masse
      await auditLogger.logSecurity('admin_bulk_session_invalidation', {
        description: `Admin performed bulk invalidation of ${affectedCount} sessions`,
        success: true,
        riskLevel: 'medium',
        metadata: {
          requestedSessions: sessionIds.length,
          affectedSessions: affectedCount,
          targetUsers: sessions.map(s => ({
            userId: s.userId,
            email: s.user.email,
            deviceName: s.deviceName
          }))
        }
      })

      res.status(200).json({
        success: true,
        message: `${affectedCount} sessions invalidées avec succès`,
        affected: affectedCount
      })

    } else if (action === 'mark_suspicious') {
      // Marquer les sessions comme suspectes
      const updateResult = await prisma.userSession.updateMany({
        where: {
          id: { in: sessionIds },
          isActive: true
        },
        data: {
          isSuspicious: true,
          riskScore: { increment: 25 }
        }
      })

      await auditLogger.logSecurity('admin_bulk_session_suspicious', {
        description: `Admin marked ${updateResult.count} sessions as suspicious`,
        success: true,
        riskLevel: 'medium',
        metadata: {
          sessionIds,
          affectedCount: updateResult.count
        }
      })

      res.status(200).json({
        success: true,
        message: `${updateResult.count} sessions marquées comme suspectes`,
        affected: updateResult.count
      })

    } else if (action === 'clear_suspicious') {
      // Retirer le marquage suspect
      const updateResult = await prisma.userSession.updateMany({
        where: {
          id: { in: sessionIds },
          isActive: true
        },
        data: {
          isSuspicious: false,
          riskScore: { decrement: 25 }
        }
      })

      await auditLogger.logSecurity('admin_bulk_session_clear_suspicious', {
        description: `Admin cleared suspicious flag from ${updateResult.count} sessions`,
        success: true,
        riskLevel: 'low',
        metadata: {
          sessionIds,
          affectedCount: updateResult.count
        }
      })

      res.status(200).json({
        success: true,
        message: `${updateResult.count} sessions nettoyées du marquage suspect`,
        affected: updateResult.count
      })

    } else {
      return res.status(400).json({
        success: false,
        message: 'Action non supportée'
      })
    }

  } catch (error) {
    console.error('Bulk sessions API error:', error)
    
    await auditLogger.logSecurity('admin_bulk_sessions_error', {
      description: 'Admin bulk sessions API error',
      success: false,
      riskLevel: 'high',
      metadata: { error: String(error) }
    })

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'action en masse'
    })
  }
}

export default requireAdminAuth(handler)