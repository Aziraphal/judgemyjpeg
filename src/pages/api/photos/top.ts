import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

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

    // Récupérer les top photos (score >= 85) de l'utilisateur
    const topPhotos = await prisma.photo.findMany({
      where: {
        userId: user.id,
        score: {
          gte: 85
        }
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
        { score: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Marquer les photos comme "top photos" si pas déjà fait
    if (topPhotos.length > 0) {
      await prisma.photo.updateMany({
        where: {
          id: { in: topPhotos.map(p => p.id) },
          isTopPhoto: false
        },
        data: { isTopPhoto: true }
      })
    }

    // Formater les données pour le frontend
    const formattedPhotos = topPhotos.map(photo => ({
      ...photo,
      isFavorite: photo.favorites.length > 0,
      favoriteCount: photo._count.favorites
    }))

    res.status(200).json({ topPhotos: formattedPhotos })
  } catch (error) {
    console.error('Erreur top photos:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}