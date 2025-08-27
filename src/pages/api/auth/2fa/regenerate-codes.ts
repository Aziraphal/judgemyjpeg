/**
 * API Regenerate Backup Codes - Régénère les codes de récupération
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]'
import { regenerateBackupCodes, verify2FALogin } from '@/lib/two-factor'
import { AuditLogger } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface RegenerateCodesRequest {
  verificationCode: string // Code 2FA pour confirmer
}

interface RegenerateCodesResponse {
  success: boolean
  backupCodes?: string[]
  message: string
  error?: string
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<RegenerateCodesResponse>
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

    const { verificationCode }: RegenerateCodesRequest = req.body

    if (!verificationCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code de vérification 2FA requis' 
      })
    }

    // Vérifier que l'utilisateur a 2FA activé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true }
    })

    if (!user?.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: '2FA non activé' 
      })
    }

    // Vérifier le code 2FA
    const twoFAResult = await verify2FALogin(session.user.id, verificationCode)
    
    if (!twoFAResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code 2FA incorrect' 
      })
    }

    // Régénérer les codes
    const newBackupCodes = await regenerateBackupCodes(session.user.id)

    // Audit log
    const auditLogger = new AuditLogger(req, session.user.id, session.user.email)
    await auditLogger.logSecurity('2fa_backup_codes_regenerated', {
      description: 'User regenerated backup codes',
      userId: session.user.id,
      email: session.user.email,
      metadata: { codesCount: newBackupCodes.length }
    })

    res.status(200).json({
      success: true,
      backupCodes: newBackupCodes,
      message: `${newBackupCodes.length} nouveaux codes de récupération générés`
    })

  } catch (error) {
    logger.error('2FA Regenerate Codes error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la régénération' 
    })
  }
}