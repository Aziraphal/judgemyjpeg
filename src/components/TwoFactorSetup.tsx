/**
 * Composant Setup 2FA - Interface pour activer/désactiver 2FA
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface TwoFactorSetupProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface Setup2FAData {
  qrCodeUrl: string
  backupCodes: string[]
  manualEntryKey: string
}

export default function TwoFactorSetup({ onSuccess, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState(1) // 1: Setup, 2: Verify, 3: Backup codes
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [setupData, setSetupData] = useState<Setup2FAData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)

  // Étape 1 : Initialiser le setup 2FA
  const handleSetup = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setSetupData(data)
        setStep(2)
      } else {
        setError(data.error || 'Erreur lors de la configuration')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 : Vérifier le code et activer 2FA
  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Code de 6 chiffres requis')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message)
        setStep(3) // Afficher les codes de récupération
      } else {
        setError(data.message || 'Code incorrect')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Copier les codes de récupération
  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const text = setupData.backupCodes.join('\n')
      navigator.clipboard.writeText(text)
      setSuccess('Codes copiés dans le presse-papier !')
    }
  }

  // Finaliser la configuration
  const handleFinish = () => {
    onSuccess?.()
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      
      {/* Header avec progression */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-white mb-2">
          🔐 Activer l'authentification à deux facteurs
        </h2>
        <div className="flex justify-center space-x-2 mb-4">
          {[1, 2, 3].map(stepNum => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full ${
                step >= stepNum ? 'bg-neon-cyan' : 'bg-cosmic-glassborder'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {/* Étape 1 : Introduction */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-4">
          <div className="text-center space-y-3">
            <span className="text-4xl">🛡️</span>
            <h3 className="text-lg font-semibold text-text-white">
              Sécurisez votre compte
            </h3>
            <p className="text-text-gray text-sm">
              L'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire 
              à votre compte en requérant un code depuis votre téléphone.
            </p>
          </div>

          <div className="space-y-2 text-sm text-text-gray">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Protection contre les accès non autorisés</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Compatible avec Google Authenticator, Authy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Codes de récupération inclus</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSetup}
              disabled={loading}
              className="btn-neon-primary w-full"
            >
              {loading ? '🔄 Configuration...' : '🚀 Commencer la configuration'}
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="btn-neon-secondary w-full"
              >
                ← Annuler
              </button>
            )}
          </div>
        </div>
      )}

      {/* Étape 2 : Scanner QR Code */}
      {step === 2 && setupData && (
        <div className="glass-card p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-white mb-3">
              📱 Scanner le QR Code
            </h3>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl">
              <Image
                src={setupData.qrCodeUrl}
                alt="QR Code 2FA"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-sm text-text-gray">
            <p><strong>1.</strong> Ouvrez votre app d'authentification (Google Authenticator, Authy, etc.)</p>
            <p><strong>2.</strong> Scannez le QR code ci-dessus</p>
            <p><strong>3.</strong> Entrez le code à 6 chiffres généré par l'app</p>
          </div>

          {/* Entrée manuelle */}
          <div className="text-center">
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="text-neon-cyan text-sm hover:underline"
            >
              Impossible de scanner ? Entrer manuellement
            </button>
          </div>

          {showManualEntry && (
            <div className="bg-cosmic-glass p-3 rounded-lg">
              <p className="text-xs text-text-gray mb-2">Clé à saisir manuellement :</p>
              <code className="text-neon-cyan text-sm font-mono break-all">
                {setupData.manualEntryKey}
              </code>
            </div>
          )}

          {/* Vérification */}
          <div className="space-y-3">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setVerificationCode(value)
              }}
              placeholder="000000"
              className="w-full p-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white text-center text-lg font-mono tracking-widest"
              maxLength={6}
              disabled={loading}
            />

            <button
              onClick={handleVerification}
              disabled={loading || verificationCode.length !== 6}
              className="btn-neon-primary w-full"
            >
              {loading ? '🔄 Vérification...' : '✅ Vérifier et activer'}
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : Codes de récupération */}
      {step === 3 && setupData && (
        <div className="glass-card p-6 space-y-4">
          <div className="text-center">
            <span className="text-4xl">🎉</span>
            <h3 className="text-lg font-semibold text-text-white mt-2 mb-3">
              2FA activé avec succès !
            </h3>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <div className="text-sm">
                <p className="font-semibold text-yellow-400 mb-1">Important !</p>
                <p className="text-text-gray">
                  Sauvegardez ces codes de récupération en lieu sûr. Ils vous permettront 
                  d'accéder à votre compte si vous perdez votre téléphone.
                </p>
              </div>
            </div>
          </div>

          {/* Codes de récupération */}
          <div className="bg-cosmic-glass p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-text-white">
                Codes de récupération
              </h4>
              <button
                onClick={copyBackupCodes}
                className="text-neon-cyan text-xs hover:underline"
              >
                📋 Copier
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setupData.backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-cosmic-overlay p-2 rounded text-center text-text-white"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs text-text-gray">
            <p>• Chaque code ne peut être utilisé qu'une seule fois</p>
            <p>• Vous pouvez régénérer ces codes depuis vos paramètres</p>
            <p>• Ne partagez jamais ces codes avec personne</p>
          </div>

          <button
            onClick={handleFinish}
            className="btn-neon-primary w-full"
          >
            🏁 Terminer la configuration
          </button>
        </div>
      )}
    </div>
  )
}