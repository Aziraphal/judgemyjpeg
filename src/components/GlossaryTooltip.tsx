import { useState } from 'react'
import { glossaryData } from '@/data/glossary'

interface GlossaryTooltipProps {
  term: string
  children: React.ReactNode
  className?: string
}

export default function GlossaryTooltip({ term, children, className = '' }: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Recherche du terme dans le glossaire (insensible à la casse)
  const glossaryTerm = glossaryData.find(
    t => t.term.toLowerCase() === term.toLowerCase() ||
         t.term.toLowerCase().includes(term.toLowerCase())
  )

  if (!glossaryTerm) {
    // Si le terme n'existe pas dans le glossaire, retourne le children sans tooltip
    return <>{children}</>
  }

  return (
    <div className="relative inline-block">
      <span
        className={`cursor-help border-b border-dotted border-neon-cyan text-neon-cyan hover:text-neon-pink transition-colors ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="glass-card p-4 max-w-sm border border-cosmic-glassborder shadow-xl">
            <div className="text-sm font-semibold text-text-white mb-2">
              {glossaryTerm.term}
            </div>
            <div className="text-xs text-text-gray mb-2">
              {glossaryTerm.definition}
            </div>
            {glossaryTerm.example && (
              <div className="text-xs text-text-muted italic">
                Ex: {glossaryTerm.example}
              </div>
            )}
            {/* Petite flèche */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-cosmic-glass"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook pour transformer automatiquement le texte avec des tooltips
export function useGlossaryText(text: string): React.ReactNode {
  if (!text) return text

  // Liste des termes à détecter (triés par longueur décroissante pour éviter les conflits)
  const termsToDetect = glossaryData
    .map(t => t.term)
    .sort((a, b) => b.length - a.length)

  let result: React.ReactNode = text
  
  termsToDetect.forEach((term, index) => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    
    if (typeof result === 'string' && regex.test(result)) {
      const parts = result.split(regex)
      const matches = result.match(regex) || []
      
      const newResult: React.ReactNode[] = []
      parts.forEach((part, i) => {
        newResult.push(part)
        if (matches[i]) {
          newResult.push(
            <GlossaryTooltip key={`${term}-${i}`} term={term}>
              {matches[i]}
            </GlossaryTooltip>
          )
        }
      })
      result = newResult
    }
  })

  return result
}