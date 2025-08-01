import { useState } from 'react'

interface FavoriteButtonProps {
  photoId: string
  initialIsFavorite: boolean
  onToggle?: (isFavorite: boolean) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function FavoriteButton({ 
  photoId, 
  initialIsFavorite, 
  onToggle,
  size = 'md' 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl'
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      const response = await fetch('/api/photos/favorite', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })

      if (response.ok) {
        const newIsFavorite = !isFavorite
        setIsFavorite(newIsFavorite)
        onToggle?.(newIsFavorite)
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full backdrop-blur-sm
        transition-all duration-300 hover:scale-110
        ${isFavorite 
          ? 'bg-neon-pink/20 border border-neon-pink/50 text-neon-pink shadow-neon-pink' 
          : 'bg-cosmic-glass border border-cosmic-glassborder text-text-muted hover:text-neon-pink hover:border-neon-pink/30'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isLoading ? (
        <div className="animate-spin text-sm">⟳</div>
      ) : (
        <span className={isFavorite ? 'animate-pulse' : ''}>
          {isFavorite ? '❤️' : '🤍'}
        </span>
      )}
    </button>
  )
}