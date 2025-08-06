/**
 * API Change Password - Changement de mot de passe avec notifications
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './[...nextauth]'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/password-validation'
import { sendPasswordChangeNotification } from '@/lib/email-service'
import { AuditLogger } from '@/lib/audit-trail'
import { getFullDeviceContext } from '@/lib/device-detection'
import bcrypt from 'bcryptjs'

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  success: boolean
  message: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChangePasswordResponse>
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

    const { currentPassword, newPassword }: ChangePasswordRequest = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      })
    }

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        password: true 
      }
    })

    if (!user?.password) {
      return res.status(400).json({
        success: false,
        message: 'Utilisateur sans mot de passe (compte OAuth)'
      })
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      // Audit - tentative de changement avec mauvais mot de passe
      const auditLogger = new AuditLogger(req, session.user.id, session.user.email)
      await auditLogger.logSecurity('password_change_failed', {
        description: 'Failed password change - invalid current password',
        userId: session.user.id,
        email: session.user.email,
        success: false
      })

      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      })
    }

    // Valider le nouveau mot de passe
    const passwordValidation = validatePassword(newPassword, session.user.email)

    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Nouveau mot de passe invalide: ${passwordValidation.errors.join(', ')}`
      })
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit être différent de l\'ancien'
      })
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe en base
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    })

    // Récupérer le contexte de l'appareil pour les notifications
    const deviceContext = await getFullDeviceContext(req)

    // Envoyer notification email
    try {
      await sendPasswordChangeNotification(session.user.email, {
        browser: deviceContext.device.browser,
        os: deviceContext.device.os,
        ip: deviceContext.location.ip,
        location: deviceContext.location.location
      })
    } catch (emailError) {
      console.error('Failed to send password change notification:', emailError)
      // Ne pas faire échouer la requête si l'email échoue
    }

    // Audit log succès
    const auditLogger = new AuditLogger(req, session.user.id, session.user.email)
    await auditLogger.logSecurity('password_changed', {
      description: 'User successfully changed password',
      userId: session.user.id,
      email: session.user.email,
      success: true,
      metadata: {
        device: deviceContext.device.deviceName,
        browser: deviceContext.device.browser,
        location: deviceContext.location.location,
        passwordStrength: passwordValidation.strength
      }
    })

    res.status(200).json({
      success: true,
      message: '🎉 Mot de passe modifié avec succès ! Un email de confirmation a été envoyé.'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification'
    })
  }
}