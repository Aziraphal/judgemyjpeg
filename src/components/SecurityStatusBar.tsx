/**
 * Security Status Bar Component
 * Barre de statut de sécurité pour afficher les alertes et le niveau de risque
 */

import React, { useState } from 'react'
import { useSecureSession, useSecurityAlerts } from '@/hooks/useSecureSession'

interface SecurityStatusBarProps {
  compact?: boolean
  position?: 'top' | 'bottom'
}

export default function SecurityStatusBar({ 
  compact = false, 
  position = 'top' 
}: SecurityStatusBarProps) {
  const { securityStatus, loading, invalidateAllOtherSessions } = useSecureSession()
  const { alerts, removeAlert } = useSecurityAlerts()
  const [expanded, setExpanded] = useState(false)

  if (loading && !securityStatus.lastCheck) {
    return null // Ne pas afficher pendant le chargement initial
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-900/90 border-red-500 text-red-100'
      case 'high': return 'bg-orange-900/90 border-orange-500 text-orange-100'
      case 'medium': return 'bg-yellow-900/90 border-yellow-500 text-yellow-100'
      default: return 'bg-green-900/90 border-green-500 text-green-100'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '🟡'
      default: return '🟢'
    }
  }

  const handleSecureAllSessions = async () => {
    if (confirm('Déconnecter toutes les autres sessions ? Cette action est irréversible.')) {
      const success = await invalidateAllOtherSessions()
      if (success) {
        alert('✅ Toutes les autres sessions ont été déconnectées')
      } else {
        alert('❌ Erreur lors de la déconnexion des sessions')
      }
    }
  }

  // Mode compact pour mobile ou interfaces réduites
  if (compact) {
    return (
      <div className={`fixed ${position === 'top' ? 'top-2' : 'bottom-2'} right-2 z-50`}>
        <div 
          className={`px-3 py-2 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getRiskColor(securityStatus.riskLevel)}`}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getRiskIcon(securityStatus.riskLevel)}</span>
            {securityStatus.warnings.length > 0 && (
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {securityStatus.warnings.length}
              </span>
            )}
          </div>
        </div>

        {expanded && (
          <div className="absolute right-0 top-12 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-4 shadow-xl">
            <div className="mb-3">
              <h4 className="font-semibold text-white flex items-center">
                {getRiskIcon(securityStatus.riskLevel)} Sécurité Session
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRiskColor(securityStatus.riskLevel)}`}>
                  {securityStatus.riskLevel.toUpperCase()}
                </span>
              </h4>
            </div>

            {securityStatus.warnings.length > 0 && (
              <div className="space-y-2 mb-3">
                {securityStatus.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-orange-200 flex items-start">
                    <span className="mr-2">⚠️</span>
                    {warning}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
              <span>{securityStatus.sessionCount} sessions actives</span>
              <span>
                {securityStatus.lastCheck ? 
                  `Vérifié à ${securityStatus.lastCheck.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` 
                  : 'Non vérifié'
                }
              </span>
            </div>

            {securityStatus.riskLevel !== 'low' && (
              <button
                onClick={handleSecureAllSessions}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                🔒 Sécuriser maintenant
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Mode normal - barre complète
  if (!securityStatus.isSecure || alerts.length > 0) {
    return (
      <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-40`}>
        <div className={`border-b transition-all ${getRiskColor(securityStatus.riskLevel)}`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getRiskIcon(securityStatus.riskLevel)}</span>
                  <span className="font-semibold">
                    Alerte Sécurité - Niveau {securityStatus.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="hidden md:flex items-center space-x-4 text-sm">
                  <span>{securityStatus.sessionCount} sessions</span>
                  {securityStatus.lastCheck && (
                    <span>
                      Vérifié: {securityStatus.lastCheck.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
                >
                  {expanded ? 'Masquer' : 'Détails'}
                </button>

                {securityStatus.riskLevel !== 'low' && (
                  <button
                    onClick={handleSecureAllSessions}
                    className="bg-white/30 hover:bg-white/40 px-4 py-1 rounded text-sm font-medium transition-colors"
                  >
                    🔒 Sécuriser
                  </button>
                )}
              </div>
            </div>

            {expanded && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">⚠️ Alertes de sécurité:</h4>
                    <ul className="space-y-1 text-sm">
                      {securityStatus.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">🛡️ Actions recommandées:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Vérifiez vos sessions actives dans les paramètres</li>
                      <li>• Déconnectez les appareils non reconnus</li>
                      {securityStatus.riskLevel === 'critical' && (
                        <li>• Changez immédiatement votre mot de passe</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => window.open('/settings', '_blank')}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded text-sm transition-colors"
                  >
                    ⚙️ Paramètres de sécurité
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alertes individuelles */}
        {alerts.length > 0 && (
          <div className="fixed top-16 right-4 space-y-2 z-50">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg shadow-lg max-w-sm ${
                  alert.type === 'error' ? 'bg-red-900/90 border border-red-500 text-red-100' :
                  alert.type === 'warning' ? 'bg-orange-900/90 border border-orange-500 text-orange-100' :
                  'bg-blue-900/90 border border-blue-500 text-blue-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    {alert.action && (
                      <button
                        onClick={alert.action}
                        className="mt-2 text-xs underline hover:no-underline"
                      >
                        Action recommandée
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="ml-2 text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}