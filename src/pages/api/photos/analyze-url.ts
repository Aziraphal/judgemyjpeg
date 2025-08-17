import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { analyzePhoto, AnalysisTone, AnalysisLanguage } from '@/services/openai'
import { prisma } from '@/lib/prisma'
import { getUserSubscription, incrementAnalysisCount } from '@/services/subscription'
import { AuditLogger } from '@/lib/audit-trail'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Juste pour les données JSON (URL)
    },
  },
  maxDuration: 60,
}

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const auditLogger = new AuditLogger(req, req.user.id, req.user.email)
  
  logger.info('Photo analysis by URL started', { 
    filename: 'analyze-url.ts',
    method: req.method 
  }, req.user.id, ip)

  try {
    const { photoUrl, tone, language } = req.body

    if (!photoUrl || typeof photoUrl !== 'string') {
      return res.status(400).json({ error: 'URL de photo manquante' })
    }

    // Valider que c'est bien une URL Cloudinary de notre domaine
    if (!photoUrl.includes('res.cloudinary.com') || !photoUrl.includes(process.env.CLOUDINARY_CLOUD_NAME || '')) {
      return res.status(400).json({ error: 'URL de photo non valide' })
    }

    const analysisTone: AnalysisTone = (tone === 'roast' || tone === 'professional' || tone === 'expert') ? tone : 'professional'
    const analysisLanguage: AnalysisLanguage = (['fr', 'en', 'es', 'de', 'it', 'pt'].includes(language)) ? language : 'fr'

    // Récupérer l'image depuis Cloudinary et la convertir en base64 pour OpenAI
    const imageResponse = await fetch(photoUrl)
    if (!imageResponse.ok) {
      throw new Error('Impossible de récupérer l\'image depuis Cloudinary')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    // Analyser avec OpenAI
    const analysis = await analyzePhoto(base64Image, analysisTone, analysisLanguage)

    // Sauvegarder en base
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    })

    if (!user) {
      logger.error('User not found after authentication', { email: req.user.email }, req.user.id, ip)
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Vérifier les limites d'abonnement
    const subscription = await getUserSubscription(user.id)
    if (!subscription.canAnalyze) {
      return res.status(403).json({ 
        error: 'Limite d\'analyses atteinte',
        message: `Vous avez utilisé vos ${subscription.maxMonthlyAnalyses} analyses gratuites ce mois. Passez Premium pour des analyses illimitées !`,
        subscription: {
          current: subscription.monthlyAnalysisCount,
          max: subscription.maxMonthlyAnalyses,
          daysUntilReset: subscription.daysUntilReset
        }
      })
    }

    // Incrémenter le compteur d'analyses
    await incrementAnalysisCount(user.id)

    // Extraire le nom de fichier depuis l'URL Cloudinary
    const filename = photoUrl.split('/').pop()?.split('.')[0] + '.jpg' || 'photo.jpg'

    const photo = await prisma.photo.create({
      data: {
        userId: user.id,
        url: photoUrl,
        filename: filename,
        analysis: JSON.stringify(analysis),
        score: analysis.score,
        improvements: JSON.stringify(analysis.improvements),
        suggestions: JSON.stringify(analysis.suggestions),
      }
    })

    // Si la photo a un score ≥ 85, l'ajouter automatiquement à la collection "Top Photos"
    if (analysis.score >= 85) {
      try {
        // Chercher ou créer la collection "Top Photos" pour cet utilisateur
        let topPhotosCollection = await prisma.collection.findFirst({
          where: {
            userId: user.id,
            name: '🏆 Top Photos'
          }
        })

        if (!topPhotosCollection) {
          // Créer la collection automatiquement
          topPhotosCollection = await prisma.collection.create({
            data: {
              userId: user.id,
              name: '🏆 Top Photos',
              description: 'Collection automatique de vos meilleures photos (score ≥ 85)'
            }
          })
        }

        // Ajouter la photo à la collection (si pas déjà présente)
        const existingPhotoInCollection = await prisma.collectionItem.findFirst({
          where: {
            photoId: photo.id,
            collectionId: topPhotosCollection.id
          }
        })

        if (!existingPhotoInCollection) {
          await prisma.collectionItem.create({
            data: {
              photoId: photo.id,
              collectionId: topPhotosCollection.id
            }
          })
        }
      } catch (error) {
        console.error('Erreur ajout Top Photos collection:', error)
        // Ne pas faire échouer l'analyse si problème collection
      }
    }

    // Audit: Successful photo analysis
    await auditLogger.photoAnalysis(req.user.id, photo.filename, analysis.score)
    
    logger.info('Photo analysis by URL completed successfully', {
      photoId: photo.id,
      score: analysis.score,
      filename: photo.filename,
      photoUrl: photoUrl
    }, req.user.id, ip)

    res.status(200).json({
      photo: {
        id: photo.id,
        url: photo.url,
        filename: photo.filename,
        createdAt: photo.createdAt,
      },
      analysis
    })

  } catch (error) {
    logger.error('Photo analysis by URL failed', error, req.user.id, ip)
    
    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse de la photo',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
})