import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { stripe } from '@/lib/stripe'
import { v2 as cloudinary } from 'cloudinary'

/**
 * API de suppression de compte utilisateur
 * Conforme RGPD Article 17 (Droit à l'effacement)
 *
 * Processus :
 * 1. Vérifier authentification
 * 2. Annuler abonnement Stripe (si actif)
 * 3. Supprimer images Cloudinary
 * 4. Supprimer données utilisateur (cascade)
 * 5. Logger la suppression (audit trail)
 * 6. Retourner confirmation
 */

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Méthode autorisée : POST uniquement
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // 2. Récupérer l'utilisateur complet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        photos: true,
        collections: true,
        favorites: true,
        reports: true,
        feedbacks: true,
        accounts: true,
        sessions: true,
        userPreferences: true,
        userSessions: true,
        apiKeys: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // 3. Annuler l'abonnement Stripe (si actif)
    let stripeCancellationDetails = null
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.cancel(
          user.stripeSubscriptionId,
          {
            prorate: false, // Pas de remboursement au prorata
            invoice_now: false
          }
        )

        stripeCancellationDetails = {
          subscriptionId: subscription.id,
          status: subscription.status,
          canceledAt: subscription.canceled_at
        }

        logger.info('Stripe subscription canceled', {
          userId: user.id,
          subscriptionId: user.stripeSubscriptionId,
          status: subscription.status
        })
      } catch (stripeError: any) {
        // Si l'abonnement n'existe plus ou autre erreur Stripe, on continue quand même
        logger.warn('Stripe cancellation error (continuing deletion)', {
          userId: user.id,
          error: stripeError.message
        })
      }
    }

    // 4. Supprimer les images de Cloudinary
    const cloudinaryDeletions: string[] = []
    for (const photo of user.photos) {
      if (photo.url) {
        try {
          // Extraire le public_id de l'URL Cloudinary
          const urlParts = photo.url.split('/')
          const filename = urlParts[urlParts.length - 1]
          const publicId = filename.split('.')[0]

          await cloudinary.uploader.destroy(`judgemyjpeg/${publicId}`)
          cloudinaryDeletions.push(publicId)
        } catch (cloudinaryError: any) {
          logger.warn('Cloudinary deletion error (continuing)', {
            photoId: photo.id,
            url: photo.url,
            error: cloudinaryError.message
          })
        }
      }
    }

    logger.info('Cloudinary images deleted', {
      userId: user.id,
      count: cloudinaryDeletions.length
    })

    // 5. Audit log AVANT suppression
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        email: user.email || 'unknown',
        ipAddress: (req.headers['x-forwarded-for'] as string) ||
                   (req.headers['x-real-ip'] as string) ||
                   req.socket.remoteAddress ||
                   'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        eventType: 'ACCOUNT_DELETION',
        description: `Compte supprimé à la demande de l'utilisateur (RGPD Article 17)`,
        metadata: JSON.stringify({
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          photosCount: user.photos.length,
          collectionsCount: user.collections.length,
          accountCreatedAt: user.createdAt,
          stripeCustomerId: user.stripeCustomerId,
          stripeCancellation: stripeCancellationDetails,
          cloudinaryDeletions: cloudinaryDeletions.length
        }),
        riskLevel: 'MEDIUM',
        success: true
      }
    })

    // 6. Supprimer l'utilisateur (cascade automatique grâce à onDelete: Cascade)
    // Ceci va supprimer :
    // - accounts
    // - sessions
    // - userPreferences
    // - photos
    // - collections (et collectionItems via cascade)
    // - favorites
    // - reports
    // - feedbacks (si userId non null)
    // - userSessions
    // - apiKeys (et apiUsages via cascade)
    await prisma.user.delete({
      where: { id: user.id }
    })

    logger.info('User account deleted successfully', {
      userId: user.id,
      email: user.email,
      photosDeleted: user.photos.length,
      collectionsDeleted: user.collections.length,
      cloudinaryImagesDeleted: cloudinaryDeletions.length
    })

    // 7. Retourner confirmation
    return res.status(200).json({
      success: true,
      message: 'Votre compte a été supprimé définitivement',
      details: {
        photosDeleted: user.photos.length,
        collectionsDeleted: user.collections.length,
        cloudinaryImagesDeleted: cloudinaryDeletions.length,
        stripeSubscriptionCanceled: !!stripeCancellationDetails,
        deletedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    logger.error('Error deleting user account:', error)

    return res.status(500).json({
      error: 'Erreur lors de la suppression du compte',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
