import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { analyzePhoto } from '@/services/openai'
import cloudinary from 'cloudinary'

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: false, // Nécessaire pour formidable
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    // Parse du formulaire avec formidable - limite haute pour Railway
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB (Railway peut gérer!)
      keepExtensions: true,
      maxFields: 10,
      maxFieldsSize: 2 * 1024 * 1024,
    })

    const [fields, files] = await form.parse(req)
    
    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo
    const tone = Array.isArray(fields.tone) ? fields.tone[0] : fields.tone || 'professional'
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language || 'fr'

    if (!photoFile) {
      return res.status(400).json({ error: 'Aucun fichier fourni' })
    }

    console.log(`[TEST API] Fichier reçu: ${photoFile.originalFilename}, Taille: ${Math.round(photoFile.size / 1024 / 1024 * 100) / 100}MB`)

    // Upload vers Cloudinary depuis Railway (pas de limite!)
    const uploadResult = await cloudinary.v2.uploader.upload(photoFile.filepath, {
      resource_type: 'image',
      folder: 'judgemyjpeg-test',
      public_id: `test-${Date.now()}`,
      overwrite: true,
      transformation: [
        { quality: 'auto:good' }, // Optimisation automatique
        { fetch_format: 'auto' }  // Format optimal
      ]
    })

    console.log(`[TEST API] Cloudinary upload réussi: ${uploadResult.secure_url}`)

    // Analyser avec OpenAI
    const imageBase64 = Buffer.from(
      await fetch(uploadResult.secure_url).then(r => r.arrayBuffer())
    ).toString('base64')

    const analysis = await analyzePhoto(imageBase64, tone as any, language as any)

    // Créer un objet photo fictif pour les tests
    const photoData = {
      id: 'test-' + Date.now(),
      url: uploadResult.secure_url,
      filename: photoFile.originalFilename || 'test-image.jpg',
      createdAt: new Date().toISOString(),
      cloudinaryId: uploadResult.public_id,
      size: photoFile.size,
      originalSize: photoFile.size, // Pas de compression sur Railway!
      compressionRatio: '100%' // Pas de compression!
    }

    console.log(`[TEST API] Analyse terminée. Score: ${analysis.score}/100`)

    res.status(200).json({
      photo: photoData,
      analysis: analysis,
      debug: {
        originalSize: `${Math.round(photoFile.size / 1024 / 1024 * 100) / 100}MB`,
        finalSize: `${Math.round(photoFile.size / 1024 / 1024 * 100) / 100}MB`,
        compression: 'Aucune - Railway gère les gros fichiers!',
        platform: 'Railway.app',
        limit: '50MB (vs 4.5MB Vercel)'
      }
    })

  } catch (error) {
    console.error('Erreur API analyze-test:', error)
    
    if (error instanceof Error) {
      // Erreurs spécifiques
      if (error.message.includes('File too large')) {
        return res.status(413).json({ 
          error: `Fichier trop volumineux. Maximum: 50MB`,
          debug: 'Railway limite'
        })
      }
    }

    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse',
      debug: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}