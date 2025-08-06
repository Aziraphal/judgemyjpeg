/**
 * Validation robuste des mots de passe
 * Phase 1 - Sécurité Immédiate
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'faible' | 'moyen' | 'fort' | 'très fort'
  score: number // 0-100
}

// Liste des mots de passe les plus courants (top 100 simplifiés)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'princess', 'football', 'baseball', 'sunshine', 'iloveyou',
  'trustno1', 'superman', 'hello', 'freedom', 'whatever',
  'motdepasse', 'azerty', 'bonjour', 'salut', 'france', 'paris'
])

export function validatePassword(password: string, email?: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // 1. Longueur minimum (critère strict)
  if (password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères')
  } else {
    score += 25
    if (password.length >= 16) score += 10
    if (password.length >= 20) score += 5
  }

  // 2. Complexité des caractères
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (!hasLowercase) errors.push('Doit contenir au moins une minuscule')
  if (!hasUppercase) errors.push('Doit contenir au moins une majuscule')
  if (!hasNumbers) errors.push('Doit contenir au moins un chiffre')
  if (!hasSpecialChars) errors.push('Doit contenir au moins un caractère spécial (!@#$%^&*...)')

  // Score pour la complexité
  const complexityCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length
  score += complexityCount * 10

  // 3. Diversité des caractères
  const uniqueChars = new Set(password.split('')).size
  const diversityRatio = uniqueChars / password.length
  if (diversityRatio > 0.6) score += 15
  else if (diversityRatio > 0.4) score += 10
  else if (diversityRatio < 0.3) errors.push('Trop de caractères répétés')

  // 4. Vérification des patterns dangereux
  if (/^(.)\1{2,}/.test(password)) {
    errors.push('Évitez les répétitions de caractères (aaa, 111...)')
  }

  if (/123|abc|qwe|azerty/i.test(password)) {
    errors.push('Évitez les suites logiques (123, abc, qwerty...)')
    score -= 10
  }

  // 5. Mots de passe courants
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    errors.push('Ce mot de passe est trop courant et facilement piratable')
    score = Math.max(0, score - 30)
  }

  // 6. Vérification email dans le mot de passe
  if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
    errors.push('Le mot de passe ne doit pas contenir votre email')
    score -= 10
  }

  // 7. Calcul de la force finale
  score = Math.min(100, Math.max(0, score))
  
  let strength: PasswordValidationResult['strength']
  if (score >= 85) strength = 'très fort'
  else if (score >= 70) strength = 'fort'
  else if (score >= 50) strength = 'moyen'
  else strength = 'faible'

  // Le mot de passe est valide seulement si aucune erreur ET score >= 60
  const isValid = errors.length === 0 && score >= 60

  return {
    isValid,
    errors,
    strength,
    score
  }
}

/**
 * Génère des suggestions pour améliorer un mot de passe
 */
export function getPasswordSuggestions(validation: PasswordValidationResult): string[] {
  if (validation.isValid) return ['✅ Mot de passe excellent !']

  const suggestions: string[] = []

  if (validation.score < 40) {
    suggestions.push('💡 Utilisez au moins 12 caractères avec majuscules, minuscules, chiffres et symboles')
  }
  
  if (validation.errors.some(e => e.includes('caractères'))) {
    suggestions.push('🔢 Mélangez différents types: MinuScules, MAJUSCULES, 123, !@#$')
  }

  if (validation.errors.some(e => e.includes('courant'))) {
    suggestions.push('🚫 Évitez les mots de passe populaires, créez quelque chose d\'unique')
  }

  if (validation.score >= 40 && validation.score < 70) {
    suggestions.push('📈 Presque bon ! Ajoutez quelques caractères et plus de diversité')
  }

  suggestions.push('💡 Astuce: Utilisez une phrase secrète comme "J\'adore-Photographer!2024"')

  return suggestions
}

/**
 * Rate limiting pour les tentatives de connexion
 */
export interface LoginAttempt {
  count: number
  lastAttempt: number
  lockedUntil?: number
}

const loginAttempts = new Map<string, LoginAttempt>()

export function checkLoginAttempts(identifier: string): { 
  allowed: boolean 
  remainingTime?: number 
  attemptsLeft?: number 
} {
  const key = identifier.toLowerCase()
  const now = Date.now()
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    return { allowed: true, attemptsLeft: 5 }
  }

  // Si compte verrouillé
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return { 
      allowed: false, 
      remainingTime: Math.ceil((attempt.lockedUntil - now) / 1000 / 60) // en minutes
    }
  }

  // Reset si plus de 15 minutes
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(key)
    return { allowed: true, attemptsLeft: 5 }
  }

  const attemptsLeft = Math.max(0, 5 - attempt.count)
  return { allowed: attemptsLeft > 0, attemptsLeft }
}

export function recordFailedLogin(identifier: string): void {
  const key = identifier.toLowerCase()
  const now = Date.now()
  const attempt = loginAttempts.get(key) || { count: 0, lastAttempt: now }

  attempt.count++
  attempt.lastAttempt = now

  // Verrouillage après 5 tentatives
  if (attempt.count >= 5) {
    attempt.lockedUntil = now + (30 * 60 * 1000) // 30 minutes
  }

  loginAttempts.set(key, attempt)
}

export function recordSuccessfulLogin(identifier: string): void {
  const key = identifier.toLowerCase()
  loginAttempts.delete(key) // Reset après succès
}