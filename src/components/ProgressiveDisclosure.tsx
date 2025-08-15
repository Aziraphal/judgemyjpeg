import { useState, useEffect, ReactNode } from 'react'

interface ProgressiveDisclosureProps {
  children: ReactNode
  trigger: ReactNode
  level?: 'beginner' | 'intermediate' | 'advanced'
  title?: string
  description?: string
  defaultOpen?: boolean
  disabled?: boolean
  onToggle?: (isOpen: boolean) => void
  className?: string
  animationDuration?: number
}

export default function ProgressiveDisclosure({
  children,
  trigger,
  level = 'intermediate',
  title,
  description,
  defaultOpen = false,
  disabled = false,
  onToggle,
  className = '',
  animationDuration = 300
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [shouldRender, setShouldRender] = useState(defaultOpen)
  const [height, setHeight] = useState(defaultOpen ? 'auto' : '0px')

  const toggle = () => {
    if (disabled) return

    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)

    if (newState) {
      setShouldRender(true)
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Délai pour permettre le rendu avant l'animation
      setTimeout(() => {
        setHeight('auto')
      }, 10)
    } else {
      setHeight('0px')
      // Délai pour l'animation avant de ne plus rendre
      setTimeout(() => {
        setShouldRender(false)
      }, animationDuration)
    }
  }, [isOpen, animationDuration])

  const getLevelConfig = () => {
    switch (level) {
      case 'beginner':
        return {
          icon: '🌱',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30'
        }
      case 'intermediate':
        return {
          icon: '⚡',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30'
        }
      case 'advanced':
        return {
          icon: '🚀',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        }
    }
  }

  const levelConfig = getLevelConfig()

  return (
    <div className={`progressive-disclosure ${className}`}>
      {/* Trigger */}
      <button
        onClick={toggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-cosmic-glass/50 hover:border-neon-pink/50'
          }
          ${isOpen 
            ? 'bg-cosmic-glass border-neon-pink/50' 
            : 'bg-cosmic-glass/30 border-cosmic-glassborder'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          {/* Icône de niveau */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${levelConfig.bgColor} ${levelConfig.borderColor} border
          `}>
            <span className={levelConfig.color}>{levelConfig.icon}</span>
          </div>

          {/* Contenu du trigger */}
          <div className="flex-1 text-left">
            {typeof trigger === 'string' ? (
              <span className="text-text-white font-medium">{trigger}</span>
            ) : (
              trigger
            )}
            
            {title && (
              <div className="text-sm text-text-white font-medium">{title}</div>
            )}
            
            {description && (
              <div className="text-xs text-text-muted mt-1">{description}</div>
            )}
          </div>
        </div>

        {/* Flèche */}
        <div className={`
          transform transition-transform duration-200 text-text-muted
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </button>

      {/* Contenu extensible */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          height: isOpen ? height : '0px',
          opacity: isOpen ? 1 : 0
        }}
      >
        {shouldRender && (
          <div className="pt-3">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour grouper des options par niveau
interface SkillLevelGroupProps {
  level: 'beginner' | 'intermediate' | 'advanced'
  children: ReactNode
  showBadge?: boolean
  className?: string
}

export function SkillLevelGroup({
  level,
  children,
  showBadge = true,
  className = ''
}: SkillLevelGroupProps) {
  const getLevelConfig = () => {
    switch (level) {
      case 'beginner':
        return {
          icon: '🌱',
          label: 'Débutant',
          description: 'Options de base pour commencer',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30'
        }
      case 'intermediate':
        return {
          icon: '⚡',
          label: 'Intermédiaire',
          description: 'Options avancées pour améliorer vos résultats',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30'
        }
      case 'advanced':
        return {
          icon: '🚀',
          label: 'Expert',
          description: 'Options pour les utilisateurs expérimentés',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        }
    }
  }

  const config = getLevelConfig()

  return (
    <div className={`skill-level-group ${className}`}>
      {showBadge && (
        <div className={`
          inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium mb-4
          ${config.bgColor} ${config.borderColor} ${config.color} border
        `}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
          <span className="text-text-muted">• {config.description}</span>
        </div>
      )}
      
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

// Hook pour gérer l'état de disclosure basé sur le niveau utilisateur
export function useProgressiveDisclosure(userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner') {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Auto-ouvrir les sections appropriées selon le niveau
    const autoOpen = new Set<string>()
    
    if (userLevel === 'intermediate' || userLevel === 'advanced') {
      autoOpen.add('intermediate')
    }
    
    if (userLevel === 'advanced') {
      autoOpen.add('advanced')
    }
    
    setOpenSections(autoOpen)
  }, [userLevel])

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const isOpen = (sectionId: string) => openSections.has(sectionId)

  const openAll = () => {
    setOpenSections(new Set(['beginner', 'intermediate', 'advanced']))
  }

  const closeAll = () => {
    setOpenSections(new Set())
  }

  return {
    isOpen,
    toggleSection,
    openAll,
    closeAll
  }
}

// Composant pour afficher les raccourcis selon le niveau
interface SmartShortcutsProps {
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  shortcuts: {
    [key: string]: {
      level: 'beginner' | 'intermediate' | 'advanced'
      keys: string[]
      description: string
    }
  }
}

export function SmartShortcuts({ userLevel, shortcuts }: SmartShortcutsProps) {
  const relevantShortcuts = Object.entries(shortcuts).filter(([_, shortcut]) => {
    const levels = ['beginner', 'intermediate', 'advanced']
    const userLevelIndex = levels.indexOf(userLevel)
    const shortcutLevelIndex = levels.indexOf(shortcut.level)
    return shortcutLevelIndex <= userLevelIndex
  })

  if (relevantShortcuts.length === 0) return null

  return (
    <div className="mt-4 p-3 bg-cosmic-glass/30 rounded-lg border border-cosmic-glassborder">
      <h4 className="text-sm font-semibold text-neon-cyan mb-3">
        💡 Raccourcis recommandés
      </h4>
      
      <div className="space-y-2">
        {relevantShortcuts.map(([id, shortcut]) => (
          <div key={id} className="flex items-center justify-between text-xs">
            <span className="text-text-gray">{shortcut.description}</span>
            <div className="flex space-x-1">
              {shortcut.keys.map((key, index) => (
                <span key={index} className="px-1.5 py-0.5 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white font-mono">
                  {key}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}