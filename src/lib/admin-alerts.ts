/**
 * Admin Alert System - Notifications proactives pour problèmes critiques
 * Surveille les métriques business et envoie des alertes automatiques
 */

import { sendCriticalSecurityAlert } from './email-service'
import { logger } from './logger'

interface AlertThreshold {
  metric: string
  critical: number
  warning: number
  message: (value: number, threshold: number) => string
}

interface BusinessMetrics {
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

interface Alert {
  type: 'critical' | 'warning'
  metric: string
  message: string
  value: number
  threshold: number
  timestamp: Date
}

// Seuils d'alerte configurables
const ALERT_THRESHOLDS: AlertThreshold[] = [
  {
    metric: 'analyses.success_rate',
    critical: 0.85, // Moins de 85% de succès = critique
    warning: 0.95,  // Moins de 95% = attention
    message: (value, threshold) => `Taux de succès des analyses trop bas: ${(value * 100).toFixed(1)}% (seuil: ${(threshold * 100)}%)`
  },
  {
    metric: 'analyses.errors_last_hour',
    critical: 20, // Plus de 20 erreurs/heure = critique
    warning: 10,  // Plus de 10 erreurs/heure = attention
    message: (value, threshold) => `Trop d'erreurs d'analyse: ${value} erreurs en 1h (seuil: ${threshold})`
  },
  {
    metric: 'analyses.avg_processing_time',
    critical: 30000, // Plus de 30s = critique
    warning: 20000,  // Plus de 20s = attention
    message: (value, threshold) => `Temps d'analyse trop lent: ${Math.round(value/1000)}s (seuil: ${threshold/1000}s)`
  },
  {
    metric: 'api_health.db_response_time',
    critical: 5000, // Plus de 5s = critique
    warning: 2000,  // Plus de 2s = attention
    message: (value, threshold) => `Base de données lente: ${value}ms (seuil: ${threshold}ms)`
  }
]

// Cache pour éviter les alertes en boucle (key = metric:type, value = timestamp)
const alertCooldowns = new Map<string, number>()
const COOLDOWN_PERIOD = 30 * 60 * 1000 // 30 minutes

/**
 * Analyse les métriques et envoie des alertes si nécessaire
 */
export async function checkAndSendAlerts(metrics: BusinessMetrics): Promise<Alert[]> {
  const alerts: Alert[] = []
  
  try {
    // Vérifier chaque seuil
    for (const threshold of ALERT_THRESHOLDS) {
      const value = getMetricValue(metrics, threshold.metric)
      if (value === null) continue
      
      // Déterminer le type d'alerte
      let alertType: 'critical' | 'warning' | null = null
      let thresholdValue: number = 0
      
      if (threshold.metric.includes('success_rate')) {
        // Pour les taux de succès, plus bas = pire
        if (value < threshold.critical) {
          alertType = 'critical'
          thresholdValue = threshold.critical
        } else if (value < threshold.warning) {
          alertType = 'warning' 
          thresholdValue = threshold.warning
        }
      } else {
        // Pour les autres métriques, plus haut = pire
        if (value > threshold.critical) {
          alertType = 'critical'
          thresholdValue = threshold.critical
        } else if (value > threshold.warning) {
          alertType = 'warning'
          thresholdValue = threshold.warning
        }
      }
      
      if (alertType) {
        const cooldownKey = `${threshold.metric}:${alertType}`
        const lastAlert = alertCooldowns.get(cooldownKey) || 0
        const now = Date.now()
        
        // Vérifier cooldown pour éviter spam
        if (now - lastAlert > COOLDOWN_PERIOD) {
          const alert: Alert = {
            type: alertType,
            metric: threshold.metric,
            message: threshold.message(value, thresholdValue),
            value,
            threshold: thresholdValue,
            timestamp: new Date()
          }
          
          alerts.push(alert)
          alertCooldowns.set(cooldownKey, now)
          
          // Envoyer email pour alertes critiques
          if (alertType === 'critical') {
            await sendCriticalAlert(alert, metrics)
          }
        }
      }
    }
    
    // Vérifier APIs externes en panne
    await checkApiHealth(metrics, alerts)
    
    // Log des alertes pour suivi
    if (alerts.length > 0) {
      logger.warn(`Generated ${alerts.length} alerts`, {
        alerts: alerts.map(a => ({ type: a.type, metric: a.metric, message: a.message }))
      })
    }
    
    return alerts
    
  } catch (error) {
    logger.error('Error checking alerts:', error)
    return []
  }
}

/**
 * Vérifie la santé des APIs externes
 */
async function checkApiHealth(metrics: BusinessMetrics, alerts: Alert[]): Promise<void> {
  const apiChecks = [
    { name: 'openai', status: metrics.api_health.openai_status },
    { name: 'stripe', status: metrics.api_health.stripe_status }
  ]
  
  for (const api of apiChecks) {
    if (api.status === 'down') {
      const cooldownKey = `api.${api.name}:critical`
      const lastAlert = alertCooldowns.get(cooldownKey) || 0
      const now = Date.now()
      
      if (now - lastAlert > COOLDOWN_PERIOD) {
        const alert: Alert = {
          type: 'critical',
          metric: `api_health.${api.name}_status`,
          message: `API ${api.name.toUpperCase()} inaccessible - service interrompu`,
          value: 0, // Down = 0
          threshold: 1, // Up = 1
          timestamp: new Date()
        }
        
        alerts.push(alert)
        alertCooldowns.set(cooldownKey, now)
        await sendCriticalAlert(alert, metrics)
      }
    } else if (api.status === 'degraded') {
      const cooldownKey = `api.${api.name}:warning`
      const lastAlert = alertCooldowns.get(cooldownKey) || 0
      const now = Date.now()
      
      if (now - lastAlert > COOLDOWN_PERIOD) {
        alerts.push({
          type: 'warning',
          metric: `api_health.${api.name}_status`, 
          message: `API ${api.name.toUpperCase()} dégradée - performances réduites`,
          value: 0.5, // Degraded = 0.5
          threshold: 1,
          timestamp: new Date()
        })
        alertCooldowns.set(cooldownKey, now)
      }
    }
  }
}

/**
 * Envoie une alerte critique par email à l'admin
 */
async function sendCriticalAlert(alert: Alert, metrics: BusinessMetrics): Promise<void> {
  try {
    // Email admin (depuis env ou fallback)
    const adminEmail = process.env.ADMIN_EMAIL || 'contact.judgemyjpeg@gmail.com'
    
    const subject = `🚨 ALERTE CRITIQUE - ${alert.metric}`
    const description = `
      ${alert.message}
      
      Détails:
      • Métrique: ${alert.metric}
      • Valeur actuelle: ${alert.value}
      • Seuil critique: ${alert.threshold}
      • Timestamp: ${alert.timestamp.toLocaleString('fr-FR')}
      
      Action requise: Vérifiez immédiatement le système.
    `
    
    // Métadonnées complètes pour debug
    const metadata = {
      alert,
      current_metrics: {
        analyses_total: metrics.analyses.total,
        success_rate: `${(metrics.analyses.success_rate * 100).toFixed(1)}%`,
        avg_time: `${Math.round(metrics.analyses.avg_processing_time / 1000)}s`,
        errors_1h: metrics.analyses.errors_last_hour,
        db_response: `${metrics.api_health.db_response_time}ms`,
        openai_status: metrics.api_health.openai_status,
        stripe_status: metrics.api_health.stripe_status
      },
      alert_thresholds: ALERT_THRESHOLDS.map(t => ({
        metric: t.metric,
        critical: t.critical,
        warning: t.warning
      }))
    }
    
    // Envoyer via le service email existant
    await sendCriticalSecurityAlert(
      `BUSINESS_METRICS_ALERT:${alert.type.toUpperCase()}`,
      description,
      metadata
    )
    
    logger.error('Critical alert sent to admin', {
      alert_type: alert.type,
      metric: alert.metric,
      value: alert.value,
      admin_email: adminEmail
    })
    
  } catch (error) {
    logger.error('Failed to send critical alert email:', error)
  }
}

/**
 * Récupère une valeur métrique par chemin (ex: "analyses.success_rate")
 */
function getMetricValue(metrics: BusinessMetrics, path: string): number | null {
  const parts = path.split('.')
  let value: any = metrics
  
  for (const part of parts) {
    if (value === null || value === undefined) return null
    value = value[part]
  }
  
  return typeof value === 'number' ? value : null
}

/**
 * Teste le système d'alertes avec des métriques simulées
 */
export async function testAlertSystem(): Promise<{success: boolean, alerts: Alert[]}> {
  try {
    // Métriques de test avec problèmes critiques
    const testMetrics: BusinessMetrics = {
      analyses: {
        total: 100,
        success_rate: 0.80, // Critique: sous 85%
        avg_processing_time: 35000, // Critique: plus de 30s
        errors_last_hour: 25 // Critique: plus de 20
      },
      subscriptions: {
        active_premium: 5,
        new_signups_today: 1,
        churn_rate_7d: 0.1,
        mrr: 50
      },
      api_health: {
        openai_status: 'down', // Critique
        stripe_status: 'degraded', // Warning
        db_response_time: 6000 // Critique: plus de 5s
      }
    }
    
    const alerts = await checkAndSendAlerts(testMetrics)
    
    return {
      success: true,
      alerts
    }
    
  } catch (error) {
    logger.error('Alert system test failed:', error)
    return {
      success: false,
      alerts: []
    }
  }
}

/**
 * Configuration des seuils d'alerte (pour admin)
 */
export function updateAlertThreshold(metric: string, critical: number, warning: number): boolean {
  try {
    const threshold = ALERT_THRESHOLDS.find(t => t.metric === metric)
    if (!threshold) return false
    
    threshold.critical = critical
    threshold.warning = warning
    
    logger.info('Alert threshold updated', {
      metric,
      critical,
      warning
    })
    
    return true
  } catch (error) {
    logger.error('Failed to update alert threshold:', error)
    return false
  }
}

/**
 * Obtenir l'état actuel des alertes
 */
export function getAlertStatus(): {
  thresholds: typeof ALERT_THRESHOLDS,
  cooldowns: Array<{key: string, lastAlert: Date}>,
  nextCheck: Date
} {
  return {
    thresholds: ALERT_THRESHOLDS,
    cooldowns: Array.from(alertCooldowns.entries()).map(([key, timestamp]) => ({
      key,
      lastAlert: new Date(timestamp)
    })),
    nextCheck: new Date(Date.now() + 30000) // Check toutes les 30s
  }
}