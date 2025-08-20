import { PhotoType, PHOTO_TYPES_CONFIG } from '@/types/analysis'
import { useState } from 'react'

interface PhotoTypeSelectorProps {
  selectedType: PhotoType
  onTypeChange: (type: PhotoType) => void
  disabled?: boolean
  className?: string
}

export default function PhotoTypeSelector({ 
  selectedType, 
  onTypeChange, 
  disabled = false, 
  className = '' 
}: PhotoTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedConfig = PHOTO_TYPES_CONFIG[selectedType]

  return (
    <div className={`relative ${className}`}>
      {/* Button principal */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between p-3 glass-card border border-cosmic-glassborder
          rounded-lg hover:shadow-neon-cyan transition-all duration-300 text-left
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-neon-cyan/50 cursor-pointer'}
        `}
        aria-label="Sélectionner le type de photo"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl" aria-hidden="true">
            {selectedConfig.emoji}
          </span>
          <div>
            <div className="text-text-white font-medium">
              {selectedConfig.name}
            </div>
            <div className="text-text-muted text-sm line-clamp-1">
              {selectedConfig.description}
            </div>
          </div>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant à côté */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu déroulant */}
          <div className="absolute z-20 w-full mt-2 bg-black border-2 border-white/20 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
            {/* En-tête informatif */}
            <div className="px-4 py-3 border-b border-white/10 bg-black">
              <p className="text-sm text-white font-bold">
                🎯 Sélectionnez le type pour une analyse IA spécialisée
              </p>
            </div>
            <div className="p-2 space-y-1">
              {Object.entries(PHOTO_TYPES_CONFIG).map(([key, config]) => {
                const isSelected = key === selectedType
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onTypeChange(key as PhotoType)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 text-left
                      ${isSelected 
                        ? 'bg-white text-black border-2 border-white shadow-lg' 
                        : 'bg-black text-white hover:bg-gray-800 border border-gray-700 hover:border-white/30'
                      }
                    `}
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">
                      {config.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-base ${isSelected ? 'text-black' : 'text-white'}`}>
                        {config.name}
                      </div>
                      <div className={`text-sm line-clamp-2 ${isSelected ? 'text-gray-700' : 'text-gray-300'}`}>
                        {config.description}
                      </div>
                      {/* Focus areas preview */}
                      <div className={`text-xs mt-1 ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                        {config.focusAreas.slice(0, 2).join(' • ')}
                        {config.focusAreas.length > 2 && '...'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Composant compact pour afficher le type sélectionné
export function PhotoTypeBadge({ photoType }: { photoType: PhotoType }) {
  const config = PHOTO_TYPES_CONFIG[photoType]
  
  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cosmic-glass border border-cosmic-glassborder rounded-full text-sm">
      <span className="text-lg" aria-hidden="true">{config.emoji}</span>
      <span className="text-text-white font-medium">{config.name}</span>
    </div>
  )
}