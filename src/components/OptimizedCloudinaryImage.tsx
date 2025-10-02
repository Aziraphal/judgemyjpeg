/**
 * Composant d'image optimisé avec Cloudinary
 * - Lazy loading automatique
 * - Format WebP auto
 * - Responsive images
 * - Placeholder blur
 */

import { useState } from 'react'
import Image from 'next/image'

interface OptimizedCloudinaryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  fill?: boolean
}

export default function OptimizedCloudinaryImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  fill = false
}: OptimizedCloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Optimiser l'URL Cloudinary
  const optimizedSrc = src.includes('cloudinary.com')
    ? src.replace('/upload/', `/upload/f_auto,q_${quality},w_${width || 1200}/`)
    : src

  return (
    <div className={`relative ${className}`}>
      {fill ? (
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          className={`
            duration-700 ease-in-out
            ${isLoading ? 'scale-110 blur-lg grayscale' : 'scale-100 blur-0 grayscale-0'}
          `}
          onLoadingComplete={() => setIsLoading(false)}
          priority={priority}
          quality={quality}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          className={`
            duration-700 ease-in-out
            ${isLoading ? 'scale-110 blur-lg grayscale' : 'scale-100 blur-0 grayscale-0'}
          `}
          onLoadingComplete={() => setIsLoading(false)}
          priority={priority}
          quality={quality}
        />
      )}
    </div>
  )
}

/**
 * Hook pour générer une URL Cloudinary optimisée
 */
export function useCloudinaryUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  } = {}
): string {
  if (!url.includes('cloudinary.com')) return url

  const {
    width = 1200,
    height,
    quality = 80,
    format = 'auto',
    crop = 'scale'
  } = options

  let transforms = `f_${format},q_${quality},c_${crop}`

  if (width) transforms += `,w_${width}`
  if (height) transforms += `,h_${height}`

  return url.replace('/upload/', `/upload/${transforms}/`)
}
