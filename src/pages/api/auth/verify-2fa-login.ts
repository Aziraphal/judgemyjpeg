/**
 * API Verify 2FA Login - Vérification 2FA pendant le processus de connexion
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { verify2FALogin } from '@/lib/two-factor'
import { AuditLogger } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

interface Verify2FALoginRequest {
  email: string
  tempSessionId: string
  code: string
  isBackupCode?: boolean
}

interface Verify2FALoginResponse {
  success: boolean
  message: string
  verificationToken?: string
  redirect?: string
  attemptsLeft?: number
  usedBackupCode?: boolean
}

// Cache temporaire des sessions 2FA (en production, utiliser Redis)
const tempSessions = new Map<string, {
  userId: string
  email: string
  createdAt: Date
  attempts: number
}>()

// Nettoyer les sessions expirées (5 minutes)
setInterval(() => {
  const now = new Date()
  tempSessions.forEach((session, sessionId) => {
    if (now.getTime() - session.createdAt.getTime() > 5 * 60 * 1000) {
      tempSessions.delete(sessionId)
    }
  })
}, 60 * 1000) // Nettoyage chaque minute

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Verify2FALoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { email, tempSessionId, code, isBackupCode }: Verify2FALoginRequest = req.body

    if (!email || !tempSessionId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes'
      })
    }

    // Vérifier la session temporaire
    const tempSession = tempSessions.get(tempSessionId)
    if (!tempSession) {
      return res.status(400).json({
        success: false,
        message: 'Session expirée. Reconnectez-vous.'
      })
    }

    if (tempSession.email !== email) {
      return res.status(400).json({
        success: false,
        message: 'Session invalide'
      })
    }

    // Vérifier le nombre de tentatives
    if (tempSession.attempts >= 3) {
      tempSessions.delete(tempSessionId)
      return res.status(429).json({
        success: false,
        message: 'Trop de tentatives. Reconnectez-vous.',
        attemptsLeft: 0
      })
    }

    // Incrémenter les tentatives
    tempSession.attempts += 1

    // Vérifier le code 2FA
    const twoFAResult = await verify2FALogin(tempSession.userId, code)
    
    const auditLogger = new AuditLogger(req, tempSession.userId, email)

    if (twoFAResult.success) {
      // 2FA réussi - générer token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex')
      
      // Stocker le token temporairement (5 minutes)
      tempSessions.set(`verify_${verificationToken}`, {
        userId: tempSession.userId,
        email: email,
        createdAt: new Date(),
        attempts: 0
      })

      // Supprimer la session 2FA
      tempSessions.delete(tempSessionId)

      // Audit log succès
      await auditLogger.logSecurity('2fa_login_success', {
        description: `Successful 2FA verification during login${twoFAResult.usedBackupCode ? ' (backup code used)' : ''}`,
        userId: tempSession.userId,
        email: email,
        success: true,
        metadata: { 
          usedBackupCode: twoFAResult.usedBackupCode || false,
          loginMethod: isBackupCode ? 'backup_code' : 'totp'
        }
      })

      res.status(200).json({
        success: true,
        message: '2FA vérifié avec succès',
        verificationToken,
        redirect: '/dashboard',
        usedBackupCode: twoFAResult.usedBackupCode
      })

    } else {
      // 2FA échoué
      const attemptsLeft = 3 - tempSession.attempts

      await auditLogger.logSecurity('2fa_login_failed', {
        description: 'Failed 2FA verification during login',
        userId: tempSession.userId,
        email: email,
        success: false,
        metadata: { 
          attemptsLeft,
          loginMethod: isBackupCode ? 'backup_code' : 'totp'
        }
      })

      if (attemptsLeft <= 0) {
        tempSessions.delete(tempSessionId)
        res.status(429).json({
          success: false,
          message: 'Trop de tentatives échouées. Reconnectez-vous.',
          attemptsLeft: 0
        })
      } else {
        res.status(400).json({
          success: false,
          message: isBackupCode ? 'Code de récupération incorrect' : 'Code 2FA incorrect',
          attemptsLeft
        })
      }
    }

  } catch (error) {
    console.error('2FA Login Verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
}

// Fonction helper pour créer une session temporaire 2FA
export function createTempSession(userId: string, email: string): string {
  const tempSessionId = crypto.randomBytes(32).toString('hex')
  
  tempSessions.set(tempSessionId, {
    userId,
    email,
    createdAt: new Date(),
    attempts: 0
  })
  
  return tempSessionId
}

// Fonction helper pour vérifier un token de vérification
export function verifyToken(verificationToken: string): { userId: string; email: string } | null {
  const tokenSession = tempSessions.get(`verify_${verificationToken}`)
  
  if (tokenSession) {
    // Supprimer le token après utilisation
    tempSessions.delete(`verify_${verificationToken}`)
    return {
      userId: tokenSession.userId,
      email: tokenSession.email
    }
  }
  
  return null
}