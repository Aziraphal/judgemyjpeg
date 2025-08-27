/**
 * API Enable 2FA - Vérifie code et active 2FA
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]'
import { enable2FA } from '@/lib/two-factor'
import { AuditLogger } from '@/lib/audit-trail'
import { logger } from '@/lib/logger'

interface Enable2FARequest {
  verificationCode: string
}

interface Enable2FAResponse {
  success: boolean
  message: string
  error?: string
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<Enable2FAResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id || !session.user.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé' 
      })
    }

    const { verificationCode }: Enable2FARequest = req.body

    if (!verificationCode || verificationCode.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code de vérification invalide (6 chiffres requis)' 
      })
    }

    // Essayer d'activer 2FA
    const success = await enable2FA(session.user.id, verificationCode)

    const auditLogger = new AuditLogger(req, session.user.id, session.user.email)

    if (success) {
      await auditLogger.logSecurity('2fa_enabled', {
        description: 'User successfully enabled 2FA',
        userId: session.user.id,
        email: session.user.email,
        success: true
      })

      res.status(200).json({
        success: true,
        message: '🎉 Authentification à deux facteurs activée avec succès !'
      })
    } else {
      await auditLogger.logSecurity('2fa_enable_failed', {
        description: 'User failed to enable 2FA - invalid code',
        userId: session.user.id,
        email: session.user.email,
        success: false
      })

      res.status(400).json({
        success: false,
        message: 'Code de vérification incorrect. Vérifiez votre application d\'authentification.'
      })
    }

  } catch (error) {
    logger.error('2FA Enable error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'activation' 
    })
  }
}