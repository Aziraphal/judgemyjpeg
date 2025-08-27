/**
 * API Login - Gestion complète de la connexion avec notifications
 * Remplace partiellement le provider credentials de NextAuth pour les notifications avancées
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkLoginAttempts, recordFailedLogin, recordSuccessfulLogin } from '@/lib/password-validation'
import { sendNewDeviceLoginNotification } from '@/lib/email-service'
import { getFullDeviceContext, generateDeviceFingerprint, isNewDevice, registerNewDevice } from '@/lib/device-detection'
import { AuditLogger } from '@/lib/audit-trail'
import { createTempSession } from './verify-2fa-login'
import { logger } from '@/lib/logger'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  requires2FA?: boolean
  tempSessionId?: string
  user?: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
  newDevice?: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { email, password }: LoginRequest = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      })
    }

    // Vérifier les tentatives de connexion (account lockout)
    const loginCheck = checkLoginAttempts(email)
    if (!loginCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Compte temporairement verrouillé. Réessayez dans ${loginCheck.remainingTime} minutes.`
      })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
        twoFactorEnabled: true,
        emailVerified: true
      }
    })

    if (!user || !user.password) {
      await recordFailedLogin(email, req)
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      await recordFailedLogin(email, req)
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Vérifier que l'email est vérifié
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email non vérifié. Vérifiez votre boite email.'
      })
    }

    // Connexion réussie - reset les tentatives
    recordSuccessfulLogin(email)

    // Récupérer le contexte de l'appareil
    const deviceContext = await getFullDeviceContext(req)
    const deviceFingerprint = generateDeviceFingerprint(deviceContext.device, deviceContext.location.ip)
    
    // Vérifier si c'est un nouvel appareil
    const isNewDeviceLogin = await isNewDevice(user.id, deviceFingerprint)

    // Enregistrer le nouvel appareil si nécessaire
    if (isNewDeviceLogin) {
      await registerNewDevice(user.id, deviceContext.device, deviceContext.location, deviceFingerprint)
    }

    // Audit Logger
    const auditLogger = new AuditLogger(req, user.id, user.email!)

    // Si 2FA activé
    if (user.twoFactorEnabled) {
      const tempSessionId = createTempSession(user.id, user.email!)
      
      await auditLogger.loginSuccess(user.email!, {
        provider: 'credentials',
        requires2FA: true,
        newDevice: isNewDeviceLogin,
        deviceInfo: deviceContext.device
      })

      return res.status(200).json({
        success: true,
        message: 'Authentification requise',
        requires2FA: true,
        tempSessionId,
        newDevice: isNewDeviceLogin
      })
    }

    // Connexion normale (sans 2FA)
    await auditLogger.loginSuccess(user.email!, {
      provider: 'credentials',
      newDevice: isNewDeviceLogin,
      deviceInfo: deviceContext.device
    })

    // Envoyer notification de nouvelle connexion
    try {
      await sendNewDeviceLoginNotification(user.email!, {
        deviceName: deviceContext.device.deviceName,
        browser: deviceContext.device.browser,
        os: deviceContext.device.os,
        ip: deviceContext.location.ip,
        location: deviceContext.location.location || 'Localisation inconnue',
        loginTime: new Date(),
        isFirstTime: isNewDeviceLogin
      })
    } catch (emailError) {
      logger.error('Failed to send new device login notification:', emailError)
      // Ne pas faire échouer la connexion si l'email échoue
    }

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email!,
        name: user.name,
        image: user.image
      },
      newDevice: isNewDeviceLogin
    })

  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    })
  }
}