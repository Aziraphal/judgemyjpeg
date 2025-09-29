/**
 * Composant d'animations de chargement avancées pour JudgeMyJPEG
 * Animations spectaculaires spécifiques à chaque mode d'analyse
 */

import { useEffect, useState } from 'react'

interface AdvancedLoadingAnimationProps {
  mode: 'roast' | 'learning' | 'general'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function AdvancedLoadingAnimation({ mode, size = 'lg' }: AdvancedLoadingAnimationProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  useEffect(() => {
    // Générer des particules aléatoires pour les animations
    const newParticles = Array.from({length: 12}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }))
    setParticles(newParticles)
  }, [])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16'
      case 'md': return 'w-24 h-24'  
      case 'lg': return 'w-32 h-32'
      case 'xl': return 'w-40 h-40'
      default: return 'w-32 h-32'
    }
  }

  const getMainIconSize = () => {
    switch (size) {
      case 'sm': return 'text-2xl'
      case 'md': return 'text-4xl'
      case 'lg': return 'text-6xl'
      case 'xl': return 'text-8xl'
      default: return 'text-6xl'
    }
  }

  if (mode === 'roast') {
    return (
      <div className={`relative ${getSizeClasses()} mx-auto`}>
        {/* Explosion de particules */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-red-500 to-orange-400 rounded-full animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
        
        {/* Vagues de choc concentriques */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping" style={{animationDuration: '2s'}} />
          <div className="absolute inset-2 border-2 border-orange-500/40 rounded-full animate-ping" style={{animationDuration: '1.8s', animationDelay: '0.3s'}} />
          <div className="absolute inset-4 border border-yellow-500/50 rounded-full animate-ping" style={{animationDuration: '1.6s', animationDelay: '0.6s'}} />
        </div>
        
        {/* Couteau central dramatique */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div 
              className={`${getMainIconSize()} filter drop-shadow-2xl animate-bounce z-20`}
              style={{
                animationDuration: '0.8s',
                filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.9))'
              }}
            >🔪</div>
            
            {/* Éclairs multiples */}
            <div className="absolute -top-6 -left-6 text-2xl animate-pulse z-10" style={{animationDelay: '0.2s', animationDuration: '0.6s'}}>⚡</div>
            <div className="absolute -top-4 -right-8 text-3xl animate-pulse z-10" style={{animationDelay: '0.4s', animationDuration: '0.8s'}}>💥</div>
            <div className="absolute -bottom-6 left-4 text-2xl animate-pulse z-10" style={{animationDelay: '0.6s', animationDuration: '0.7s'}}>🔥</div>
            <div className="absolute -bottom-4 -right-4 text-xl animate-pulse z-10" style={{animationDelay: '0.8s', animationDuration: '0.9s'}}>✨</div>
            <div className="absolute top-2 -left-10 text-lg animate-pulse z-10" style={{animationDelay: '1s', animationDuration: '1.1s'}}>💢</div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'learning') {
    return (
      <div className={`relative ${getSizeClasses()} mx-auto`}>
        {/* Cercles concentriques doux pour l'apprentissage */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 border-2 border-green-400/30 rounded-full animate-ping" style={{animationDuration: '3s'}} />
          <div className="absolute inset-6 border border-green-300/40 rounded-full animate-ping" style={{animationDuration: '2.5s', animationDelay: '0.7s'}} />
        </div>

        {/* Points éducatifs simplifiés qui pulsent doucement */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-green-400/70 rounded-full animate-pulse"
              style={{
                left: `${30 + (i * 20)}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: '2.5s'
              }}
            />
          ))}
        </div>
        
        {/* Livre central avec effet pédagogique */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Icône principale - livre */}
            <div 
              className={`${getMainIconSize()} text-green-400 filter drop-shadow-lg animate-bounce z-20`}
              style={{
                animationDuration: '2s',
                filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.6))'
              }}
            >📚</div>
            
            {/* Éléments éducatifs simplifiés */}
            <div 
              className="absolute -top-4 -left-3 text-sm text-blue-400/80 animate-pulse z-10" 
              style={{
                animationDuration: '3s',
                animationDelay: '0.5s'
              }}
            >💡</div>
            
            <div 
              className="absolute -bottom-3 -right-4 text-sm text-green-500/80 animate-pulse z-10" 
              style={{
                animationDuration: '3.5s',
                animationDelay: '1.2s'
              }}
            >✏️</div>
            
            <div 
              className="absolute top-1 -right-5 text-sm text-purple-400/80 animate-pulse z-10" 
              style={{
                animationDuration: '3.2s',
                animationDelay: '1.8s'
              }}
            >🎓</div>
          </div>
        </div>
      </div>
    )
  }


  // Mode général par défaut
  return (
    <div className={`relative ${getSizeClasses()} mx-auto`}>
      {/* Scanner holographique */}
      <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full">
        <div className="absolute inset-2 border border-cyan-300/50 rounded-full animate-ping" style={{animationDuration: '2s'}} />
        <div className="absolute inset-4 border border-cyan-200/70 rounded-full animate-ping" style={{animationDuration: '1.5s', animationDelay: '0.5s'}} />
      </div>

      {/* Lignes de scan */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce"
          style={{
            top: '20%',
            animationDuration: '1.5s'
          }}
        />
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-neon-pink to-transparent animate-bounce"
          style={{
            top: '50%',
            animationDelay: '0.5s',
            animationDuration: '1.5s'
          }}
        />
        <div 
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-bounce"
          style={{
            top: '80%',
            animationDelay: '1s',
            animationDuration: '1.5s'
          }}
        />
      </div>

      {/* Icône centrale */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`${getMainIconSize()} animate-pulse`}
          style={{
            animationDuration: '2s',
            filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.8))'
          }}
        >📸</div>
      </div>
    </div>
  )
}