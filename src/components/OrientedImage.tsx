import Image from 'next/image'
import { getOrientationTransform } from '@/utils/exifExtractor'

interface OrientedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  orientation?: number
  style?: React.CSSProperties
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * Composant Image qui gère automatiquement l'orientation EXIF
 * Utilise la transformation CSS appropriée selon l'orientation EXIF
 */
export default function OrientedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  orientation,
  style = {},
  ...imageProps
}: OrientedImageProps) {
  // Calcule la transformation CSS selon l'orientation EXIF
  const orientationTransform = getOrientationTransform(orientation)
  
  // Combine les styles personnalisés avec la transformation d'orientation
  const finalStyle = {
    imageOrientation: 'from-image' as const,
    transform: orientationTransform,
    ...style
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={finalStyle}
      {...imageProps}
    />
  )
}