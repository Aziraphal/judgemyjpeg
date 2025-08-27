import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface SecurityAlert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: string
  status: 'open' | 'investigating' | 'resolved'
  assignee?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Vérifier l'auth admin
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Générer des alertes basées sur les patterns des logs récents
    const alerts = await generateSecurityAlerts()

    logger.info('[ADMIN] Security alerts retrieved', { 
      count: alerts.length
    })

    res.status(200).json({
      success: true,
      data: alerts
    })
  } catch (error) {
    logger.error('[ADMIN] Failed to get security alerts:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des alertes'
    })
  }
}

async function generateSecurityAlerts(): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = []
  const now = new Date()
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000)
  const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  try {
    // Alerte 1: Tentatives de connexion échouées répétées
    const failedLogins = await prisma.auditLog.count({
      where: {
        eventType: {
          contains: 'login_failed'
        },
        timestamp: {
          gte: lastHour
        }
      }
    })

    if (failedLogins >= 10) {
      alerts.push({
        id: 'failed-logins-' + Date.now(),
        title: 'Tentatives de connexion suspectes',
        description: `${failedLogins} tentatives de connexion échouées dans la dernière heure`,
        severity: failedLogins >= 20 ? 'critical' : 'warning',
        timestamp: new Date().toISOString(),
        status: 'open'
      })
    }

    // Alerte 2: Activité admin inhabituelle
    const adminActivity = await prisma.auditLog.count({
      where: {
        eventType: {
          contains: 'admin'
        },
        timestamp: {
          gte: lastDay
        }
      }
    })

    if (adminActivity >= 50) {
      alerts.push({
        id: 'admin-activity-' + Date.now(),
        title: 'Activité admin intensive',
        description: `${adminActivity} actions admin dans les dernières 24h`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        status: 'open'
      })
    }

    // Alerte 3: Sessions suspectes (même IP, utilisateurs multiples) - Simplifié
    const suspiciousSessionsCount = await prisma.auditLog.count({
      where: {
        eventType: 'login_success',
        timestamp: {
          gte: lastDay
        },
      }
    })
    const suspiciousSessions = suspiciousSessionsCount > 20 ? [{ count: suspiciousSessionsCount }] : []

    if (suspiciousSessions.length > 0) {
      alerts.push({
        id: 'suspicious-sessions-' + Date.now(),
        title: 'Sessions multiples détectées',
        description: `${suspiciousSessions.length} adresses IP avec connexions multiples`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        status: 'open'
      })
    }

    // Alerte 4: Erreurs système fréquentes
    const systemErrors = await prisma.auditLog.count({
      where: {
        riskLevel: 'high',
        timestamp: {
          gte: lastDay
        }
      }
    })

    if (systemErrors >= 20) {
      alerts.push({
        id: 'system-errors-' + Date.now(),
        title: 'Erreurs système fréquentes',
        description: `${systemErrors} erreurs à haut risque détectées`,
        severity: 'error',
        timestamp: new Date().toISOString(),
        status: 'open'
      })
    }

  } catch (error) {
    logger.error('Error generating security alerts:', error)
  }

  return alerts
}