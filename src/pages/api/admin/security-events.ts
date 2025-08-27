import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Vérifier l'auth admin (token simple pour le moment)
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { riskLevel, eventType, timeRange, success } = req.query

    // Calculer la date limite selon timeRange
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    // Construire la requête de base (utilise les logs audit)
    const whereClause: any = {
      timestamp: {
        gte: startDate
      }
    }

    if (eventType) {
      whereClause.eventType = {
        contains: eventType as string
      }
    }

    // Récupérer les événements depuis la table audit_logs
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    })

    // Transformer les logs audit en événements de sécurité
    const securityEvents = auditLogs.map(log => ({
      id: log.id,
      eventType: log.eventType,
      description: log.description || `${log.eventType} event`,
      riskLevel: determineRiskLevel(log.eventType, log.riskLevel || 'low'),
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress || 'unknown',
      email: log.email,
      userId: log.userId,
      metadata: log.metadata,
      success: log.success ?? true
    })).filter(event => {
      // Filtrer par niveau de risque
      if (riskLevel && event.riskLevel !== riskLevel) return false
      
      // Filtrer par succès/échec
      if (success !== undefined) {
        const successFilter = success === 'true'
        if (event.success !== successFilter) return false
      }
      
      return true
    })

    logger.info('[ADMIN] Security events retrieved', { 
      count: securityEvents.length,
      filters: { riskLevel, eventType, timeRange, success }
    })

    res.status(200).json({
      success: true,
      data: securityEvents
    })
  } catch (error) {
    logger.error('[ADMIN] Failed to get security events:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des événements'
    })
  }
}

function determineRiskLevel(eventType: string, defaultLevel: string): 'low' | 'medium' | 'high' | 'critical' {
  const eventLower = eventType.toLowerCase()
  
  // Événements critiques
  if (eventLower.includes('admin') || eventLower.includes('password_reset') || 
      eventLower.includes('account_deletion') || eventLower.includes('payment_fraud')) {
    return 'critical'
  }
  
  // Événements à risque élevé
  if (eventLower.includes('login_failed') || eventLower.includes('2fa_failed') || 
      eventLower.includes('suspicious') || eventLower.includes('blocked')) {
    return 'high'
  }
  
  // Événements à risque moyen
  if (eventLower.includes('login') || eventLower.includes('session') || 
      eventLower.includes('password') || eventLower.includes('email_change')) {
    return 'medium'
  }
  
  // Défaut ou niveau spécifié
  return (defaultLevel as any) || 'low'
}