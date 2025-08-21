import { glossaryData } from '@/data/glossary'
import * as Popover from '@radix-ui/react-popover'

interface GlossaryTooltipProps {
  term: string
  children: React.ReactNode
}

export default function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  // Trouve la définition du terme
  const glossaryTerm = glossaryData.find(
    t => t.term.toLowerCase() === term.toLowerCase() ||
         t.term.toLowerCase().includes(term.toLowerCase())
  )

  if (!glossaryTerm) {
    return <>{children}</>
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debutant': return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'intermediaire': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'avance': return 'text-red-400 bg-red-500/10 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className="z-50 max-w-sm p-4 bg-cosmic-dark border border-cosmic-glassborder rounded-lg shadow-xl backdrop-blur-lg"
          sideOffset={8}
          align="start"
          collisionPadding={16}
        >
          {/* Header avec terme et niveau */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-white text-lg">
              {glossaryTerm.term}
            </h3>
            <span className={`text-xs px-2 py-1 rounded border ${getLevelColor(glossaryTerm.level)}`}>
              {glossaryTerm.level}
            </span>
          </div>

          {/* Définition principale */}
          <p className="text-text-gray text-sm leading-relaxed mb-3">
            {glossaryTerm.definition}
          </p>

          {/* Exemple si disponible */}
          {glossaryTerm.example && (
            <div className="bg-cosmic-glass p-3 rounded-lg mb-3">
              <div className="text-xs text-text-muted mb-1 flex items-center">
                <span className="mr-1">💡</span>
                Exemple :
              </div>
              <div className="text-text-white text-sm italic">
                "{glossaryTerm.example}"
              </div>
            </div>
          )}

          {/* Footer avec actions */}
          <div className="flex items-center justify-between pt-2 border-t border-cosmic-glassborder">
            <span className="text-xs text-text-muted capitalize">
              {glossaryTerm.category}
            </span>
            <a
              href="/glossaire"
              target="_blank"
              className="text-xs text-neon-cyan hover:text-neon-pink transition-colors flex items-center space-x-1"
            >
              <span>📚</span>
              <span>Voir plus</span>
            </a>
          </div>

          {/* Flèche du popover */}
          <Popover.Arrow className="fill-cosmic-dark" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}