import { v2 as cloudinary } from 'cloudinary'
import { logger } from '@/lib/logger'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  format: string
  width: number
  height: number
}

export async function uploadPhoto(file: Buffer, filename: string): Promise<UploadResult> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'photo-judge',
          public_id: `${Date.now()}-${filename}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(file)
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    logger.error('Erreur upload Cloudinary:', error)
    throw new Error('Impossible d\'uploader la photo')
  }
}

export async function deletePhoto(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    logger.error('Erreur suppression Cloudinary:', error)
    throw new Error('Impossible de supprimer la photo')
  }
}

export function getOptimizedUrl(publicId: string, width?: number, height?: number): string {
  return cloudinary.url(publicId, {
    width: width || 800,
    height: height || 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  })
}