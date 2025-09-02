/**
 * Performance Monitoring - Core Web Vitals & Business Metrics
 * Collecte et envoie les métriques de performance à Sentry
 */
import * as Sentry from '@sentry/nextjs'

// Types des métriques de performance
interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back_forward' | 'prerender'
}

interface BusinessPerformanceMetric {
  event_name: string
  duration_ms: number
  success: boolean
  context?: Record<string, any>
}

/**
 * Enregistre une métrique Web Vitals
 */
export function recordWebVital(metric: WebVitalsMetric): void {
  // Seuils recommandés Google
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 }
  }

  const threshold = thresholds[metric.name]
  const rating = metric.value <= threshold.good 
    ? 'good' 
    : metric.value <= threshold.poor 
      ? 'needs-improvement' 
      : 'poor'

  // Envoyer à Sentry pour monitoring
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${metric.name}: ${metric.value}`,
    data: {
      ...metric,
      rating,
      url: window.location.pathname
    },
    level: rating === 'poor' ? 'warning' : 'info'
  })

  // Alertes pour métriques critiques
  if (rating === 'poor' && (metric.name === 'LCP' || metric.name === 'CLS')) {
    Sentry.captureException(new Error(`Poor ${metric.name} performance`), {
      level: 'warning',
      tags: {
        performance: 'web-vitals',
        metric: metric.name,
        rating
      },
      extra: {
        name: metric.name,
        value: metric.value,
        rating,
        navigationType: metric.navigationType,
        id: metric.id
      }
    })
  }

  // Console en développement
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔥 ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${rating})`)
  }
}

/**
 * Enregistre une métrique business de performance
 */
export function recordBusinessPerformance(metric: BusinessPerformanceMetric): void {
  Sentry.addBreadcrumb({
    category: 'business-performance',
    message: `${metric.event_name}: ${metric.duration_ms}ms`,
    data: metric,
    level: metric.success ? 'info' : 'warning'
  })

  // Alertes pour opérations lentes critiques
  const criticalOperations = ['photo_analysis', 'stripe_payment', 'user_registration']
  const slowThreshold = 10000 // 10 secondes

  if (criticalOperations.includes(metric.event_name) && metric.duration_ms > slowThreshold) {
    Sentry.captureException(new Error(`Slow ${metric.event_name} operation`), {
      level: 'warning',
      tags: {
        performance: 'business',
        operation: metric.event_name
      },
      extra: {
        event_name: metric.event_name,
        duration_ms: metric.duration_ms,
        success: metric.success,
        context: metric.context
      }
    })
  }
}

/**
 * Timer pour mesurer la durée d'opérations
 */
export class PerformanceTimer {
  private startTime: number
  private eventName: string
  private context: Record<string, any>

  constructor(eventName: string, context: Record<string, any> = {}) {
    this.startTime = performance.now()
    this.eventName = eventName
    this.context = context
  }

  end(success: boolean = true): number {
    const duration = Math.round(performance.now() - this.startTime)
    
    recordBusinessPerformance({
      event_name: this.eventName,
      duration_ms: duration,
      success,
      context: this.context
    })

    return duration
  }
}

/**
 * Hook pour surveiller la performance d'un fetch
 */
export async function monitoredFetch(
  url: string, 
  options?: RequestInit,
  operationName?: string
): Promise<Response> {
  const timer = new PerformanceTimer(operationName || 'api_call', {
    url: url.replace(process.env.NEXT_PUBLIC_BASE_URL || '', ''),
    method: options?.method || 'GET'
  })

  try {
    const response = await fetch(url, options)
    timer.end(response.ok)
    return response
  } catch (error) {
    timer.end(false)
    throw error
  }
}

/**
 * Surveille la performance de chargement des images
 */
export function monitorImageLoad(src: string): Promise<{ duration: number; success: boolean }> {
  return new Promise((resolve) => {
    const timer = new PerformanceTimer('image_load', { src })
    const img = new Image()
    
    img.onload = () => {
      const duration = timer.end(true)
      resolve({ duration, success: true })
    }
    
    img.onerror = () => {
      const duration = timer.end(false)
      resolve({ duration, success: false })
    }
    
    img.src = src
  })
}

/**
 * Collecte automatique des Resource Timing API
 */
export function collectResourceTimings(): void {
  if (typeof window === 'undefined') return

  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    // Analyser les ressources lentes (>2s)
    const slowResources = resources.filter(resource => 
      resource.duration > 2000 && 
      (resource.name.includes('.js') || resource.name.includes('.css') || resource.name.includes('api/'))
    )

    if (slowResources.length > 0) {
      Sentry.addBreadcrumb({
        category: 'resource-timing',
        message: `${slowResources.length} slow resources detected`,
        data: {
          slow_resources: slowResources.map(r => ({
            name: r.name.replace(window.location.origin, ''),
            duration: Math.round(r.duration),
            size: r.transferSize
          }))
        },
        level: 'warning'
      })
    }

    // Nettoyer les entrées pour éviter la fuite mémoire
    performance.clearResourceTimings()
  } catch (error) {
    console.warn('Resource timing collection failed:', error)
  }
}

/**
 * Détecter et signaler les long tasks (>50ms)
 */
export function observeLongTasks(): void {
  if (typeof window === 'undefined') return

  try {
    const observer = new PerformanceObserver((list) => {
      const longTasks = list.getEntries()
      
      if (longTasks.length > 0) {
        Sentry.addBreadcrumb({
          category: 'long-task',
          message: `${longTasks.length} long tasks detected`,
          data: {
            tasks: longTasks.map(task => ({
              duration: Math.round(task.duration),
              start: Math.round(task.startTime)
            }))
          },
          level: 'warning'
        })
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
  } catch (error) {
    console.warn('Long task observation not supported')
  }
}