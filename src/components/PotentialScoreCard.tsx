import { useState } from 'react'

interface Improvement {
  impact: string
  description: string
  difficulty: 'facile' | 'moyen' | 'difficile'
  scoreGain: number
}

interface PotentialScoreCardProps {
  currentScore: number
  potentialScore: number
  improvements: Improvement[]
}

export default function PotentialScoreCard({ 
  currentScore, 
  potentialScore, 
  improvements 
}: PotentialScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const scoreGain = potentialScore - currentScore
  const difficultyColors = {
    facile: 'text-green-400',
    moyen: 'text-yellow-400', 
    difficile: 'text-red-400'
  }
  
  const difficultyLabels = {
    facile: '🟢 Facile',
    moyen: '🟡 Moyen',
    difficile: '🔴 Difficile'
  }

  return (
    <div className="glass-card p-6 hover-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-text-white flex items-center">
          <span className="text-2xl mr-2">🎯</span>
          Score Potentiel
        </h3>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-neon-cyan">
            {potentialScore}/100
          </div>
          <div className="text-sm text-text-muted">
            +{scoreGain} points
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-gray">Score actuel</span>
          <span className="text-text-white font-semibold">{currentScore}/100</span>
        </div>
        
        <div className="w-full bg-cosmic-glass rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-neon-pink to-neon-cyan h-3 rounded-full transition-all duration-1000"
            style={{ width: `${currentScore}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Avec améliorations</span>
          <span className="text-neon-cyan font-semibold">{potentialScore}/100</span>
        </div>
        
        <div className="w-full bg-cosmic-glass rounded-full h-2 mt-1">
          <div 
            className="bg-gradient-to-r from-neon-cyan to-neon-pink h-2 rounded-full transition-all duration-1000 opacity-60"
            style={{ width: `${potentialScore}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-neon-secondary text-sm"
        >
          {showDetails ? '▼' : '▶'} Voir les améliorations ({improvements.length})
        </button>
      </div>

      {showDetails && (
        <div className="space-y-3 animate-fadeIn">
          {improvements.map((improvement, index) => (
            <div key={index} className="glass-card p-4 hover:bg-cosmic-glassborder transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-text-white font-semibold flex items-center">
                  <span className="text-neon-pink mr-2">+{improvement.scoreGain}</span>
                  {improvement.impact}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full bg-cosmic-glass ${difficultyColors[improvement.difficulty]}`}>
                  {difficultyLabels[improvement.difficulty]}
                </span>
              </div>
              
              <p className="text-text-gray text-sm leading-relaxed">
                {improvement.description}
              </p>
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-neon-cyan">💡</span>
              <span className="text-neon-cyan font-semibold">Objectif</span>
            </div>
            <p className="text-text-gray text-sm">
              En appliquant ces {improvements.length} améliorations, votre photo pourrait gagner{' '}
              <span className="text-neon-cyan font-semibold">+{scoreGain} points</span> et atteindre{' '}
              <span className="text-neon-pink font-semibold">{potentialScore}/100</span> !
            </p>
          </div>
        </div>
      )}
    </div>
  )
}