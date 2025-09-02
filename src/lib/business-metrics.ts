/**
 * Business Metrics & Alerting System v1.1.0
 * Monitoring des métriques critiques pour JudgeMyJPEG
 */
import * as Sentry from '@sentry/nextjs'
import { logger } from './logger'
import { prisma } from './prisma'

// Types des métriques business
export interface BusinessMetrics {
  analyses: {
    total: number
    success_rate: number
    avg_processing_time: number
    errors_last_hour: number
  }
  subscriptions: {
    active_premium: number
    new_signups_today: number
    churn_rate_7d: number
    mrr: number
  }
  api_health: {
    openai_status: 'healthy' | 'degraded' | 'down'
    stripe_status: 'healthy' | 'degraded' | 'down'
    db_response_time: number
  }
}

// Seuils d'alerte critiques
const CRITICAL_THRESHOLDS = {
  analysis_error_rate: 0.05,        // 5% d'erreurs max
  avg_processing_time: 30000,       // 30s max par analyse
  db_response_time: 2000,           // 2s max DB
  openai_errors_per_hour: 10,       // 10 erreurs IA/h max
  new_signups_drop: 0.5             // Baisse 50% signups = alerte
}

/**
 * Collecte les métriques business en temps réel
 */
export async function collectBusinessMetrics(): Promise<BusinessMetrics> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  try {
    // Métriques d'analyse
    const [totalAnalyses, recentAnalyses, recentFailures] = await Promise.all([
      prisma.photo.count({ where: { analysis: { not: null } } }),
      prisma.photo.count({ where: { createdAt: { gte: oneHourAgo } } }),
      // Compter les photos sans score = échec analyse
      prisma.photo.count({ 
        where: { 
          createdAt: { gte: oneHourAgo },
          score: null 
        } 
      })
    ])

    // Métriques subscriptions
    const [activePremium, newSignupsToday, totalUsers] = await Promise.all([
      prisma.user.count({ 
        where: { 
          subscriptionStatus: { in: ['premium', 'annual'] } 
        } 
      }),
      prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.user.count()
    ])

    // Calcul taux de succès analyses
    const successRate = recentAnalyses > 0 
      ? Math.max(0, (recentAnalyses - recentFailures) / recentAnalyses)
      : 1

    // Test santé APIs (rapide)
    const apiHealth = await checkAPIHealth()

    const metrics: BusinessMetrics = {
      analyses: {
        total: totalAnalyses,
        success_rate: successRate,
        avg_processing_time: 15000, // TODO: Implémenter tracking temps réel
        errors_last_hour: recentFailures
      },
      subscriptions: {
        active_premium: activePremium,
        new_signups_today: newSignupsToday,
        churn_rate_7d: 0, // TODO: Calculer depuis audit logs
        mrr: activePremium * 9.99 // Estimation simple
      },
      api_health: apiHealth
    }

    // Envoyer à Sentry pour dashboard
    Sentry.addBreadcrumb({
      category: 'business.metrics',
      data: metrics,
      level: 'info'
    })

    // Vérifier seuils critiques
    await checkCriticalAlerts(metrics)

    return metrics

  } catch (error) {
    logger.error('Erreur collecte métriques business:', error)
    Sentry.captureException(error, {
      tags: { component: 'business-metrics' }
    })
    throw error
  }
}

/**
 * Vérifie la santé des APIs externes
 */
async function checkAPIHealth(): Promise<BusinessMetrics['api_health']> {
  const checks = await Promise.allSettled([
    // Test OpenAI (ping simple)
    fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(5000)
    }),
    
    // Test Stripe (ping simple)  
    fetch('https://api.stripe.com/v1/charges?limit=1', {
      headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      signal: AbortSignal.timeout(5000)
    })
  ])

  const dbStart = Date.now()
  try {
    await prisma.user.findFirst()
    var dbResponseTime = Date.now() - dbStart
  } catch {
    var dbResponseTime = 9999
  }

  return {
    openai_status: checks[0].status === 'fulfilled' ? 'healthy' : 'down',
    stripe_status: checks[1].status === 'fulfilled' ? 'healthy' : 'down', 
    db_response_time: dbResponseTime
  }
}

/**
 * Vérifie les seuils critiques et envoie alertes
 */
async function checkCriticalAlerts(metrics: BusinessMetrics): Promise<void> {
  const alerts: string[] = []

  // Taux d'erreur analyses trop élevé
  if (1 - metrics.analyses.success_rate > CRITICAL_THRESHOLDS.analysis_error_rate) {
    alerts.push(`🚨 Taux erreur analyses: ${((1-metrics.analyses.success_rate)*100).toFixed(1)}% (seuil: ${CRITICAL_THRESHOLDS.analysis_error_rate*100}%)`)
  }

  // Base données trop lente
  if (metrics.api_health.db_response_time > CRITICAL_THRESHOLDS.db_response_time) {
    alerts.push(`⚠️ DB réponse lente: ${metrics.api_health.db_response_time}ms (seuil: ${CRITICAL_THRESHOLDS.db_response_time}ms)`)
  }

  // APIs externes en panne
  if (metrics.api_health.openai_status === 'down') {
    alerts.push(`🔥 OpenAI API inaccessible - Analyses bloquées`)
  }
  
  if (metrics.api_health.stripe_status === 'down') {
    alerts.push(`💳 Stripe API inaccessible - Paiements bloqués`)
  }

  // Envoyer alertes critiques à Sentry
  if (alerts.length > 0) {
    Sentry.captureException(new Error('Business metrics critical alert'), {
      level: 'error',
      tags: {
        component: 'business-monitoring',
        alert_type: 'critical_threshold'
      },
      extra: {
        alerts,
        metrics,
        timestamp: new Date().toISOString()
      }
    })

    logger.error('🚨 ALERTES BUSINESS CRITIQUES:', { alerts, metrics })
  }
}

/**
 * Enregistre une métrique d'analyse (timing + succès)
 */
export function recordAnalysisMetric(photoId: string, duration: number, success: boolean, error?: string): void {
  const metric = {
    photo_id: photoId,
    duration_ms: duration,
    success,
    error,
    timestamp: new Date().toISOString()
  }

  // Sentry performance
  Sentry.addBreadcrumb({
    category: 'business.analysis',
    data: metric,
    level: success ? 'info' : 'warning'
  })

  // Log structuré pour agrégation
  logger.info(success ? '✅ Analyse réussie' : '❌ Analyse échouée', metric)
}

/**
 * Enregistre une métrique de conversion
 */
export function recordConversionMetric(userId: string, plan: string, amount: number): void {
  const metric = {
    user_id: userId,
    plan,
    amount,
    timestamp: new Date().toISOString()
  }

  Sentry.addBreadcrumb({
    category: 'business.conversion',
    data: metric,
    level: 'info'
  })

  logger.info('💰 Conversion réussie', metric)
}