import Image, { ImageProps } from 'next/image'
import { useState, useEffect, useRef } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  priority?: boolean
  lazy?: boolean
  placeholder?: 'blur' | 'empty'
  className?: string
  fallbackSrc?: string
  onLoadComplete?: () => void
  errorFallback?: React.ReactNode
}

// Placeholder blur data URL générique
const BLUR_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(
  `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(59,7,100);stop-opacity:0.5" />
        <stop offset="50%" style="stop-color:rgb(103,58,183);stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:rgb(139,69,19);stop-opacity:0.1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#grad)" />
    <circle cx="50" cy="50" r="20" fill="rgba(255,255,255,0.1)" />
  </svg>`
).toString('base64')}`

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  lazy = true,
  placeholder = 'blur',
  className = '',
  fallbackSrc,
  onLoadComplete,
  errorFallback,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Reset état si src change
  useEffect(() => {
    setImageError(false)
    setIsLoading(true)
    setCurrentSrc(src)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoadComplete?.()
  }

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setImageError(false)
      setIsLoading(true)
    }
  }

  // Si erreur et pas de fallback, afficher composant d'erreur
  if (imageError && (!fallbackSrc || currentSrc === fallbackSrc)) {
    return (
      errorFallback || (
        <div className={`flex items-center justify-center bg-cosmic-glass border border-cosmic-glassborder rounded-lg ${className}`}>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-text-muted text-sm">Image non disponible</div>
          </div>
        </div>
      )
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? BLUR_DATA_URL : undefined}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-75' : 'opacity-100'
        }`}
        {...props}
      />
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-cosmic-glass/50 backdrop-blur-sm">
          <div className="spinner-neon w-6 h-6"></div>
        </div>
      )}
    </div>
  )
}

// Hook pour intersection observer (lazy loading avancé)
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
}

// Composant wrapper pour lazy loading avancé
interface LazyImageProps extends OptimizedImageProps {
  rootMargin?: string
  threshold?: number
}

export function LazyImage({
  rootMargin = '100px',
  threshold = 0.1,
  ...imageProps
}: LazyImageProps) {
  const imageRef = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(imageRef, {
    rootMargin,
    threshold
  })
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (isInView && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isInView, shouldLoad])

  return (
    <div ref={imageRef} className={imageProps.className}>
      {shouldLoad ? (
        <OptimizedImage {...imageProps} />
      ) : (
        <div className="w-full h-full bg-cosmic-glass border border-cosmic-glassborder rounded-lg flex items-center justify-center">
          <div className="text-text-muted text-sm">Chargement...</div>
        </div>
      )}
    </div>
  )
}