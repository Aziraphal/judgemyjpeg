import { useState } from 'react'

export type AnalysisTone = 'professional' | 'roast'

interface ToneSelectorProps {
  selectedTone: AnalysisTone
  onToneChange: (tone: AnalysisTone) => void
}

export default function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toneOptions = {
    professional: {
      label: 'Mode Professionnel',
      icon: '👔',
      description: 'Analyse technique et constructive',
      color: 'border-neon-cyan/50 bg-neon-cyan/10',
      selectedColor: 'border-neon-cyan bg-neon-cyan/20'
    },
    roast: {
      label: 'Mode Cassant',
      icon: '🔥',
      description: 'Analyse brutalement honnête et fun',
      color: 'border-neon-pink/50 bg-neon-pink/10',
      selectedColor: 'border-neon-pink bg-neon-pink/20'
    }
  }

  return (
    <div className="glass-card p-6 mb-6 hover-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-white flex items-center">
          <span className="text-2xl mr-2">🎭</span>
          Choisissez le ton de l'analyse
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-neon-secondary text-sm"
        >
          {isExpanded ? '▼' : '▶'} Personnaliser
        </button>
      </div>

      {/* Sélection rapide */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.entries(toneOptions).map(([tone, config]) => (
          <button
            key={tone}
            onClick={() => onToneChange(tone as AnalysisTone)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
              selectedTone === tone 
                ? config.selectedColor 
                : config.color + ' hover:border-opacity-75'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{config.icon}</div>
              <div className="text-text-white font-semibold mb-1">{config.label}</div>
              <div className="text-text-muted text-xs">{config.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Exemples détaillés */}
      {isExpanded && (
        <div className="animate-fadeIn space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Exemple Professionnel */}
            <div className="glass-card p-4 border border-neon-cyan/30">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">👔</span>
                <span className="text-neon-cyan font-semibold">Mode Professionnel</span>
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
                  de la lumière... Techniquement parlant, +2 stops 
                  arrangeraient les choses. Le cadrage ? On dirait que 
                  l'appareil a eu le hoquet ! 📸💀"
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-text-muted text-sm">
              <span>💡</span>
              <span>Même analyse technique, même score - seul le style d'expression change !</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de sélection actuelle */}
      <div className="mt-4 p-3 rounded-lg bg-cosmic-glass border border-cosmic-glassborder">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{toneOptions[selectedTone].icon}</span>
            <div>
              <div className="text-text-white font-semibold">
                {toneOptions[selectedTone].label}
              </div>
              <div className="text-text-muted text-sm">
                {toneOptions[selectedTone].description}
              </div>
            </div>
          </div>
          <div className="text-neon-cyan text-sm font-semibold">
            ✓ Sélectionné
          </div>
        </div>
      </div>
    </div>
  )
}