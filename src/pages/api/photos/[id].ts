import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID invalide' })
  }

  if (req.method === 'DELETE') {
    try {
      // Vérifier que la photo appartient bien à l'utilisateur
      const photo = await prisma.photo.findFirst({
        where: {
          id: id,
          userId: session.user.id
        }
      })

      if (!photo) {
        return res.status(404).json({ error: 'Photo non trouvée' })
      }

      // Supprimer la photo de la base de données
      await prisma.photo.delete({
        where: { id: id }
      })

      res.status(200).json({ success: true })
    } catch (error) {
      logger.error('Erreur suppression photo:', error)
      res.status(500).json({ error: 'Erreur lors de la suppression' })
    }
  } else {
    res.setHeader('Allow', ['DELETE'])
    res.status(405).json({ error: 'Méthode non autorisée' })
  }
}