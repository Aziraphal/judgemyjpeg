/**
 * API Status 2FA - Informations sur l'état 2FA de l'utilisateur
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../[...nextauth]'
import { get2FAStats } from '@/lib/two-factor'

interface Status2FAResponse {
  enabled: boolean
  verifiedAt: string | null
  backupCodesRemaining: number
  error?: string
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<Status2FAResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' } as any)
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Non autorisé' } as any)
    }

    const stats = await get2FAStats(session.user.id)

    res.status(200).json({
      enabled: stats.enabled,
      verifiedAt: stats.verifiedAt?.toISOString() || null,
      backupCodesRemaining: stats.backupCodesRemaining
    })

  } catch (error) {
    console.error('2FA Status error:', error)
    res.status(500).json({ error: 'Erreur serveur' } as any)
  }
}