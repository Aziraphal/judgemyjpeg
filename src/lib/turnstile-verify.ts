/**
 * Vérification côté serveur des tokens Cloudflare Turnstile
 */

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(token: string, userIP?: string): Promise<boolean> {
  // ⚠️ DÉVELOPPEMENT UNIQUEMENT : Bypass pour tests automatisés
  // Ce bypass ne fonctionne QUE en NODE_ENV=development
  // En production, toutes les requêtes passent par Cloudflare Turnstile
  if (process.env.NODE_ENV === 'development' && token === 'dev-bypass-token') {
    console.warn('🚨 Turnstile bypassed - Development mode only')
    return true
  }

  if (!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
    console.error('CLOUDFLARE_TURNSTILE_SECRET_KEY missing')
    return false
  }

  try {
    const formData = new FormData()
    formData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    
    if (userIP) {
      formData.append('remoteip', userIP)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const data: TurnstileResponse = await response.json()

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes'])
      return false
    }

    // Validation stricte selon la doc Cloudflare
    if (!data.hostname || !data.challenge_ts) {
      console.error('Turnstile response incomplete:', data)
      return false
    }

    // Vérifier que le hostname correspond (sécurité)
    const allowedHostnames = ['judgemyjpeg.fr', 'www.judgemyjpeg.fr', 'localhost']
    if (!allowedHostnames.includes(data.hostname)) {
      console.error('Turnstile hostname mismatch:', data.hostname)
      return false
    }

    return true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

/**
 * Middleware pour vérifier Turnstile sur les API sensibles
 */
export async function requireTurnstileVerification(token: string | undefined, userIP?: string): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'Token de vérification manquant' }
  }

  const isValid = await verifyTurnstileToken(token, userIP)
  
  if (!isValid) {
    return { success: false, error: 'Vérification anti-bot échouée' }
  }

  return { success: true }
}