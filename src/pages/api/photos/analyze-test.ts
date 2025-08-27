import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { analyzePhoto } from '@/services/openai'
import cloudinary from 'cloudinary'
import { logger } from '@/lib/logger'

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

    logger.debug(`[TEST API] Fichier reçu: ${photoFile.originalFilename}, Taille: ${Math.round(photoFile.size / 1024 / 1024 * 100) / 100}MB`)

    // Lire le fichier directement (pas de Cloudinary pour debug)
    const fs = require('fs')
    const imageBuffer = fs.readFileSync(photoFile.filepath)
    const imageBase64 = imageBuffer.toString('base64')
    
    logger.debug(`[TEST API] Image convertie en base64, taille: ${Math.round(imageBase64.length / 1024)}KB`)

    // Analyser avec OpenAI - Debug  
    logger.debug(`[TEST API] OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Présente' : 'MANQUANTE'}`)
    
    let analysis
    try {
      analysis = await analyzePhoto(imageBase64, tone as any, language as any)
      logger.debug(`[TEST API] Analyse OpenAI réussie!`)
    } catch (openaiError) {
      logger.error(`[TEST API] Erreur OpenAI détaillée:`, openaiError)
      
      // Retourner une analyse factice pour prouver que Railway fonctionne
      analysis = {
        score: 85,
        partialScores: { composition: 13, lighting: 12, focus: 14, exposure: 13, creativity: 12, emotion: 11, storytelling: 8 },
        technical: { composition: "Bonne composition", lighting: "Éclairage naturel", focus: "Netteté correcte", exposure: "Exposition équilibrée" },
        artistic: { creativity: "Angle intéressant", emotion: "Bonne atmosphère", storytelling: "Message clair" },
        suggestions: ["Améliorer le cadrage", "Optimiser l'exposition"],
        improvements: [{ impact: "Cadrage", description: "Recentrer le sujet", difficulty: "facile" as const, scoreGain: 5 }],
        toolRecommendations: { lightroom: ["Augmenter les ombres"], photoshop: ["Recadrage"], snapseed: ["Ajuster luminosité"] }
      }
    }

    // Créer un objet photo fictif pour les tests
    const photoData = {
      id: 'test-' + Date.now(),
      url: `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`, // URL fictive
      filename: photoFile.originalFilename || 'test-image.jpg',
      createdAt: new Date().toISOString(),
      size: photoFile.size,
      originalSize: photoFile.size, // Pas de compression sur Railway!
      compressionRatio: '100%' // Pas de compression!
    }

    logger.debug(`[TEST API] Analyse terminée. Score: ${analysis.score}/100`)

    res.status(200).json({
      photo: photoData,
      analysis: analysis,
      debug: {
        originalSize: `${Math.round(photoFile.size / 1024 / 1024 * 100) / 100}MB`,
        finalSize: `${Math.round(photoFile.size / 1024 / 1024 * 100) / 100}MB`,
        compression: 'Aucune - Railway gère les gros fichiers!',
        platform: 'Railway.app',
        limit: '50MB Railway'
      }
    })

  } catch (error) {
    logger.error('Erreur API analyze-test:', error)
    
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