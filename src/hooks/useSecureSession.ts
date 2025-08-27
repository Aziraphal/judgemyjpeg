/**
 * useSecureSession Hook
 * Hook personnalisé pour gérer la sécurité session avancée
 */

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'

interface SecurityStatus {
  isSecure: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  warnings: string[]
  sessionCount: number
  lastCheck: Date | null
}

interface UseSecureSessionReturn {
  session: any
  status: string
  securityStatus: SecurityStatus
  refreshSecurity: () => Promise<void>
  invalidateAllOtherSessions: () => Promise<boolean>
  loading: boolean
}

export function useSecureSession(): UseSecureSessionReturn {
  const { data: session, status } = useSession()
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSecure: true,
    riskLevel: 'low',
    warnings: [],
    sessionCount: 0,
    lastCheck: null
  })
  const [loading, setLoading] = useState(false)

  // Vérification périodique de sécurité
  const refreshSecurity = useCallback(async () => {
    if (!session?.user?.id || status !== 'authenticated') return

    try {
      setLoading(true)
      
      // Récupérer les informations de sessions
      const response = await fetch('/api/auth/sessions')
      const data = await response.json()

      if (data.success && data.sessions) {
        const sessions = data.sessions
        const warnings: string[] = []
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

        // Analyser les risques
        const suspiciousSessions = sessions.filter((s: any) => s.isSuspicious)
        if (suspiciousSessions.length > 0) {
          warnings.push(`${suspiciousSessions.length} session(s) suspecte(s) détectée(s)`)
          riskLevel = 'high'
        }

        const highRiskSessions = sessions.filter((s: any) => s.riskScore > 50)
        if (highRiskSessions.length > 0) {
          warnings.push(`${highRiskSessions.length} session(s) à risque élevé`)
          if (riskLevel === 'low') riskLevel = 'medium'
        }

        if (sessions.length > 10) {
          warnings.push('Nombre inhabituellement élevé de sessions actives')
          riskLevel = 'medium'
        }

        // Détecter sessions depuis plusieurs pays
        const locationSet = new Set(sessions.map((s: any) => s.location.split(',').pop()?.trim()))
        const locations = Array.from(locationSet)
        if (locations.length > 3) {
          warnings.push('Sessions actives depuis plusieurs pays')
          if (riskLevel === 'low') riskLevel = 'medium'
        }

        setSecurityStatus({
          isSecure: warnings.length === 0,
          riskLevel,
          warnings,
          sessionCount: sessions.length,
          lastCheck: new Date()
        })
      }
    } catch (error) {
      logger.error('Failed to refresh security status:', error)
      setSecurityStatus(prev => ({
        ...prev,
        warnings: ['Erreur lors de la vérification de sécurité'],
        lastCheck: new Date()
      }))
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, status])

  // Invalider toutes les autres sessions
  const invalidateAllOtherSessions = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) return false

    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalidate_all_others'
        })
      })

      const data = await response.json()
      if (data.success) {
        await refreshSecurity()
        return true
      }
      return false
    } catch (error) {
      logger.error('Failed to invalidate other sessions:', error)
      return false
    }
  }, [session?.user?.id, refreshSecurity])

  // Vérification initiale et périodique
  useEffect(() => {
    if (status === 'authenticated') {
      refreshSecurity()
      
      // Vérification toutes les 5 minutes
      const interval = setInterval(refreshSecurity, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [status, refreshSecurity])

  // Vérification lors du focus sur la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated') {
        refreshSecurity()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [status, refreshSecurity])

  // Détection d'activité suspecte basée sur les événements du navigateur
  useEffect(() => {
    if (status !== 'authenticated') return

    const handleStorageChange = (e: StorageEvent) => {
      // Détection de modifications localStorage suspectes
      if (e.key && e.key.includes('auth') && e.oldValue !== e.newValue) {
        logger.warn('Suspicious storage change detected')
        refreshSecurity()
      }
    }

    const handleBeforeUnload = () => {
      // Log de la fermeture de session (pour audit)
      navigator.sendBeacon('/api/auth/activity-log', JSON.stringify({
        type: 'session_end',
        timestamp: new Date().toISOString()
      }))
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [status, refreshSecurity])

  return {
    session,
    status,
    securityStatus,
    refreshSecurity,
    invalidateAllOtherSessions,
    loading
  }
}

/**
 * Hook pour les alertes de sécurité
 */
export function useSecurityAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: Date
    action?: () => void
  }>>([])

  const addAlert = useCallback((
    type: 'warning' | 'error' | 'info',
    message: string,
    action?: () => void
  ) => {
    const alert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date(),
      action
    }
    
    setAlerts(prev => [...prev, alert])

    // Auto-suppression après 10 secondes pour les infos
    if (type === 'info') {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id))
      }, 10000)
    }
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts
  }
}

/**
 * Hook pour le monitoring de session en temps réel
 */
export function useSessionMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [metrics, setMetrics] = useState({
    pageViews: 0,
    interactions: 0,
    lastActivity: new Date(),
    sessionDuration: 0
  })

  useEffect(() => {
    if (!isMonitoring) return

    const startTime = Date.now()
    let pageViews = 0
    let interactions = 0

    const trackPageView = () => {
      pageViews++
      setMetrics(prev => ({ 
        ...prev, 
        pageViews,
        lastActivity: new Date(),
        sessionDuration: Date.now() - startTime
      }))
    }

    const trackInteraction = () => {
      interactions++
      setMetrics(prev => ({ 
        ...prev, 
        interactions,
        lastActivity: new Date(),
        sessionDuration: Date.now() - startTime
      }))
    }

    // Écouter les événements d'activité
    document.addEventListener('click', trackInteraction)
    document.addEventListener('keydown', trackInteraction)
    window.addEventListener('popstate', trackPageView)

    // Mettre à jour la durée de session toutes les minutes
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Date.now() - startTime
      }))
    }, 60000)

    return () => {
      document.removeEventListener('click', trackInteraction)
      document.removeEventListener('keydown', trackInteraction)
      window.removeEventListener('popstate', trackPageView)
      clearInterval(interval)
    }
  }, [isMonitoring])

  return {
    isMonitoring,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    metrics
  }
}