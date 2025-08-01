import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

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

    const { id: collectionId } = req.query
    const { photoId } = req.body

    if (!collectionId || typeof collectionId !== 'string') {
      return res.status(400).json({ error: 'ID de collection requis' })
    }

    // Vérifier que la collection appartient à l'utilisateur
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: user.id
      }
    })

    if (!collection) {
      return res.status(404).json({ error: 'Collection non trouvée' })
    }

    if (req.method === 'POST') {
      // Ajouter une photo à la collection
      if (!photoId) {
        return res.status(400).json({ error: 'Photo ID requis' })
      }

      try {
        const collectionItem = await prisma.collectionItem.create({
          data: {
            collectionId,
            photoId,
          },
          include: {
            photo: true
          }
        })

        res.status(201).json({ collectionItem })
      } catch (error) {
        // Photo déjà dans la collection
        res.status(400).json({ error: 'Photo déjà dans cette collection' })
      }
    } else if (req.method === 'DELETE') {
      // Retirer une photo de la collection
      if (!photoId) {
        return res.status(400).json({ error: 'Photo ID requis' })
      }

      await prisma.collectionItem.deleteMany({
        where: {
          collectionId,
          photoId,
        }
      })

      res.status(200).json({ message: 'Photo retirée de la collection' })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Erreur collection photos:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}