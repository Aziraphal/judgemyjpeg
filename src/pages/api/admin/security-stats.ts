import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { getClientIP, logger } from '@/lib/logger'

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
    // Mock data pour les stats de sécurité
    const data = {
      totalUsers: 42,
      activeUsers: 12,
      totalSessions: 18,
      suspiciousSessions: 0,
      recentSecurityEvents: [],
      criticalAlerts: [],
      systemHealth: {
        status: 'healthy',
        uptime: '99.9%',
        lastCleanup: new Date().toISOString()
      }
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    logger.error('Security stats error:', error, req.user.id, ip)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})