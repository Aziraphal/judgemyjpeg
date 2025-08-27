import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'faible' | 'moyen' | 'fort' | 'très fort'
  score: number
}

interface PasswordStrengthIndicatorProps {
  password: string
  email?: string
  onValidationChange: (result: PasswordValidationResult) => void
}

export default function PasswordStrengthIndicator({ 
  password, 
  email, 
  onValidationChange 
}: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState<PasswordValidationResult>({
    isValid: false,
    errors: [],
    strength: 'faible',
    score: 0
  })
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!password) {
      const emptyResult = { isValid: false, errors: [], strength: 'faible' as const, score: 0 }
      setValidation(emptyResult)
      setSuggestions([])
      onValidationChange(emptyResult)
      return
    }

    // Appel à l'API de validation côté client
    const validatePassword = async () => {
      try {
        const response = await fetch('/api/auth/validate-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, email })
        })
        
        if (response.ok) {
          const result = await response.json()
          setValidation(result.validation)
          setSuggestions(result.suggestions)
          onValidationChange(result.validation)
        }
      } catch (error) {
        logger.error('Error validating password:', error)
      }
    }

    // Debounce pour éviter trop d'appels
    const timeout = setTimeout(validatePassword, 300)
    return () => clearTimeout(timeout)
  }, [password, email, onValidationChange])

  if (!password) return null

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'très fort': return 'text-green-400'
      case 'fort': return 'text-blue-400'
      case 'moyen': return 'text-yellow-400'
      case 'faible': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStrengthBg = (strength: string) => {
    switch (strength) {
      case 'très fort': return 'bg-green-500'
      case 'fort': return 'bg-blue-500'
      case 'moyen': return 'bg-yellow-500'
      case 'faible': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="mt-2 space-y-3">
      {/* Barre de force */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-muted">Force du mot de passe</span>
          <span className={`text-xs font-semibold ${getStrengthColor(validation.strength)}`}>
            {validation.strength.toUpperCase()} ({validation.score}/100)
          </span>
        </div>
        
        <div className="w-full bg-cosmic-glass rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBg(validation.strength)}`}
            style={{ width: `${Math.max(validation.score, 5)}%` }}
          ></div>
        </div>
      </div>

      {/* Erreurs */}
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-start space-x-2 text-xs">
              <span className="text-red-400 mt-0.5">✗</span>
              <span className="text-red-300">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && !validation.isValid && (
        <div className="space-y-1">
          <div className="text-xs text-neon-cyan font-semibold">💡 Conseils :</div>
          {suggestions.slice(0, 2).map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-2 text-xs">
              <span className="text-neon-cyan mt-0.5">•</span>
              <span className="text-text-muted">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation réussie */}
      {validation.isValid && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-green-400">✓</span>
          <span className="text-green-300 font-semibold">Mot de passe sécurisé !</span>
        </div>
      )}
    </div>
  )
}