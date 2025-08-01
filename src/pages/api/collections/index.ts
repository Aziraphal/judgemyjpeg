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

    if (req.method === 'GET') {
      // Récupérer toutes les collections de l'utilisateur
      const collections = await prisma.collection.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              photo: true
            }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      res.status(200).json({ collections })
    } else if (req.method === 'POST') {
      // Créer une nouvelle collection
      const { name, description, color } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Nom de collection requis' })
      }

      try {
        const collection = await prisma.collection.create({
          data: {
            userId: user.id,
            name,
            description: description || null,
            color: color || '#FF006E',
          }
        })

        res.status(201).json({ collection })
      } catch (error) {
        // Collection avec ce nom existe déjà
        res.status(400).json({ error: 'Une collection avec ce nom existe déjà' })
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Erreur collections:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}