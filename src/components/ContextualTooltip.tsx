import { useState, useRef, useEffect, ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  className?: string
  disabled?: boolean
  theme?: 'dark' | 'light' | 'cosmic'
  showArrow?: boolean
  maxWidth?: number
  children: ReactNode
}

export default function ContextualTooltip({
  content,
  position = 'auto',
  trigger = 'hover',
  delay = 300,
  className = '',
  disabled = false,
  theme = 'cosmic',
  showArrow = true,
  maxWidth = 300,
  children
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isVisible && position === 'auto') {
      calculateOptimalPosition()
    }
  }, [isVisible])

  const calculateOptimalPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const margin = 10

    // Vérifier si on peut afficher en haut
    if (triggerRect.top - tooltipRect.height - margin >= 0) {
      setActualPosition('top')
      return
    }

    // Vérifier si on peut afficher en bas
    if (triggerRect.bottom + tooltipRect.height + margin <= viewportHeight) {
      setActualPosition('bottom')
      return
    }

    // Vérifier si on peut afficher à droite
    if (triggerRect.right + tooltipRect.width + margin <= viewportWidth) {
      setActualPosition('right')
      return
    }

    // Vérifier si on peut afficher à gauche
    if (triggerRect.left - tooltipRect.width - margin >= 0) {
      setActualPosition('left')
      return
    }

    // Par défaut, afficher en bas
    setActualPosition('bottom')
  }

  const showTooltip = () => {
    if (disabled) return

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else {
      setIsVisible(true)
    }
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const toggleTooltip = () => {
    if (isVisible) {
      hideTooltip()
    } else {
      showTooltip()
    }
  }

  const getTooltipClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm rounded-lg transition-opacity duration-200 pointer-events-none'
    
    let themeClasses = ''
    switch (theme) {
      case 'cosmic':
        themeClasses = 'glass-card text-text-white border border-neon-pink/30'
        break
      case 'dark':
        themeClasses = 'bg-gray-800 text-white border border-gray-700'
        break
      case 'light':
        themeClasses = 'bg-white text-gray-800 border border-gray-200 shadow-lg'
        break
    }

    return `${baseClasses} ${themeClasses} ${className}`
  }

  const getArrowClasses = () => {
    if (!showArrow) return ''

    const baseClasses = 'absolute w-2 h-2 transform rotate-45'
    
    let themeClasses = ''
    switch (theme) {
      case 'cosmic':
        themeClasses = 'bg-cosmic-glass border-neon-pink/30'
        break
      case 'dark':
        themeClasses = 'bg-gray-800 border-gray-700'
        break
      case 'light':
        themeClasses = 'bg-white border-gray-200'
        break
    }

    let positionClasses = ''
    switch (actualPosition) {
      case 'top':
        positionClasses = 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r'
        break
      case 'bottom':
        positionClasses = 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l'
        break
      case 'left':
        positionClasses = 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-b'
        break
      case 'right':
        positionClasses = 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-t'
        break
    }

    return `${baseClasses} ${themeClasses} ${positionClasses}`
  }

  const getTooltipPosition = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    }
  }

  const getTriggerProps = () => {
    const props: any = {}

    if (trigger === 'hover') {
      props.onMouseEnter = showTooltip
      props.onMouseLeave = hideTooltip
    } else if (trigger === 'click') {
      props.onClick = toggleTooltip
    } else if (trigger === 'focus') {
      props.onFocus = showTooltip
      props.onBlur = hideTooltip
    }

    return props
  }

  // Gérer le clic en dehors pour fermer
  useEffect(() => {
    if (trigger === 'click' && isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current && 
          !triggerRef.current.contains(event.target as Node) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node)
        ) {
          hideTooltip()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [trigger, isVisible])

  return (
    <div ref={triggerRef} className="relative inline-block" {...getTriggerProps()}>
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${getTooltipClasses()} ${getTooltipPosition()}`}
          style={{ maxWidth: `${maxWidth}px` }}
          role="tooltip"
        >
          {content}
          {showArrow && <div className={getArrowClasses()} />}
        </div>
      )}
    </div>
  )
}

// Composant Tooltip avec contenu enrichi
interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title?: string
  description: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function RichTooltip({
  title,
  description,
  icon,
  action,
  ...tooltipProps
}: RichTooltipProps) {
  const content = (
    <div className="space-y-2">
      {(title || icon) && (
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          {title && (
            <h4 className="font-semibold text-sm">
              {title}
            </h4>
          )}
        </div>
      )}
      
      <p className="text-xs leading-relaxed opacity-90">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-neon-cyan hover:text-neon-pink transition-colors font-medium"
        >
          {action.label} →
        </button>
      )}
    </div>
  )

  return (
    <ContextualTooltip 
      content={content}
      maxWidth={250}
      {...tooltipProps}
    />
  )
}

// Hook pour gérer les tooltips intelligents
export function useSmartTooltips(enabled: boolean = true) {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(enabled)
  
  useEffect(() => {
    // Vérifier les préférences utilisateur
    const preference = localStorage.getItem('tooltips_enabled')
    if (preference !== null) {
      setTooltipsEnabled(JSON.parse(preference))
    }
  }, [])

  const toggleTooltips = () => {
    const newState = !tooltipsEnabled
    setTooltipsEnabled(newState)
    localStorage.setItem('tooltips_enabled', JSON.stringify(newState))
  }

  const disableTooltips = () => {
    setTooltipsEnabled(false)
    localStorage.setItem('tooltips_enabled', 'false')
  }

  return {
    tooltipsEnabled,
    toggleTooltips,
    disableTooltips
  }
}