import { useState } from 'react'
import { glossaryData } from '@/data/glossary'
import GlossaryModal from './GlossaryModal'
import GlossaryTooltip from './GlossaryTooltip'

interface SmartGlossaryTextProps {
  text: string
  className?: string
  mode?: 'professional' | 'artcritic' | 'roast'
}

export default function SmartGlossaryText({ text, className = '', mode = 'professional' }: SmartGlossaryTextProps) {
  const [highlightedTerms, setHighlightedTerms] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  // Liste des termes à détecter (triés par longueur décroissante pour éviter les conflits)
  const termsToDetect = glossaryData
    .map(t => ({
      term: t.term,
      id: t.id,
      variants: [
        t.term,
        t.term.toLowerCase(),
        // Variantes communes
        t.term === 'Règle des tiers' ? ['règle des tiers', 'tiers'] : [],
        t.term === 'Bokeh' ? ['bokeh'] : [],
        // t.term === 'Stop (exposition)' ? ['stops', '+1 stop', '-1 stop', '+2 stops', '-2 stops', '+3 stops', '-3 stops'] : [], // Désactivé
        t.term === 'Profondeur de champ' ? ['profondeur de champ', 'pdc'] : [],
        t.term === 'Balance des blancs' ? ['balance des blancs', 'balance blancs'] : [],
        t.term === 'ISO' ? ['ISO', 'iso'] : [],
        t.term === 'Ouverture (f/)' ? ['ouverture', 'f/', 'f/1.4', 'f/2.8', 'f/8'] : [],
        t.term === 'Focale' ? ['focale', 'mm', '35mm', '50mm', '85mm', '200mm'] : [],
        t.term === 'Histogramme' ? ['histogramme'] : [],
        t.term === 'Golden Hour' ? ['golden hour', 'heure dorée'] : [],
        t.term === 'Compression spatiale' ? ['compression spatiale', 'compression'] : [],
        t.term === 'Zone System' ? ['zone system', 'zones', 'ansel adams'] : [],
        t.term === 'Clipping' ? ['clipping', 'écrêtage'] : [],
        t.term === 'Grand angle' ? ['grand angle', 'grand-angle'] : [],
        t.term === 'Téléobjectif' ? ['téléobjectif', 'télé'] : []
      ].flat()
    }))
    .sort((a, b) => Math.max(...b.variants.map(v => v.length)) - Math.max(...a.variants.map(v => v.length)))

  // Fonction pour transformer le texte avec des liens cliquables
  const transformTextWithLinks = (inputText: string) => {
    let result = inputText
    const replacements: { original: string; replacement: JSX.Element; termId: string }[] = []

    termsToDetect.forEach(({ variants, id, term }) => {
      variants.forEach(variant => {
        if (variant.length < 3) return // Éviter les termes trop courts
        
        const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = result.match(regex)
        
        if (matches) {
          matches.forEach((match, index) => {
            const uniqueKey = `${id}-${variant}-${index}`
            replacements.push({
              original: match,
              termId: id,
              replacement: (
                <GlossaryTooltip key={uniqueKey} term={term}>
                  <span
                    className="inline-flex items-center space-x-1 text-neon-cyan hover:text-neon-pink transition-colors border-b border-dotted border-neon-cyan/50 hover:border-neon-pink/50 cursor-pointer"
                    title={`Voir la définition de "${term}"`}
                  >
                    <span className="break-words">{match}</span>
                    <span className="text-xs opacity-75 hidden sm:inline">🔍</span>
                  </span>
                </GlossaryTooltip>
              )
            })
          })
        }
      })
    })

    // Applique les remplacements (limité aux 10 premiers pour éviter la surcharge)
    const limitedReplacements = replacements.slice(0, 10)
    
    if (limitedReplacements.length === 0) {
      return <span className={className}>{inputText}</span>
    }

    // Divise le texte et insère les liens
    const parts: (string | JSX.Element)[] = []
    let currentText = inputText
    let currentIndex = 0

    limitedReplacements.forEach((replacement, i) => {
      const index = currentText.indexOf(replacement.original)
      if (index !== -1) {
        // Ajoute le texte avant le terme
        if (index > 0) {
          parts.push(currentText.substring(0, index))
        }
        
        // Ajoute le lien
        parts.push(replacement.replacement)
        
        // Continue avec le reste du texte
        currentText = currentText.substring(index + replacement.original.length)
        currentIndex++
      }
    })

    // Ajoute le reste du texte
    if (currentText) {
      parts.push(currentText)
    }

    return (
      <span className={className}>
        {parts.map((part, index) => (
          typeof part === 'string' ? part : <span key={index}>{part}</span>
        ))}
      </span>
    )
  }

  return (
    <div className="relative">
      {transformTextWithLinks(text)}
      
      {/* Indicateur discret si des termes sont détectés - Masqué pour éviter confusion */}
      {false && termsToDetect.some(({ variants }) => 
        variants.some(variant => text.toLowerCase().includes(variant.toLowerCase()))
      ) && (
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <span className="text-text-muted flex items-center space-x-1 flex-1">
            <span>💡</span>
            <span className="hidden sm:inline">Survolez les termes surlignés pour voir leur définition</span>
            <span className="sm:hidden">Touchez les mots bleus pour les définitions</span>
          </span>
          <button 
            onClick={() => setModalOpen(true)}
            className="text-neon-cyan hover:text-neon-pink transition-colors flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>📚</span>
            <span>Glossaire</span>
          </button>
        </div>
      )}

      {/* Modal pour les définitions */}
      <GlossaryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedTerm(null)
        }}
        searchTerm={selectedTerm || undefined}
      />
    </div>
  )
}

// Version simplifiée pour les titres et textes courts
export function SmartGlossaryInline({ text, className = '', mode = 'professional' }: SmartGlossaryTextProps) {
  const termsToDetect = ['règle des tiers', 'bokeh', 'stops', 'profondeur de champ', 'ISO', 'ouverture']
  
  const hasGlossaryTerms = termsToDetect.some(term => 
    text.toLowerCase().includes(term.toLowerCase())
  )

  if (!hasGlossaryTerms) {
    return <span className={className}>{text}</span>
  }

  return <SmartGlossaryText text={text} className={className} mode={mode} />
}