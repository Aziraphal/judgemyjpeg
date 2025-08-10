import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { readFileSync } from 'fs'
import sharp from 'sharp'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
  maxDuration: 30,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB max
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
    const maxSizeStr = Array.isArray(fields.maxSize) ? fields.maxSize[0] : fields.maxSize
    const maxSize = parseInt(maxSizeStr as string) || 3500000 // 3.5MB par défaut

    if (!file) {
      return res.status(400).json({ error: 'Aucune photo fournie' })
    }

    const fileBuffer = readFileSync(file.filepath)
    
    // Compression agressive avec Sharp (plus puissant que Canvas)
    let quality = 80
    let width = 1200
    let compressed = fileBuffer

    // Boucle de compression jusqu'à atteindre la taille cible
    while (compressed.length > maxSize && quality > 10) {
      compressed = await sharp(fileBuffer)
        .resize(width, width, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: quality,
          progressive: true,
          mozjpeg: true // Compression optimale
        })
        .toBuffer()

      // Si encore trop gros, réduire davantage
      if (compressed.length > maxSize) {
        if (quality > 30) {
          quality -= 10
        } else if (width > 400) {
          width -= 100
          quality = 60 // Reset quality quand on réduit la taille
        } else {
          quality -= 5 // Dernière tentative qualité minimale
        }
      }
    }

    // Retourner l'image compressée
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Length', compressed.length)
    res.status(200).send(compressed)

  } catch (error) {
    console.error('Erreur compression serveur:', error)
    res.status(500).json({ 
      error: 'Erreur compression',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}