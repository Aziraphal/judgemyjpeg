/**
 * API Sessions Management - Gestion des sessions utilisateur
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './[...nextauth]'
import { 
  getUserActiveSessions, 
  invalidateSession, 
  invalidateOtherUserSessions,
  cleanupOldSessions
} from '@/lib/advanced-session'
import { AuditLogger } from '@/lib/audit-trail'
import { logger } from '@/lib/logger'

interface SessionsResponse {
  success: boolean
  message?: string
  sessions?: any[]
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionsResponse>
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    })
  }

  const auditLogger = new AuditLogger(req, session.user.id, session.user.email!)

  try {
    if (req.method === 'GET') {
      // Récupérer toutes les sessions actives de l'utilisateur
      await cleanupOldSessions(session.user.id) // Nettoyer d'abord les sessions expirées
      
      const activeSessions = await getUserActiveSessions(session.user.id)
      
      const formattedSessions = activeSessions.map(s => ({
        id: s.id,
        deviceName: s.deviceName,
        browser: s.browser,
        os: s.os,
        location: s.location,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastActivity: s.lastActivity,
        isSuspicious: s.isSuspicious,
        riskScore: s.riskScore,
        // Masquer les infos sensibles
        deviceFingerprint: s.deviceFingerprint.slice(0, 8) + '...'
      }))

      res.status(200).json({
        success: true,
        sessions: formattedSessions
      })

    } else if (req.method === 'DELETE') {
      const { sessionId, action } = req.body

      if (action === 'invalidate_session' && sessionId) {
        // Invalider une session spécifique
        await invalidateSession(sessionId, 'user_requested')
        
        await auditLogger.logSecurity('session_invalidated', {
          description: 'User manually invalidated a session',
          metadata: { sessionId },
          success: true
        })

        res.status(200).json({
          success: true,
          message: 'Session invalidée avec succès'
        })

      } else if (action === 'invalidate_all_others') {
        // Invalider toutes les autres sessions
        const count = await invalidateOtherUserSessions(
          session.user.id, 
          '', // Pas de session courante à préserver (API call)
          'user_requested_all'
        )

        await auditLogger.logSecurity('sessions_bulk_invalidated', {
          description: `User invalidated ${count} other sessions`,
          metadata: { invalidatedCount: count },
          success: true,
          riskLevel: 'medium'
        })

        res.status(200).json({
          success: true,
          message: `${count} sessions invalidées avec succès`
        })

      } else {
        res.status(400).json({
          success: false,
          message: 'Action invalide ou paramètres manquants'
        })
      }

    } else {
      res.status(405).json({
        success: false,
        message: 'Method not allowed'
      })
    }

  } catch (error) {
    logger.error('Sessions API error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
}