/**
 * Hook pour gérer les limites d'analyses et détecter l'épuisement
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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
      
      if (response.ok) {
        const data = await response.json()
        
        // Déterminer si l'utilisateur est épuisé
        const isMonthlyExhausted = data.subscriptionStatus === 'free' && data.monthlyAnalysisCount >= data.maxMonthlyAnalyses
        const hasNoStarterAnalyses = !data.starterPack.hasStarterPack || data.starterPack.analysisCount === 0
        const isExhausted = isMonthlyExhausted && hasNoStarterAnalyses && !['premium', 'annual'].includes(data.subscriptionStatus)
        
        // Détermine si on doit afficher le modal starter pack
        const shouldShowStarterModal = isExhausted && 
                                     data.subscriptionStatus === 'free' && 
                                     !data.starterPack.purchased // N'a jamais acheté le starter pack
        
        setState({
          canAnalyze: data.canAnalyze,
          monthlyCount: data.monthlyAnalysisCount,
          maxMonthly: data.maxMonthlyAnalyses,
          starterPack: data.starterPack,
          daysUntilReset: data.daysUntilReset,
          isExhausted,
          shouldShowStarterModal
        })
      }
    } catch (error) {
      console.error('Erreur récupération statut analyses:', error)
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