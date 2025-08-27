import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    // Récupérer TOUTES les photos de l'utilisateur
    const allPhotos = await prisma.photo.findMany({
      where: {
        userId: user.id
      },
      include: {
        favorites: {
          where: { userId: user.id }
        },
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Formater les données pour le frontend
    const formattedPhotos = allPhotos.map(photo => ({
      ...photo,
      isFavorite: photo.favorites.length > 0,
      favoriteCount: photo._count.favorites
    }))

    res.status(200).json({ photos: formattedPhotos })
  } catch (error) {
    logger.error('Erreur récupération photos:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}