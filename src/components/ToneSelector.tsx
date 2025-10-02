import { useState } from 'react'
import Link from 'next/link'
import * as Popover from '@radix-ui/react-popover'

export type AnalysisTone = 'professional' | 'roast' | 'learning'

interface ToneSelectorProps {
  selectedTone: AnalysisTone
  onToneChange: (tone: AnalysisTone) => void
}

export default function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toneOptions = {
    professional: {
      label: 'Mode Pro',
      labelMobile: 'Pro',
      icon: '👔',
      description: 'Analyse technique et constructive',
      tooltip: 'Analyse professionnelle focalisée sur les aspects techniques : composition, exposition, netteté, etc.',
      color: 'border-neon-cyan/50 bg-neon-cyan/10',
      selectedColor: 'border-neon-cyan bg-neon-cyan/20'
    },
    roast: {
      label: 'Mode Cassant',
      labelMobile: 'Cassant',
      icon: '🔥',
      description: 'Analyse brutalement honnête et fun',
      tooltip: 'Mode humoristique qui révèle les défauts avec humour tout en restant constructif',
      color: 'border-neon-pink/50 bg-neon-pink/10',
      selectedColor: 'border-neon-pink bg-neon-pink/20'
    },
    learning: {
      label: 'Mode Apprentissage',
      labelMobile: 'Formation',
      icon: '📚',
      description: 'Formation complète et pédagogique',
      tooltip: 'Analyse détaillée avec explications du pourquoi, conseils pratiques et exercices pour progresser',
      color: 'border-green-400/50 bg-green-400/10',
      selectedColor: 'border-green-400 bg-green-400/20'
    }
  }

  return (
    <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 hover-glow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-text-white flex items-center">
          <span className="text-xl sm:text-2xl mr-2">🎭</span>
          <span className="hidden sm:inline">Choisissez le ton de l'analyse</span>
          <span className="sm:hidden">Ton d'analyse</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className="btn-neon-secondary text-xs sm:text-sm px-2 sm:px-3 flex items-center space-x-1 hover:scale-105 transition-transform"
                title="Aide et ressources"
              >
                <span>❓</span>
                <span className="hidden sm:inline">Aide</span>
              </button>
            </Popover.Trigger>
            
            {/* Menu dropdown avec Popover */}
            <Popover.Portal>
              <Popover.Content
                className="z-50 w-48 bg-cosmic-dark border border-cosmic-glassborder rounded-lg shadow-xl backdrop-blur-lg"
                sideOffset={8}
                align="end"
                collisionPadding={16}
              >
                <div className="p-2">
                  <Link 
                    href="/glossaire"
                    target="_blank"
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-text-white hover:bg-cosmic-glassborder rounded transition-colors"
                  >
                    <span>📚</span>
                    <span>Glossaire photographique</span>
                  </Link>
                  <a 
                    href="/faq"
                    target="_blank"
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-text-white hover:bg-cosmic-glassborder rounded transition-colors"
                  >
                    <span>❓</span>
                    <span>Questions fréquentes</span>
                  </a>
                  <a 
                    href="/contact"
                    target="_blank"
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-text-white hover:bg-cosmic-glassborder rounded transition-colors"
                  >
                    <span>💌</span>
                    <span>Nous contacter</span>
                  </a>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-neon-secondary text-xs sm:text-sm px-2 sm:px-3"
          >
            {isExpanded ? '▼' : '▶'} <span className="hidden sm:inline">Personnaliser</span>
          </button>
        </div>
      </div>

      {/* Sélection rapide */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
        {Object.entries(toneOptions).map(([tone, config]) => (
          <button
            key={tone}
            onClick={() => onToneChange(tone as AnalysisTone)}
            className={`p-2 sm:p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 w-full ${
              selectedTone === tone
                ? config.selectedColor
                : config.color + ' hover:border-opacity-75'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{config.icon}</div>
              <div className="text-text-white font-semibold mb-1 text-xs sm:text-base">
                <span className="sm:hidden">{config.labelMobile || config.label}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </div>
              <div className="text-text-muted text-xs hidden sm:block">{config.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Exemples détaillés */}
      {isExpanded && (
        <div className="animate-fadeIn space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Exemple Professionnel */}
            <div className="glass-card p-4 border border-neon-cyan/30">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">👔</span>
                <span className="text-neon-cyan font-semibold">Mode Pro</span>
              </div>
              <div className="text-text-gray text-sm space-y-2">
                <p><strong>Exemple :</strong></p>
                <p className="italic">
                  "Excellente composition selon la règle des tiers. 
                  L'exposition pourrait être améliorée de +1 stop. 
                  Très bon travail sur la profondeur de champ."
                </p>
              </div>
            </div>

            {/* Exemple Cassant */}
            <div className="glass-card p-4 border border-neon-pink/30">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">🔥</span>
                <span className="text-neon-pink font-semibold">Mode Cassant</span>
              </div>
              <div className="text-text-gray text-sm space-y-2">
                <p><strong>Exemple :</strong></p>
                <p className="italic">
                  "Cette exposition ressemble à un vampire qui a peur 
                  de la lumière... +2 stops arrangeraient les choses. 
                  Le cadrage ? L'appareil a eu le hoquet ! 📸💀"
                </p>
              </div>
            </div>

            {/* Exemple Apprentissage */}
            <div className="glass-card p-4 border border-green-400/30">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">📚</span>
                <span className="text-green-400 font-semibold">Mode Apprentissage</span>
              </div>
              <div className="text-text-gray text-sm space-y-2">
                <p><strong>Exemple :</strong></p>
                <p className="italic">
                  "Excellente composition ! Voici pourquoi : la règle des tiers 
                  guide l'œil. Pour progresser, essaie f/8 pour plus de netteté. 
                  Exercice : varie tes angles de vue demain."
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Indicateur de sélection actuelle */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-cosmic-glass border border-cosmic-glassborder">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xl sm:text-2xl">{toneOptions[selectedTone].icon}</span>
            <div>
              <div className="text-text-white font-semibold text-sm sm:text-base">
                {toneOptions[selectedTone].label}
              </div>
              <div className="text-text-muted text-xs sm:text-sm hidden sm:block">
                {toneOptions[selectedTone].description}
              </div>
            </div>
          </div>
          <div className="text-neon-cyan text-xs sm:text-sm font-semibold">
            ✓ <span className="hidden sm:inline">Sélectionné</span>
          </div>
        </div>
      </div>
    </div>
  )
}