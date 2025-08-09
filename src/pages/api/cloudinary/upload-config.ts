import type { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = 'photo-judge'
    const transformation = 'w_1200,h_1200,c_limit,q_auto'
    
    // Créer la signature pour l'upload sécurisé
    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
      transformation: transformation
    }
    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      transformation
    })

  } catch (error) {
    console.error('Erreur config upload Cloudinary:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})