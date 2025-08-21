import { useState } from 'react'
import { glossaryData, categories, getRelatedTerms, GlossaryTerm } from '@/data/glossary'

interface GlossaryModalProps {
  isOpen: boolean
  onClose: () => void
  termId?: string
  searchTerm?: string
}

export default function GlossaryModal({ isOpen, onClose, termId, searchTerm }: GlossaryModalProps) {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null)

  // Trouve le terme à afficher
  const getTermToDisplay = () => {
    if (termId) {
      return glossaryData.find(t => t.id === termId) || null
    }
    if (searchTerm) {
      return glossaryData.find(
        t => t.term.toLowerCase() === searchTerm.toLowerCase() ||
             t.term.toLowerCase().includes(searchTerm.toLowerCase())
      ) || null
    }
    return null
  }

  const currentTerm = selectedTerm || getTermToDisplay()

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debutant': return 'text-green-400'
      case 'intermediaire': return 'text-yellow-400'
      case 'avance': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'debutant': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediaire': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'avance': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl font-bold text-text-white">
                {currentTerm ? 'Définition' : 'Glossaire photographique'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-white text-2xl hover:scale-110 transition-all"
            >
              ×
            </button>
          </div>

          {currentTerm ? (
            /* Affichage du terme sélectionné */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-text-white">
                  {currentTerm.term}
                </h3>
                <div className="flex items-center space-x-3">
                  <span className={`text-${categories[currentTerm.category].color} text-xl`}>
                    {categories[currentTerm.category].icon}
                  </span>
                  <span className="text-text-muted text-sm">{categories[currentTerm.category].name}</span>
                  <span className={`text-xs px-2 py-1 rounded border ${getLevelBadge(currentTerm.level)}`}>
                    {currentTerm.level}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-text-gray text-lg leading-relaxed">
                  {currentTerm.definition}
                </p>
              </div>
              
              {currentTerm.example && (
                <div className="bg-cosmic-glass p-4 rounded-lg mb-6">
                  <div className="text-sm text-text-muted mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Exemple pratique :
                  </div>
                  <div className="text-text-white italic">
                    "{currentTerm.example}"
                  </div>
                </div>
              )}
              
              {currentTerm.relatedTerms && currentTerm.relatedTerms.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-text-white mb-3 flex items-center">
                    <span className="mr-2">🔗</span>
                    Termes connexes
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {getRelatedTerms(currentTerm.id).slice(0, 4).map(related => (
                      <button
                        key={related.id}
                        onClick={() => setSelectedTerm(related)}
                        className="text-left p-3 bg-cosmic-glass rounded-lg hover:bg-cosmic-glassborder transition-all hover:scale-105"
                      >
                        <div className="font-medium text-neon-cyan text-sm">{related.term}</div>
                        <div className="text-xs text-text-muted line-clamp-2 mt-1">
                          {related.definition}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-cosmic-glassborder">
                <button
                  onClick={onClose}
                  className="btn-neon-secondary text-sm"
                >
                  ← Retour à l'analyse
                </button>
                <a
                  href="/glossaire"
                  target="_blank"
                  className="btn-neon-pink text-sm flex items-center space-x-2"
                >
                  <span>📚</span>
                  <span>Glossaire complet</span>
                </a>
              </div>
            </div>
          ) : (
            /* Vue par défaut si aucun terme */
            <div className="text-center">
              <div className="mb-6">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-xl font-semibold text-text-white mb-2">
                  Terme non trouvé
                </h3>
                <p className="text-text-muted">
                  {searchTerm ? `"${searchTerm}" n'est pas dans notre glossaire` : 'Aucun terme sélectionné'}
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={onClose}
                  className="btn-neon-secondary"
                >
                  Fermer
                </button>
                <a
                  href="/glossaire"
                  target="_blank"
                  className="btn-neon-pink flex items-center space-x-2"
                >
                  <span>📚</span>
                  <span>Parcourir le glossaire</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}