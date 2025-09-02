import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { collectBusinessMetrics } from '@/lib/business-metrics'
import { logger } from '@/lib/logger'

/**
 * API Admin - Métriques Business en Temps Réel
 * GET /api/admin/business-metrics
 * 
 * Authentification: Session NextAuth requise avec email admin
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Vérification session NextAuth
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' })
    }
    
    // Vérification admin (même liste que dans la page)
    const adminEmails = ['admin@judgemyjpeg.com', 'contact@judgemyjpeg.com']
    if (!adminEmails.includes(session.user.email)) {
      logger.security('Unauthorized admin access attempt', {
        endpoint: '/api/admin/business-metrics',
        email: session.user.email
      })
      return res.status(403).json({ error: 'Forbidden - Admin access required' })
    }

    // Collecte des métriques
    const metrics = await collectBusinessMetrics()

    // Headers pour éviter le cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    // Réponse avec timestamp
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      // Indicateurs de santé rapides
      health_summary: {
        overall_status: getOverallHealthStatus(metrics),
        critical_issues: getCriticalIssues(metrics),
        uptime_24h: 99.9 // TODO: Calculer depuis logs
      }
    })

  } catch (error) {
    logger.error('Erreur API business metrics:', error)
    res.status(500).json({ 
      error: 'Failed to collect business metrics',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Calcule le statut de santé global
 */
function getOverallHealthStatus(metrics: any): 'healthy' | 'warning' | 'critical' {
  const issues = getCriticalIssues(metrics)
  
  if (issues.some(issue => issue.severity === 'critical')) {
    return 'critical'
  }
  
  if (issues.length > 0) {
    return 'warning'
  }
  
  return 'healthy'
}

/**
 * Identifie les problèmes critiques
 */
function getCriticalIssues(metrics: any): Array<{severity: string, message: string}> {
  const issues = []

  // Taux d'erreur élevé
  if (1 - metrics.analyses.success_rate > 0.05) {
    issues.push({
      severity: 'critical',
      message: `Taux d'erreur analyses: ${((1-metrics.analyses.success_rate)*100).toFixed(1)}%`
    })
  }

  // APIs externes en panne
  if (metrics.api_health.openai_status === 'down') {
    issues.push({
      severity: 'critical', 
      message: 'OpenAI API inaccessible'
    })
  }

  if (metrics.api_health.stripe_status === 'down') {
    issues.push({
      severity: 'critical',
      message: 'Stripe API inaccessible'
    })
  }

  // DB lente
  if (metrics.api_health.db_response_time > 2000) {
    issues.push({
      severity: 'warning',
      message: `DB réponse lente: ${metrics.api_health.db_response_time}ms`
    })
  }

  return issues
}