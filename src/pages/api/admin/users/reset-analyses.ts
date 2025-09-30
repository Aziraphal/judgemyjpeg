import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Vérifier si l'utilisateur est admin
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, role: true }
    })

    if (!adminUser?.isAdmin && adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' })
    }

    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' })
    }

    // Réinitialiser le compteur d'analyses
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyAnalysisCount: 0,
        lastAnalysisReset: new Date()
      }
    })

    logger.info(`Admin ${session.user.email} a réinitialisé les analyses de ${userId}`)

    res.status(200).json({
      success: true,
      message: 'Compteur d\'analyses réinitialisé'
    })

  } catch (error) {
    logger.error('Erreur reset analyses:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}