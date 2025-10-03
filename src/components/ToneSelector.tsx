import { useState } from 'react'
import Link from 'next/link'
import * as Popover from '@radix-ui/react-popover'
import { useLanguage } from '@/contexts/LanguageContext'

export type AnalysisTone = 'professional' | 'roast' | 'learning'

interface ToneSelectorProps {
  selectedTone: AnalysisTone
  onToneChange: (tone: AnalysisTone) => void
}

export default function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useLanguage()

  const toneOptions = {
    professional: {
      label: t.toneSelector.professional.label,
      labelMobile: t.toneSelector.professional.labelMobile,
      icon: '👔',
      description: t.toneSelector.professional.description,
      color: 'border-neon-cyan/50 bg-neon-cyan/10',
      selectedColor: 'border-neon-cyan bg-neon-cyan/20',
      example: t.toneSelector.professional.example,
      exampleText: t.toneSelector.professional.exampleText
    },
    roast: {
      label: t.toneSelector.roast.label,
      labelMobile: t.toneSelector.roast.labelMobile,
      icon: '🔥',
      description: t.toneSelector.roast.description,
      color: 'border-neon-pink/50 bg-neon-pink/10',
      selectedColor: 'border-neon-pink bg-neon-pink/20',
      example: t.toneSelector.roast.example,
      exampleText: t.toneSelector.roast.exampleText
    },
    learning: {
      label: t.toneSelector.learning.label,
      labelMobile: t.toneSelector.learning.labelMobile,
      icon: '📚',
      description: t.toneSelector.learning.description,
      color: 'border-green-400/50 bg-green-400/10',
      selectedColor: 'border-green-400 bg-green-400/20',
      example: t.toneSelector.learning.example,
      exampleText: t.toneSelector.learning.exampleText
    }
  }

  return (
    <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 hover-glow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-text-white flex items-center">
          <span className="text-xl sm:text-2xl mr-2">🎭</span>
          <span className="hidden sm:inline">{t.toneSelector.title}</span>
          <span className="sm:hidden">{t.toneSelector.titleMobile}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                className="btn-neon-secondary text-xs sm:text-sm px-2 sm:px-3 flex items-center space-x-1 hover:scale-105 transition-transform"
                title={t.toneSelector.help}
              >
                <span>❓</span>
                <span className="hidden sm:inline">{t.toneSelector.help}</span>
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
                    <span>{t.toneSelector.glossary}</span>
                  </Link>
                  <a
                    href="/faq"
                    target="_blank"
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-text-white hover:bg-cosmic-glassborder rounded transition-colors"
                  >
                    <span>❓</span>
                    <span>{t.toneSelector.faq}</span>
                  </a>
                  <a
                    href="/contact"
                    target="_blank"
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-text-white hover:bg-cosmic-glassborder rounded transition-colors"
                  >
                    <span>💌</span>
                    <span>{t.toneSelector.contact}</span>
                  </a>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-neon-secondary text-xs sm:text-sm px-2 sm:px-3"
          >
            {isExpanded ? '▼' : '▶'} <span className="hidden sm:inline">{t.toneSelector.customize}</span>
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
                <span className="sm:hidden">{config.labelMobile}</span>
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
                <span className="text-neon-cyan font-semibold">{toneOptions.professional.label}</span>
              </div>
              <div className="text-text-gray text-sm space-y-2">
                <p><strong>{toneOptions.professional.example}</strong></p>
                <p className="italic">
                  "{toneOptions.professional.exampleText}"
                </p>
              </div>
            </div>

            {/* Exemple Cassant */}
            <div className="glass-card p-4 border border-neon-pink/30">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">🔥</span>
                <span className="text-neon-pink font-semibold">{toneOptions.roast.label}</span>
              </div>
              <div className="text-text-gray text-sm space-y-2">
                <p><strong>{toneOptions.roast.example}</strong></p>
                <p className="italic">
                  "{toneOptions.roast.exampleText}"
                </p>
              </div>
            </div>

            {/* Exemple Apprentissage */}
            <div className="glass-card p-4 border border-green-400/30">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">📚</span>
                <span className="text-green-400 font-semibold">{toneOptions.learning.label}</span>
              </div>
              <div className="text-text-gray text-sm space-y-2">
                <p><strong>{toneOptions.learning.example}</strong></p>
                <p className="italic">
                  "{toneOptions.learning.exampleText}"
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
            ✓ <span className="hidden sm:inline">{t.toneSelector.selected}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
