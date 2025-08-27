import type { NextApiRequest, NextApiResponse } from 'next'
import { validatePassword, getPasswordSuggestions } from '@/lib/password-validation'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { password, email } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Validation du mot de passe
    const validation = validatePassword(password, email)
    const suggestions = getPasswordSuggestions(validation)

    res.status(200).json({
      validation,
      suggestions
    })

  } catch (error) {
    logger.error('Error validating password:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}