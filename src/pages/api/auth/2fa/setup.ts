/**
 * API Setup 2FA - Génère secret et QR code
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]'
import { setup2FA } from '@/lib/two-factor'
import { AuditLogger } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface Setup2FAResponse {
  qrCodeUrl: string
  backupCodes: string[]
  manualEntryKey: string
  error?: string
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<Setup2FAResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' } as any)
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id || !session.user.email) {
      return res.status(401).json({ error: 'Non autorisé' } as any)
    }

    // Vérifier si l'utilisateur a déjà 2FA activé
    const userWithTwoFactor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true }
    })

    if (userWithTwoFactor?.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA déjà activé' } as any)
    }

    // Setup 2FA
    const result = await setup2FA(session.user.id, session.user.email)

    // Audit log
    const auditLogger = new AuditLogger(req, session.user.id, session.user.email)
    await auditLogger.logSecurity('2fa_setup_initiated', {
      description: 'User initiated 2FA setup',
      userId: session.user.id,
      email: session.user.email
    })

    // Ne pas retourner le secret brut côté client
    res.status(200).json({
      qrCodeUrl: result.qrCodeUrl,
      backupCodes: result.backupCodes,
      manualEntryKey: result.manualEntryKey
    })

  } catch (error) {
    logger.error('2FA Setup error:', error)
    res.status(500).json({ error: 'Erreur serveur' } as any)
  }
}