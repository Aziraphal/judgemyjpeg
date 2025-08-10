import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { logger, getClientIP } from '@/lib/logger'
import { uploadPhoto } from '@/services/cloudinary'
import formidable from 'formidable'
import { readFileSync } from 'fs'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60,
}

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIP(req)
  
  logger.info('Large photo upload via proxy started', { 
    filename: 'upload-large.ts',
    method: req.method 
  }, req.user.id, ip)

  try {
    // Parse le fichier avec limite très élevée
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB
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

    const fileBuffer = readFileSync(file.filepath)
    const originalSizeMB = Math.round(fileBuffer.length / 1024 / 1024 * 100) / 100
    
    logger.info('Uploading large file to Cloudinary via proxy', {
      originalSize: originalSizeMB,
      filename: file.originalFilename
    }, req.user.id, ip)

    // Upload vers Cloudinary côté serveur (pas de CORS)
    const uploadResult = await uploadPhoto(fileBuffer, file.originalFilename || 'photo-large')
    
    logger.info('Large photo upload successful', {
      cloudinaryUrl: uploadResult.url,
      originalSize: originalSizeMB
    }, req.user.id, ip)

    // Retourner l'URL pour analyse
    res.status(200).json({
      photoUrl: uploadResult.url,
      originalSize: originalSizeMB,
      filename: file.originalFilename || 'photo-large.jpg'
    })

  } catch (error) {
    logger.error('Large photo upload failed', error, req.user.id, ip)
    
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload de la photo',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
})