import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { AuditLogger } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'

interface ReportData {
  photoId?: string
  photoUrl?: string
  reason: string
  details?: string
  timestamp: string
}

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const auditLogger = new AuditLogger(req, req.user.id, req.user.email)
  
  try {
    const { photoId, photoUrl, reason, details, timestamp }: ReportData = req.body

    // Validation
    if (!reason) {
      return res.status(400).json({ error: 'Raison du signalement requise' })
    }

    const validReasons = [
      'nudity', 'violence', 'hate', 'illegal', 
      'harassment', 'privacy', 'spam', 'other'
    ]
    
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Raison invalide' })
    }

    // Vérifier si l'utilisateur n'abuse pas des signalements (max 10/jour)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const reportsToday = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM Report 
      WHERE reporterId = ${req.user.id} 
      AND createdAt >= ${today}
    ` as Array<{ count: BigInt }>

    const reportCount = Number(reportsToday[0]?.count || 0)
    
    if (reportCount >= 10) {
      // Log de sécurité dans logger normal
      logger.warn('Report abuse detected', { reportsToday: reportCount }, req.user.id, ip)
      
      return res.status(429).json({ 
        error: 'Trop de signalements aujourd\'hui',
        details: 'Limite: 10 signalements par jour'
      })
    }

    // Créer le signalement
    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        photoId: photoId || null,
        photoUrl: photoUrl || null,
        reason: reason,
        details: details || null,
        status: 'pending',
        reporterIp: ip
      }
    })

    // Log de sécurité
    logger.warn('Content reported by user', {
      reportId: report.id,
      reason,
      photoId,
      details: details?.substring(0, 100) // Limiter les logs
    }, req.user.id, ip)

    // Audit trail
    // Audit dans les logs normaux
    logger.info('Content reported successfully', { reportId: report.id, reason }, req.user.id, ip)

    // Notification immédiate pour contenus critiques
    if (['nudity', 'violence', 'illegal', 'harassment'].includes(reason)) {
      // Envoyer notification email admin (à implémenter selon vos besoins)
      logger.error('CRITICAL CONTENT REPORTED - ADMIN ATTENTION REQUIRED', {
        reportId: report.id,
        reason,
        userEmail: req.user.email,
        timestamp: new Date().toISOString()
      }, req.user.id, ip)
    }

    res.status(200).json({ 
      success: true,
      reportId: report.id,
      message: 'Signalement reçu et en cours de traitement'
    })

  } catch (error) {
    logger.error('Report submission error', { error: error instanceof Error ? error.message : 'Unknown error' }, req.user.id, ip)
    
    res.status(500).json({ 
      error: 'Erreur lors du signalement'
    })
  }
})