import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = req.user.id

    // Récupérer toutes les données utilisateur
    const [user, photos, collections, favorites, reports, feedbacks, auditLogs] = await Promise.all([
      // Données profil utilisateur
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          subscriptionStatus: true,
          monthlyAnalysisCount: true,
          lastAnalysisReset: true,
          currentPeriodEnd: true,
          stripeCustomerId: true,
          twoFactorEnabled: true,
          userPreferences: true
        }
      }),

      // Photos analysées
      prisma.photo.findMany({
        where: { userId },
        select: {
          id: true,
          filename: true,
          url: true,
          analysis: true,
          score: true,
          suggestions: true,
          improvements: true,
          potentialScore: true,
          createdAt: true,
          updatedAt: true,
          isTopPhoto: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Collections
      prisma.collection.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              id: true,
              addedAt: true,
              photo: {
                select: {
                  id: true,
                  filename: true,
                  score: true,
                  createdAt: true
                }
              }
            }
          }
        }
      }),

      // Photos favorites
      prisma.favorite.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          photo: {
            select: {
              id: true,
              filename: true,
              score: true
            }
          }
        }
      }),

      // Signalements effectués
      prisma.report.findMany({
        where: { reporterId: userId },
        select: {
          id: true,
          photoId: true,
          photoUrl: true,
          reason: true,
          details: true,
          status: true,
          createdAt: true
        }
      }),

      // Feedbacks donnés
      prisma.feedback.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          category: true,
          rating: true,
          title: true,
          message: true,
          page: true,
          createdAt: true
        }
      }),

      // Logs d'audit (actions importantes)
      prisma.auditLog.findMany({
        where: { userId },
        select: {
          id: true,
          eventType: true,
          description: true,
          riskLevel: true,
          success: true,
          timestamp: true
        },
        orderBy: { timestamp: 'desc' },
        take: 100 // Limiter aux 100 dernières actions
      })
    ])

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Statistiques d'usage
    const stats = {
      totalPhotos: photos.length,
      totalCollections: collections.length,
      totalFavorites: favorites.length,
      averageScore: photos.length > 0 
        ? Math.round(photos.reduce((sum, photo) => sum + (photo.score || 0), 0) / photos.length)
        : 0,
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)), // jours
      lastActivity: photos[0]?.createdAt || user.createdAt
    }

    // Structure finale des données exportées
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportReason: 'RGPD Article 20 - Portabilité des données',
        dataController: {
          name: 'JudgeMyJPEG - CodeCraft Plus',
          siret: '98958739900019',
          contact: 'contact.judgemyjpeg@gmail.com'
        }
      },
      
      personalData: {
        profile: user,
        statistics: stats,
        subscription: {
          status: user.subscriptionStatus,
          monthlyAnalyses: user.monthlyAnalysisCount,
          nextReset: user.lastAnalysisReset,
          endDate: user.currentPeriodEnd
        }
      },

      contentData: {
        photos: photos.map(photo => ({
          ...photo,
          // Supprimer l'URL pour la vie privée dans l'export
          url: photo.url ? '[URL_REMOVED_FOR_PRIVACY]' : null,
          analysis: photo.analysis ? JSON.parse(photo.analysis as string) : null
        })),
        
        collections,
        favorites: favorites.map(fav => ({
          id: fav.id,
          createdAt: fav.createdAt,
          photo: fav.photo
        }))
      },

      activityData: {
        reports: reports,
        feedbacks: feedbacks,
        recentActions: auditLogs
      },

      legalInfo: {
        rgpd: {
          dataRetention: {
            photos: user.subscriptionStatus === 'free' ? '30 jours' : '1 an',
            profile: '3 ans après résiliation',
            analytics: '13 mois'
          },
          rights: [
            'Droit d\'accès (Article 15)',
            'Droit de rectification (Article 16)', 
            'Droit à l\'effacement (Article 17)',
            'Droit à la portabilité (Article 20)',
            'Droit d\'opposition (Article 21)'
          ],
          contact: 'contact.judgemyjpeg@gmail.com'
        }
      }
    }

    // Log de l'export pour audit
    await prisma.auditLog.create({
      data: {
        userId: userId,
        email: user.email,
        ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        eventType: 'data_export',
        description: 'Export RGPD des données personnelles',
        metadata: JSON.stringify({
          photosCount: photos.length,
          collectionsCount: collections.length,
          exportSize: JSON.stringify(exportData).length
        }),
        riskLevel: 'low',
        success: true
      }
    })

    logger.info('RGPD data export completed', {
      userId,
      photosCount: photos.length,
      collectionsCount: collections.length
    })

    // Headers pour téléchargement
    const filename = `judgemyjpeg-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache')

    return res.status(200).json(exportData)

  } catch (error) {
    logger.error('RGPD export error', error, req.user.id)
    return res.status(500).json({ 
      error: 'Erreur lors de l\'export des données',
      details: 'Veuillez contacter le support si le problème persiste'
    })
  }
}

export default withAuth(handler)