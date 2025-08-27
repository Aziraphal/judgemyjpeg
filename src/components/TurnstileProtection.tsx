/**
 * Cloudflare Turnstile CAPTCHA Component
 * Protection anti-bot pour les actions sensibles
 */

import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'

interface TurnstileProtectionProps {
  onVerify: (token: string) => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  className?: string
  /**
   * Widget types selon doc Cloudflare :
   * - 'managed': Checkbox si bot suspecté (défaut)
   * - 'non-interactive': Jamais d'interaction 
   * - 'invisible': Complètement caché
   */
  appearance?: 'always' | 'execute' | 'interaction-only'
}

export default function TurnstileProtection({
  onVerify,
  onError,
  theme = 'auto',
  size = 'normal',
  appearance = 'always',
  className = ''
}: TurnstileProtectionProps) {
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSuccess = (token: string) => {
    setIsVerifying(false)
    onVerify(token)
  }

  const handleError = () => {
    setIsVerifying(false)
    onError?.()
  }

  const handleExpire = () => {
    setIsVerifying(false)
    // Token expiré (300s), réinitialiser pour nouvelle vérification
    onVerify('')
  }

  // En développement, pas de Turnstile
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600">
          🔒 Protection anti-bot (désactivée en dev)
        </p>
        <button
          onClick={() => onVerify('dev-bypass-token')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Simuler vérification
        </button>
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-sm text-red-600">
          ⚠️ Clé Turnstile manquante
        </p>
      </div>
    )
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={handleExpire}
        onBeforeInteractive={() => setIsVerifying(true)}
        options={{
          theme,
          size,
          language: 'fr',
          appearance
        }}
      />
      
      {isVerifying && (
        <p className="text-xs text-gray-500 mt-2">
          Vérification en cours...
        </p>
      )}
    </div>
  )
}