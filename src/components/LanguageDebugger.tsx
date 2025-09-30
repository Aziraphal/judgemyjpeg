/**
 * Composant de debug pour la détection de langue
 * Affiche les infos de localisation et permet de tester
 */

import { useState, useEffect } from 'react'
import { useAutoLocalization } from '@/hooks/useAutoLocalization'

export default function LanguageDebugger() {
  const {
    detectedLanguage,
    detectedCountry,
    confidence,
    isHighConfidence,
    refreshDetection
  } = useAutoLocalization()

  const [showDebug, setShowDebug] = useState(false)
  const [ipInfo, setIpInfo] = useState<any>(null)

  // Récupérer l'IP publique réelle de l'utilisateur
  const fetchRealIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setIpInfo({ publicIP: data.ip })

      // Tester avec cette IP
      const locationResponse = await fetch(`/api/detect-location?testIP=${data.ip}`)
      const locationData = await locationResponse.json()
      setIpInfo((prev: any) => ({ ...prev, ...locationData }))
    } catch (error) {
      console.error('Error fetching IP:', error)
    }
  }

  useEffect(() => {
    if (showDebug && !ipInfo) {
      fetchRealIP()
    }
  }, [showDebug])

  // Forcer le refresh en effaçant le cache
  const handleForceRefresh = () => {
    localStorage.removeItem('auto_detected_language')
    localStorage.removeItem('auto_detected_country')
    localStorage.removeItem('auto_detection_timestamp')
    localStorage.removeItem('manual_language_choice')
    localStorage.removeItem('manual_chosen_language')
    refreshDetection()
    fetchRealIP()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton toggle */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="mb-2 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/50 rounded-lg text-neon-cyan text-sm hover:bg-neon-cyan/30 transition-colors"
        title="Debug localisation"
      >
        🌍 Lang Debug {showDebug ? '▼' : '▲'}
      </button>

      {/* Panel de debug */}
      {showDebug && (
        <div className="glass-card p-4 max-w-md border border-neon-cyan/30">
          <h3 className="text-text-white font-bold mb-3 flex items-center justify-between">
            🔍 Détection de langue
            <button
              onClick={handleForceRefresh}
              className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500/30"
            >
              🔄 Reset
            </button>
          </h3>

          <div className="space-y-2 text-sm">
            {/* Langue détectée */}
            <div className="flex justify-between">
              <span className="text-text-gray">Langue détectée:</span>
              <span className={`font-semibold ${isHighConfidence ? 'text-green-400' : 'text-yellow-400'}`}>
                {detectedLanguage?.toUpperCase() || 'N/A'}
              </span>
            </div>

            {/* Pays détecté */}
            <div className="flex justify-between">
              <span className="text-text-gray">Pays:</span>
              <span className="text-text-white">{detectedCountry || 'N/A'}</span>
            </div>

            {/* Confiance */}
            <div className="flex justify-between">
              <span className="text-text-gray">Confiance:</span>
              <span className={`font-semibold ${
                confidence >= 80 ? 'text-green-400' :
                confidence >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {confidence}%
              </span>
            </div>

            {/* Cache */}
            <div className="mt-3 pt-3 border-t border-cosmic-glassborder">
              <div className="text-text-gray text-xs mb-1">Cache localStorage:</div>
              <div className="text-text-white text-xs">
                {localStorage.getItem('auto_detected_language') || 'Aucun cache'}
              </div>
            </div>

            {/* IP réelle */}
            {ipInfo && (
              <div className="mt-3 pt-3 border-t border-cosmic-glassborder">
                <div className="text-text-gray text-xs mb-1">Votre IP publique:</div>
                <div className="text-text-white text-xs font-mono mb-2">
                  {ipInfo.publicIP}
                </div>
                {ipInfo.country && (
                  <>
                    <div className="text-text-gray text-xs">Détection IP publique:</div>
                    <div className="text-green-400 text-xs">
                      {ipInfo.country} ({ipInfo.countryCode})
                    </div>
                    {ipInfo.city && (
                      <div className="text-text-muted text-xs">
                        {ipInfo.city}, {ipInfo.region}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Choix manuel */}
            {localStorage.getItem('manual_language_choice') && (
              <div className="mt-3 pt-3 border-t border-cosmic-glassborder">
                <div className="text-yellow-400 text-xs">
                  ⚠️ Choix manuel actif
                </div>
                <div className="text-text-white text-xs">
                  Langue: {localStorage.getItem('manual_chosen_language')?.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
            <div className="text-blue-300 font-semibold mb-1">💡 Astuce VPN:</div>
            <div className="text-blue-200">
              En local, la détection utilise votre IP locale.
              Cliquez sur <strong>Reset</strong> pour forcer une nouvelle détection avec votre IP publique VPN.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}