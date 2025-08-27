import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const { photoId } = req.body

    if (!photoId) {
      return res.status(400).json({ error: 'Photo ID requis' })
    }

    if (req.method === 'POST') {
      // Ajouter aux favoris
      try {
        const favorite = await prisma.favorite.create({
          data: {
            userId: user.id,
            photoId: photoId,
          }
        })
        
        res.status(201).json({ favorite, isFavorite: true })
      } catch (error) {
        // Photo déjà en favori
        res.status(200).json({ message: 'Déjà en favori', isFavorite: true })
      }
    } else if (req.method === 'DELETE') {
      // Retirer des favoris
      await prisma.favorite.deleteMany({
        where: {
          userId: user.id,
          photoId: photoId,
        }
      })
      
      res.status(200).json({ message: 'Retiré des favoris', isFavorite: false })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Erreur favoris:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}