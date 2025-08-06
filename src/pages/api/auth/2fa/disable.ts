/**
 * API Disable 2FA - Désactive 2FA avec confirmation
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]'
import { disable2FA, verify2FALogin } from '@/lib/two-factor'
import { AuditLogger } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'

interface Disable2FARequest {
  currentPassword: string
  verificationCode?: string // Code 2FA actuel pour confirmer
}

interface Disable2FAResponse {
  success: boolean
  message: string
  error?: string
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<Disable2FAResponse>
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

    const { currentPassword, verificationCode }: Disable2FARequest = req.body

    if (!currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mot de passe actuel requis' 
      })
    }

    // Vérifier le mot de passe actuel
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        password: true, 
        twoFactorEnabled: true 
      }
    })

    if (!user?.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Utilisateur sans mot de passe (compte OAuth)' 
      })
    }

    const bcrypt = await import('bcryptjs')
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mot de passe incorrect' 
      })
    }

    // Si 2FA est activé, vérifier le code 2FA
    if (user.twoFactorEnabled && verificationCode) {
      const twoFAResult = await verify2FALogin(session.user.id, verificationCode)
      
      if (!twoFAResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Code 2FA incorrect' 
        })
      }
    } else if (user.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code 2FA requis pour désactiver' 
      })
    }

    // Désactiver 2FA
    await disable2FA(session.user.id)

    // Audit log
    const auditLogger = new AuditLogger(req, session.user.id, session.user.email)
    await auditLogger.logSecurity('2fa_disabled', {
      description: 'User disabled 2FA',
      userId: session.user.id,
      email: session.user.email,
      success: true
    })

    res.status(200).json({
      success: true,
      message: '2FA désactivé avec succès. Votre compte utilise maintenant uniquement votre mot de passe.'
    })

  } catch (error) {
    console.error('2FA Disable error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la désactivation' 
    })
  }
}