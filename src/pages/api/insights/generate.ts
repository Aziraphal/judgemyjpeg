import type { NextApiRequest, NextApiResponse } from 'next'
import { logger, getClientIP } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // SERVICE INSIGHTS TEMPORAIREMENT DÉSACTIVÉ
    const ip = getClientIP(req)
    logger.info('Tentative accès service insights désactivé', { ip })
    
    return res.status(503).json({ 
      error: 'Service d\'insights en développement',
      message: 'Cette fonctionnalité sera disponible prochainement. Concentrez-vous sur l\'analyse de vos photos en attendant !',
      status: 'development'
    })

  } catch (error) {
    const ip = getClientIP(req)
    logger.error('Erreur API insights désactivée', error, undefined, ip)
    
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Service temporairement indisponible'
    })
  }
}

/* 
 * CODE ORIGINAL COMMENTÉ - À RÉACTIVER QUAND LE SERVICE SERA PRÊT
 * 
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { generateUserInsights } from '@/services/insights'

// ... tout le code original sera ici quand on réactivera
*/