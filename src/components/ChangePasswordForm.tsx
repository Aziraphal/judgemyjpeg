/**
 * Change Password Form Component
 * Formulaire sécurisé pour changer le mot de passe
 */

import React, { useState } from 'react'
import { validatePassword, getPasswordSuggestions, type PasswordValidationResult } from '@/lib/password-validation'

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function ChangePasswordForm({ onSuccess, onError }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Valider le nouveau mot de passe en temps réel
    if (name === 'newPassword') {
      const validation = validatePassword(value)
      setPasswordValidation(validation)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Vérifications côté client
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        throw new Error('Tous les champs sont requis')
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas')
      }

      if (passwordValidation && !passwordValidation.isValid) {
        throw new Error('Le nouveau mot de passe ne respecte pas les critères de sécurité')
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setPasswordValidation(null)
        onSuccess?.()
      } else {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      onError?.(errorMessage)
      console.error('Change password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'très fort': return 'text-green-600'
      case 'fort': return 'text-blue-600' 
      case 'moyen': return 'text-yellow-600'
      default: return 'text-red-600'
    }
  }

  const getPasswordStrengthBg = (strength: string) => {
    switch (strength) {
      case 'très fort': return 'bg-green-100 border-green-300'
      case 'fort': return 'bg-blue-100 border-blue-300'
      case 'moyen': return 'bg-yellow-100 border-yellow-300'  
      default: return 'bg-red-100 border-red-300'
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mot de passe actuel */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Entrez votre mot de passe actuel"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPasswords.current ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Entrez votre nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPasswords.new ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Indicateur de force du mot de passe */}
          {passwordValidation && formData.newPassword && (
            <div className={`mt-3 p-3 rounded-lg border ${getPasswordStrengthBg(passwordValidation.strength)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Force: <span className={getPasswordStrengthColor(passwordValidation.strength)}>
                    {passwordValidation.strength}
                  </span>
                </span>
                <span className="text-sm text-gray-600">{passwordValidation.score}/100</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordValidation.score >= 85 ? 'bg-green-500' :
                    passwordValidation.score >= 70 ? 'bg-blue-500' :
                    passwordValidation.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${passwordValidation.score}%` }}
                />
              </div>

              {passwordValidation.errors.length > 0 && (
                <div className="space-y-1">
                  {passwordValidation.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">❌ {error}</p>
                  ))}
                </div>
              )}

              <div className="mt-2 space-y-1">
                {getPasswordSuggestions(passwordValidation).map((suggestion, index) => (
                  <p key={index} className="text-xs text-gray-600">{suggestion}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirmer nouveau mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirmez votre nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPasswords.confirm ? '🙈' : '👁️'}
            </button>
          </div>
          
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-2 text-sm text-red-400">❌ Les mots de passe ne correspondent pas</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading || !passwordValidation?.isValid}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Changement en cours...
            </div>
          ) : (
            '🔐 Changer le mot de passe'
          )}
        </button>
      </form>

      {/* Conseils de sécurité */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
        <h3 className="text-sm font-medium text-blue-300 mb-2">💡 Conseils de sécurité</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Utilisez au moins 12 caractères</li>
          <li>• Mélangez majuscules, minuscules, chiffres et symboles</li>
          <li>• Évitez les informations personnelles</li>
          <li>• Ne réutilisez pas d'anciens mots de passe</li>
        </ul>
      </div>
    </div>
  )
}