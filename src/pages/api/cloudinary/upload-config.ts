import type { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = 'photo-judge-large'
    
    // Paramètres optimisés pour photos smartphone (pas de transformation forcée)
    const uploadParams = {
      timestamp: timestamp,
      folder: folder,
      resource_type: 'image',
      // Permettre fichiers jusqu'à 25MB (limite Cloudinary gratuit)
      // Format auto-détection, pas de transformation forcée
    }
    
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET!
    )

    console.log('Cloudinary signed config generated', {
      timestamp,
      folder,
      userId: req.user.id
    })

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    })

  } catch (error) {
    console.error('Erreur config Cloudinary signed:', error)
    res.status(500).json({ 
      error: 'Erreur génération signature Cloudinary',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
})