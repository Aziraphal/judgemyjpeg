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

    const { format } = req.query

    // Récupérer toutes les données utilisateur
    const [photos, collections, favorites] = await Promise.all([
      prisma.photo.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { favorites: true } }
        }
      }),
      
      prisma.collection.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: { photo: true }
          },
          _count: { select: { items: true } }
        }
      }),
      
      prisma.favorite.findMany({
        where: { userId: user.id },
        include: { photo: true }
      })
    ])

    if (format === 'csv') {
      // Export CSV des photos
      const csvHeaders = [
        'Nom du fichier',
        'Score',
        'Date d\'analyse',
        'URL',
        'Est favori',
        'Nombre de favoris'
      ].join(',')

      const csvRows = photos.map(photo => [
        `"${photo.filename}"`,
        photo.score || 'N/A',
        `"${photo.createdAt.toISOString()}"`,
        `"${photo.url}"`,
        photo._count.favorites > 0 ? 'Oui' : 'Non',
        photo._count.favorites
      ].join(','))

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="photo-judge-export-${Date.now()}.csv"`)
      return res.send('\uFEFF' + csvContent) // BOM pour UTF-8
    }

    if (format === 'json') {
      // Export JSON complet
      const exportData = {
        user: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        summary: {
          totalPhotos: photos.length,
          totalCollections: collections.length,
          totalFavorites: favorites.length,
          avgScore: photos.length > 0 
            ? photos.reduce((sum, p) => sum + (p.score || 0), 0) / photos.length 
            : 0,
          exportDate: new Date().toISOString()
        },
        photos: photos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          score: photo.score,
          url: photo.url,
          createdAt: photo.createdAt,
          analysis: photo.analysis ? JSON.parse(photo.analysis) : null,
          suggestions: photo.suggestions ? JSON.parse(photo.suggestions) : null,
          favoriteCount: photo._count.favorites
        })),
        collections: collections.map(collection => ({
          id: collection.id,
          name: collection.name,
          description: collection.description,
          color: collection.color,
          photoCount: collection._count.items,
          photos: collection.items.map(item => ({
            filename: item.photo.filename,
            score: item.photo.score,
            addedAt: item.addedAt
          }))
        })),
        favorites: favorites.map(favorite => ({
          photoFilename: favorite.photo.filename,
          photoScore: favorite.photo.score,
          addedAt: favorite.createdAt
        }))
      }

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="photo-judge-data-${Date.now()}.json"`)
      return res.json(exportData)
    }

    // Format par défaut: résumé JSON simple
    const summary = {
      statistics: {
        totalPhotos: photos.length,
        totalCollections: collections.length,
        totalFavorites: favorites.length,
        avgScore: photos.length > 0 
          ? Math.round((photos.reduce((sum, p) => sum + (p.score || 0), 0) / photos.length) * 10) / 10
          : 0,
        topPhotos: photos.filter(p => (p.score || 0) >= 85).length,
        recentPhotos: photos.filter(p => 
          new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      },
      topPhotos: photos
        .filter(p => (p.score || 0) >= 85)
        .slice(0, 10)
        .map(p => ({
          filename: p.filename,
          score: p.score,
          date: p.createdAt.toISOString().split('T')[0]
        })),
      collections: collections.map(c => ({
        name: c.name,
        photoCount: c._count.items,
        description: c.description
      })),
      exportDate: new Date().toISOString()
    }

    res.status(200).json(summary)

  } catch (error) {
    logger.error('Erreur export données:', error)
    res.status(500).json({ 
      error: 'Erreur lors de l\'export des données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}