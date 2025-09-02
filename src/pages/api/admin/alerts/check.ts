/**
 * API Admin - Vérification et envoi d'alertes automatiques
 * GET /api/admin/alerts/check
 * POST /api/admin/alerts/test
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { collectBusinessMetrics } from '@/lib/business-metrics'
import { checkAndSendAlerts, testAlertSystem, getAlertStatus } from '@/lib/admin-alerts'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authentification admin
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    const adminEmails = ['admin@judgemyjpeg.com', 'contact@judgemyjpeg.com', 'cyril.paquier@gmail.com']
    if (!adminEmails.includes(session.user.email)) {
      logger.security('Unauthorized admin alerts access', {
        endpoint: '/api/admin/alerts/check',
        email: session.user.email
      })
      return res.status(403).json({ error: 'Admin access required' })
    }

    if (req.method === 'GET') {
      // Vérification normale des alertes
      const metrics = await collectBusinessMetrics()
      const alerts = await checkAndSendAlerts(metrics)
      const status = getAlertStatus()
      
      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        alerts_triggered: alerts.length,
        alerts,
        alert_status: status,
        metrics_summary: {
          analyses_total: metrics.analyses.total,
          success_rate: `${(metrics.analyses.success_rate * 100).toFixed(1)}%`,
          errors_1h: metrics.analyses.errors_last_hour,
          db_response: `${metrics.api_health.db_response_time}ms`,
          apis_status: {
            openai: metrics.api_health.openai_status,
            stripe: metrics.api_health.stripe_status
          }
        }
      })
      
    } else if (req.method === 'POST') {
      // Test du système d'alertes
      const testResult = await testAlertSystem()
      
      res.status(200).json({
        success: true,
        test_completed: testResult.success,
        test_alerts: testResult.alerts.length,
        alerts: testResult.alerts,
        message: testResult.success 
          ? `Test réussi: ${testResult.alerts.length} alertes générées avec des métriques critiques simulées`
          : 'Test échoué: Erreur lors de la génération des alertes'
      })
      
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
    
  } catch (error) {
    logger.error('Admin alerts check error:', error)
    res.status(500).json({ 
      error: 'Failed to check alerts',
      timestamp: new Date().toISOString()
    })
  }
}