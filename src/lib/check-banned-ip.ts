import { NextApiRequest, NextApiResponse } from 'next'
import { getClientIP, logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

/**
 * Middleware pour vérifier si l'IP est bannie
 * À utiliser au début des routes critiques
 */
export async function checkBannedIP(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const ip = getClientIP(req)

  try {
    // Vérifier si l'IP est bannie
    const bannedIP = await prisma.bannedIP.findFirst({
      where: {
        ipAddress: ip,
        isActive: true,
        OR: [
          { expiresAt: null }, // Ban permanent
          { expiresAt: { gte: new Date() } } // Ban temporaire non expiré
        ]
      }
    })

    if (bannedIP) {
      logger.warn('🚫 IP bannie tentative d\'accès', {
        ip,
        reason: bannedIP.reason,
        bannedAt: bannedIP.bannedAt,
        expiresAt: bannedIP.expiresAt
      })

      // Log dans audit
      await prisma.auditLog.create({
        data: {
          ipAddress: ip,
          eventType: 'banned_ip_attempt',
          description: `Tentative d'accès par IP bannie: ${bannedIP.reason}`,
          metadata: JSON.stringify({ bannedIPId: bannedIP.id }),
          riskLevel: 'critical',
          success: false
        }
      })

      res.status(403).json({
        error: 'Accès refusé',
        message: 'Votre adresse IP a été bloquée. Contactez le support si vous pensez qu\'il s\'agit d\'une erreur.'
      })

      return false // IP bannie
    }

    return true // IP OK
  } catch (error) {
    logger.error('Error checking banned IP:', error)
    // En cas d'erreur, laisser passer (fail-open pour ne pas bloquer le service)
    return true
  }
}

/**
 * Fonction de nettoyage des bans expirés (à appeler via cron)
 */
export async function cleanupExpiredBans() {
  try {
    const result = await prisma.bannedIP.updateMany({
      where: {
        expiresAt: { lte: new Date() },
        isActive: true
      },
      data: { isActive: false }
    })

    logger.info(`🧹 Nettoyage bans expirés: ${result.count} IPs débannies`)
    return result.count
  } catch (error) {
    logger.error('Error cleaning up expired bans:', error)
    return 0
  }
}
