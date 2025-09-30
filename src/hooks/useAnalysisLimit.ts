/**
 * Hook pour gérer les limites d'analyses et détecter l'épuisement
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'

interface AnalysisLimitState {
  canAnalyze: boolean
  monthlyCount: number
  maxMonthly: number
  starterPack: {
    hasStarterPack: boolean
    purchased: boolean
    analysisCount: number
    sharesCount: number
    exportsCount: number
  }
  daysUntilReset?: number
  isExhausted: boolean // Nouveau: détecte si toutes les analyses sont épuisées
  shouldShowStarterModal: boolean // Nouveau: doit-on afficher le modal starter pack
}

export function useAnalysisLimit() {
  const { data: session } = useSession()
  const [state, setState] = useState<AnalysisLimitState>({
    canAnalyze: false,
    monthlyCount: 0,
    maxMonthly: 3,
    starterPack: {
      hasStarterPack: false,
      purchased: false,
      analysisCount: 0,
      sharesCount: 0,
      exportsCount: 0
    },
    isExhausted: false,
    shouldShowStarterModal: false
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    fetchAnalysisStatus()
  }, [session?.user?.id])

  const fetchAnalysisStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status')

      if (!response.ok) {
        // Si la requête échoue (401, 403, 500...), on utilise l'état par défaut
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // 🔍 DEBUG: Log pour diagnostiquer le problème
      console.log('🔍 [useAnalysisLimit] API Response:', {
        subscriptionStatus: data.subscriptionStatus,
        canAnalyze: data.canAnalyze,
        isPremium: data.isPremium,
        monthlyAnalysisCount: data.monthlyAnalysisCount,
        maxMonthlyAnalyses: data.maxMonthlyAnalyses
      })

      // Vérification défensive pour éviter les erreurs
      const starterPack = data.starterPack || {
        hasStarterPack: false,
        purchased: false,
        analysisCount: 0,
        sharesCount: 0,
        exportsCount: 0
      }

      // Déterminer si l'utilisateur est épuisé
      const isMonthlyExhausted = data.subscriptionStatus === 'free' && data.monthlyAnalysisCount >= data.maxMonthlyAnalyses
      const hasNoStarterAnalyses = !starterPack.hasStarterPack || starterPack.analysisCount === 0
      const isExhausted = isMonthlyExhausted && hasNoStarterAnalyses && !['premium', 'annual'].includes(data.subscriptionStatus)

      // Détermine si on doit afficher le modal starter pack
      const shouldShowStarterModal = isExhausted &&
                                   data.subscriptionStatus === 'free' &&
                                   !starterPack.purchased // N'a jamais acheté le starter pack

      // 🔍 DEBUG: Log pour diagnostiquer
      console.log('🔍 [useAnalysisLimit] Calculated values:', {
        isMonthlyExhausted,
        hasNoStarterAnalyses,
        isExhausted,
        shouldShowStarterModal
      })

      setState({
        canAnalyze: data.canAnalyze || false,
        monthlyCount: data.monthlyAnalysisCount || 0,
        maxMonthly: data.maxMonthlyAnalyses || 3,
        starterPack,
        daysUntilReset: data.daysUntilReset,
        isExhausted,
        shouldShowStarterModal
      })
    } catch (error) {
      logger.error('Erreur chargement statut analyses:', error)
      
      // État par défaut en cas d'erreur
      setState({
        canAnalyze: false,
        monthlyCount: 0,
        maxMonthly: 3,
        starterPack: {
          hasStarterPack: false,
          purchased: false,
          analysisCount: 0,
          sharesCount: 0,
          exportsCount: 0
        },
        isExhausted: true,
        shouldShowStarterModal: false
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshStatus = () => {
    fetchAnalysisStatus()
  }

  return {
    ...state,
    loading,
    refreshStatus
  }
}