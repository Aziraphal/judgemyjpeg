import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { analyzePhoto, AnalysisTone, AnalysisLanguage } from '@/services/openai'
import { uploadPhoto } from '@/services/cloudinary'
import { ExifData } from '@/types/exif'
import { prisma } from '@/lib/prisma'
import { getUserSubscription, incrementAnalysisCount } from '@/services/subscription'
import formidable, { File } from 'formidable'
import { readFileSync } from 'fs'
import { validateUpload } from '@/lib/file-validation'
import { AuditLogger } from '@/lib/audit-trail'
import { cacheService } from '@/lib/cache-service'
import { moderateImage, ModerationResult } from '@/lib/moderation'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60, // 60 secondes max
}

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  const auditLogger = new AuditLogger(req, req.user.id, req.user.email)
  
  logger.info('Photo analysis started', { 
    filename: 'analyze.ts',
    method: req.method 
  }, req.user.id, ip)

  try {

    // Parse le fichier uploadé avec limite Railway
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limite Railway
      maxTotalFileSize: 50 * 1024 * 1024,
      keepExtensions: true,
      allowEmptyFiles: false,
      filter: (part) => part.mimetype?.startsWith('image/') || false,
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.photo) ? files.photo[0] : files.photo

    if (!file) {
      return res.status(400).json({ error: 'Aucune photo fournie' })
    }

    // Lire le fichier pour validation
    let fileBuffer = readFileSync(file.filepath)
    
    // 🛡️ MODÉRATION CONTENU
    try {
      const sharp = require('sharp')
      const imageMetadata = await sharp(fileBuffer).metadata()
      
      const moderationResult = await moderateImage(
        file.originalFilename || 'photo.jpg',
        imageMetadata,
        imageMetadata.width,
        imageMetadata.height
      )
      
      if (moderationResult.flagged) {
        // Log de sécurité
        logger.warn('Content blocked by moderation', {
          reason: moderationResult.reason,
          categories: Object.keys(moderationResult.categories).filter(
            key => moderationResult.categories[key as keyof typeof moderationResult.categories]
          ),
          filename: file.originalFilename,
          ip
        }, req.user.id, ip)
        
        // Note: Audit trail déjà dans les logs ci-dessus
        
        return res.status(400).json({
          error: 'Contenu non autorisé',
          reason: 'Cette image ne respecte pas nos conditions d\'utilisation.',
          details: moderationResult.reason
        })
      }
    } catch (error) {
      logger.error('Moderation system error', { error: error instanceof Error ? error.message : 'Unknown error' }, req.user.id, ip)
      // Continuer en cas d'erreur de modération pour ne pas bloquer le service
    }
    
    // COMPRESSION SERVEUR AUTOMATIQUE si >4MB
    if (fileBuffer.length > 4 * 1024 * 1024) {
      logger.info('Large file detected, compressing server-side', {
        originalSize: Math.round(fileBuffer.length / 1024 / 1024 * 100) / 100,
        filename: file.originalFilename
      }, req.user.id, ip)
      
      try {
        const sharp = require('sharp')
        
        // Compression intelligente adaptative
        let quality = 80
        let width = 1200
        let compressed = fileBuffer
        
        while (compressed.length > 4 * 1024 * 1024 && quality > 20) {
          compressed = await sharp(fileBuffer)
            .resize(width, width, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: quality,
              progressive: true,
              mozjpeg: true 
            })
            .toBuffer()
          
          if (compressed.length > 4 * 1024 * 1024) {
            if (quality > 40) {
              quality -= 15
            } else if (width > 600) {
              width -= 200
              quality = 70
            } else {
              quality -= 10
            }
          }
        }
        
        fileBuffer = compressed
        const finalSizeMB = Math.round(fileBuffer.length / 1024 / 1024 * 100) / 100
        logger.info('Server compression successful', {
          finalSize: finalSizeMB,
          compressionRatio: Math.round((1 - fileBuffer.length / file.size) * 100)
        }, req.user.id, ip)
        
      } catch (compressionError) {
        logger.warn('Server compression failed, using original', compressionError, req.user.id, ip)
        // Continuer avec fichier original si compression échoue
      }
    }
    
    // Validation sécurisée du fichier avec magic bytes
    const validation = validateUpload(fileBuffer, file.originalFilename || 'photo.jpg', {
      maxSize: 50 * 1024 * 1024, // 50MB limite Railway
      allowedTypes: ['jpg', 'png', 'webp'],
      strictMode: false // Mode souple pour compatibilité smartphone
    })
    
    if (!validation.isValid) {
      logger.warn('File validation failed', {
        filename: file.originalFilename,
        errors: validation.errors,
        detectedType: validation.detectedType,
        isSuspicious: validation.isSuspicious,
        fileSize: fileBuffer.length,
        strictMode: true,
        allowedTypes: ['jpg', 'png', 'webp']
      }, req.user.id, ip)
      
      // Audit: File upload rejected (security event)
      await auditLogger.fileUploadRejected(
        req.user.id, 
        file.originalFilename || 'unknown', 
        validation.errors.join(', ')
      )
      
      return res.status(400).json({ 
        error: 'Fichier invalide',
        details: validation.errors,
        type: validation.detectedType,
        debug: {
          fileSize: fileBuffer.length,
          detectedType: validation.detectedType,
          errors: validation.errors,
          warnings: validation.warnings
        }
      })
    }
    
    // Log warnings même si valide
    if (validation.warnings.length > 0) {
      logger.warn('File validation warnings', {
        filename: file.originalFilename,
        warnings: validation.warnings,
        detectedType: validation.detectedType
      }, req.user.id, ip)
    }

    // Récupérer le ton et la langue sélectionnés
    const tone = Array.isArray(fields.tone) ? fields.tone[0] : fields.tone
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language
    
    const analysisTone: AnalysisTone = (tone === 'roast' || tone === 'professional' || tone === 'expert') ? tone : 'professional'
    const analysisLanguage: AnalysisLanguage = (['fr', 'en', 'es', 'de', 'it', 'pt'].includes(language as string)) ? language as AnalysisLanguage : 'fr'

    // Récupérer les données EXIF si fournies (mode Expert)
    let exifData: ExifData | null = null
    if (fields.exifData) {
      try {
        const rawExifData = Array.isArray(fields.exifData) ? fields.exifData[0] : fields.exifData
        const parsedExifData = JSON.parse(rawExifData) as ExifData
        exifData = parsedExifData
        logger.info('EXIF data received for Expert analysis', {
          hasCamera: !!parsedExifData.camera,
          hasISO: !!parsedExifData.iso,
          hasAperture: !!parsedExifData.aperture,
          keys: Object.keys(parsedExifData)
        }, req.user.id, ip)
      } catch (parseError) {
        logger.warn('Failed to parse EXIF data', parseError, req.user.id, ip)
        exifData = null
      }
    }

    const base64Image = fileBuffer.toString('base64')
    
    // Générer hash unique pour cette image
    const imageHash = cacheService.generateImageHash(fileBuffer)
    
    // Vérifier le cache d'abord
    let analysis = await cacheService.getCachedAnalysis(imageHash, analysisTone, analysisLanguage)
    let fromCache = false
    
    if (analysis) {
      fromCache = true
      logger.info('Analysis from cache', { 
        imageHash: imageHash,
        tone: analysisTone,
        language: analysisLanguage
      }, req.user.id, ip)
    } else {
      // Upload vers Cloudinary seulement si pas en cache
      const uploadResult = await uploadPhoto(fileBuffer, file.originalFilename || 'photo')
      
      // Analyser avec OpenAI GPT-4o-mini avec le ton sélectionné et EXIF si disponible
      analysis = await analyzePhoto(base64Image, analysisTone, analysisLanguage, exifData)
      
      // Mettre en cache le résultat (TTL: 24h)
      await cacheService.cacheAnalysis(imageHash, analysis, analysisTone, analysisLanguage, 86400)
      
      logger.info('Analysis computed and cached', { 
        imageHash: imageHash,
        score: analysis.score,
        tone: analysisTone,
        language: analysisLanguage
      }, req.user.id, ip)
    }

    // Upload vers Cloudinary (nécessaire pour sauvegarder même si analyse en cache)
    const uploadResult = await uploadPhoto(fileBuffer, file.originalFilename || 'photo')

    // Sauvegarder en base - utilisateur déjà disponible via middleware
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

    const photo = await prisma.photo.create({
      data: {
        userId: user.id,
        url: uploadResult.url,
        filename: file.originalFilename || 'photo.jpg',
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
    
    logger.info('Photo analysis completed successfully', {
      photoId: photo.id,
      score: analysis.score,
      filename: photo.filename
    }, req.user.id, ip)

    res.status(200).json({
      photo: {
        id: photo.id,
        url: photo.url,
        filename: photo.filename,
        createdAt: photo.createdAt,
      },
      analysis,
      cache: {
        hit: fromCache,
        imageHash: imageHash.substring(0, 8) // Premiers 8 caractères pour debug
      },
      // Données pour tracking Google Analytics côté client
      tracking: {
        tone: analysisTone,
        language: analysisLanguage,
        score: analysis.score,
        isTopPhoto: analysis.score >= 85
      }
    })

  } catch (error) {
    logger.error('Photo analysis failed', error, req.user.id, ip)
    
    // Gestion spécifique des erreurs formidable
    if (error && typeof error === 'object' && 'code' in error) {
      const formError = error as any
      if (formError.code === 1002) {
        return res.status(400).json({ 
          error: 'Upload interrompu - vérifiez la taille du fichier ou votre connexion',
          details: 'La requête a été annulée'
        })
      }
    }
    
    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse de la photo',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
})