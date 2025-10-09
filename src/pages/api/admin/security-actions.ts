import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { getClientIP, logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

/**
 * API Admin - Actions de sécurité
 * - Bannir/débannir IPs
 * - Suspendre/activer utilisateurs
 * - Invalider sessions suspectes
 */
export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const ip = getClientIP(req)

  // 🔒 VÉRIFICATION ADMIN
  if (!req.user.isAdmin && req.user.role !== 'admin') {
    logger.warn('🚨 TENTATIVE ACCÈS NON AUTORISÉ - Security Actions', {
      userId: req.user.id,
      email: req.user.email,
    }, req.user.id, ip)
    return res.status(403).json({ error: 'Accès interdit' })
  }

  try {
    const { action, target } = req.body

    switch (action) {
      // ============ GESTION IPs ============
      case 'ban_ip': {
        const { ipAddress, reason, duration } = target // duration en heures (null = permanent)

        const expiresAt = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null

        const bannedIP = await prisma.bannedIP.create({
          data: {
            ipAddress,
            reason,
            bannedBy: req.user.id,
            expiresAt,
            metadata: JSON.stringify({ bannedByEmail: req.user.email })
          }
        })

        // Log audit
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            email: req.user.email,
            ipAddress: ip,
            eventType: 'ip_banned',
            description: `IP ${ipAddress} bannie: ${reason}`,
            metadata: JSON.stringify({ targetIP: ipAddress, duration }),
            riskLevel: 'high',
            success: true
          }
        })

        logger.info(`🚫 IP bannie: ${ipAddress}`, { reason, duration, admin: req.user.email }, req.user.id, ip)
        return res.status(200).json({ success: true, data: bannedIP })
      }

      case 'unban_ip': {
        const { ipAddress } = target

        await prisma.bannedIP.updateMany({
          where: { ipAddress, isActive: true },
          data: { isActive: false }
        })

        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            email: req.user.email,
            ipAddress: ip,
            eventType: 'ip_unbanned',
            description: `IP ${ipAddress} débannie`,
            metadata: JSON.stringify({ targetIP: ipAddress }),
            riskLevel: 'medium',
            success: true
          }
        })

        logger.info(`✅ IP débannie: ${ipAddress}`, { admin: req.user.email }, req.user.id, ip)
        return res.status(200).json({ success: true })
      }

      case 'list_banned_ips': {
        const bannedIPs = await prisma.bannedIP.findMany({
          where: { isActive: true },
          orderBy: { bannedAt: 'desc' },
          take: 100
        })
        return res.status(200).json({ success: true, data: bannedIPs })
      }

      // ============ GESTION UTILISATEURS ============
      case 'suspend_user': {
        const { userId, reason, duration } = target // duration en jours (null = permanent)

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur introuvable' })
        }

        // Marquer comme suspendu en changeant le rôle
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: 'suspended'
          }
        })

        // Invalider toutes les sessions actives
        await prisma.userSession.updateMany({
          where: { userId, isActive: true },
          data: {
            isActive: false,
            invalidatedAt: new Date(),
            invalidationReason: `Suspension: ${reason}`
          }
        })

        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            email: req.user.email,
            ipAddress: ip,
            eventType: 'user_suspended',
            description: `Utilisateur ${user.email} suspendu: ${reason}`,
            metadata: JSON.stringify({ targetUserId: userId, duration }),
            riskLevel: 'high',
            success: true
          }
        })

        logger.warn(`⛔ Utilisateur suspendu: ${user.email}`, { reason, admin: req.user.email }, req.user.id, ip)
        return res.status(200).json({ success: true })
      }

      case 'activate_user': {
        const { userId } = target

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur introuvable' })
        }

        await prisma.user.update({
          where: { id: userId },
          data: { role: 'user' }
        })

        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            email: req.user.email,
            ipAddress: ip,
            eventType: 'user_activated',
            description: `Utilisateur ${user.email} réactivé`,
            metadata: JSON.stringify({ targetUserId: userId }),
            riskLevel: 'medium',
            success: true
          }
        })

        logger.info(`✅ Utilisateur réactivé: ${user.email}`, { admin: req.user.email }, req.user.id, ip)
        return res.status(200).json({ success: true })
      }

      // ============ GESTION SESSIONS ============
      case 'invalidate_session': {
        const { sessionId, reason } = target

        await prisma.userSession.update({
          where: { id: sessionId },
          data: {
            isActive: false,
            invalidatedAt: new Date(),
            invalidationReason: reason
          }
        })

        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            email: req.user.email,
            ipAddress: ip,
            eventType: 'session_invalidated',
            description: `Session ${sessionId} invalidée: ${reason}`,
            metadata: JSON.stringify({ targetSessionId: sessionId }),
            riskLevel: 'medium',
            success: true
          }
        })

        logger.info(`🔒 Session invalidée: ${sessionId}`, { reason, admin: req.user.email }, req.user.id, ip)
        return res.status(200).json({ success: true })
      }

      case 'invalidate_all_user_sessions': {
        const { userId, reason } = target

        const result = await prisma.userSession.updateMany({
          where: { userId, isActive: true },
          data: {
            isActive: false,
            invalidatedAt: new Date(),
            invalidationReason: reason
          }
        })

        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            email: req.user.email,
            ipAddress: ip,
            eventType: 'all_sessions_invalidated',
            description: `Toutes les sessions de l'utilisateur ${userId} invalidées: ${reason}`,
            metadata: JSON.stringify({ targetUserId: userId, count: result.count }),
            riskLevel: 'high',
            success: true
          }
        })

        logger.warn(`🔒 Toutes sessions invalidées pour userId: ${userId}`, { count: result.count, admin: req.user.email }, req.user.id, ip)
        return res.status(200).json({ success: true, count: result.count })
      }

      default:
        return res.status(400).json({ error: 'Action invalide' })
    }
  } catch (error) {
    logger.error('Security action error:', error, req.user.id, ip)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})
