import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

interface FeedbackButtonProps {
  variant?: 'floating' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FeedbackButton({ 
  variant = 'floating', 
  size = 'md',
  className = ''
}: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg'
  }

  const variantClasses = {
    floating: `
      fixed bottom-6 right-6 z-40 
      bg-gradient-to-r from-neon-pink to-neon-cyan 
      rounded-full shadow-lg 
      hover:scale-110 hover:shadow-xl
      transition-all duration-300
      border-2 border-transparent hover:border-white/20
    `,
    inline: `
      btn-neon-secondary
      inline-flex items-center space-x-2
    `
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          ${variantClasses[variant]}
          ${variant === 'floating' ? sizeClasses[size] : ''}
          ${className}
          flex items-center justify-center
          text-white font-semibold
          hover-glow
        `}
        title="Donnez votre avis sur JudgeMyJPEG"
        aria-label="Ouvrir le formulaire de feedback"
      >
        {variant === 'floating' ? (
          <span className="text-xl">💬</span>
        ) : (
          <>
            <span className="text-lg">💬</span>
            <span>Donner son avis</span>
          </>
        )}
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}