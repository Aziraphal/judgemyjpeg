import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { analyzePhoto, AnalysisTone, AnalysisLanguage } from '@/services/openai'
import { uploadPhoto } from '@/services/cloudinary'
import { prisma } from '@/lib/prisma'
import { getUserSubscription, incrementAnalysisCount } from '@/services/subscription'
import formidable, { File } from 'formidable'
import { readFileSync } from 'fs'
import { validateUpload } from '@/lib/file-validation'
import { AuditLogger } from '@/lib/audit-trail'

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

    // Parse le fichier uploadé avec limite très élevée pour smartphones modernes
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB max pour photos smartphone modernes
      maxTotalFileSize: 25 * 1024 * 1024,
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
    const fileBuffer = readFileSync(file.filepath)
    
    // Validation sécurisée du fichier avec magic bytes
    const validation = validateUpload(fileBuffer, file.originalFilename || 'photo.jpg', {
      maxSize: 25 * 1024 * 1024, // 25MB limit pour smartphones modernes
      allowedTypes: ['jpg', 'png', 'webp'],
      strictMode: true // Mode strict pour la sécurité
    })
    
    if (!validation.isValid) {
      logger.warn('File validation failed', {
        filename: file.originalFilename,
        errors: validation.errors,
        detectedType: validation.detectedType,
        isSuspicious: validation.isSuspicious
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
        type: validation.detectedType
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
    
    const analysisTone: AnalysisTone = (tone === 'roast' || tone === 'professional') ? tone : 'professional'
    const analysisLanguage: AnalysisLanguage = (['fr', 'en', 'es', 'de', 'it', 'pt'].includes(language as string)) ? language as AnalysisLanguage : 'fr'

    const base64Image = fileBuffer.toString('base64')

    // Upload vers Cloudinary
    const uploadResult = await uploadPhoto(fileBuffer, file.originalFilename || 'photo')

    // Analyser avec OpenAI GPT-4o-mini avec le ton sélectionné
    const analysis = await analyzePhoto(base64Image, analysisTone, analysisLanguage)

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
        potentialScore: analysis.potentialScore,
        improvements: JSON.stringify(analysis.improvements),
        suggestions: JSON.stringify(analysis.suggestions),
      }
    })

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
      analysis
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