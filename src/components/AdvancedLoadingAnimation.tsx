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
        {/* Cadre doré vintage qui se forme */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 128 128">
            <defs>
              <linearGradient id="goldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.9"/>
                <stop offset="50%" stopColor="rgb(245, 158, 11)" stopOpacity="1"/>
                <stop offset="100%" stopColor="rgb(217, 119, 6)" stopOpacity="0.9"/>
              </linearGradient>
              <linearGradient id="goldFrame2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(217, 119, 6)" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="rgb(146, 64, 14)" stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            
            {/* Cadre extérieur qui se dessine progressivement */}
            <rect x="8" y="8" width="112" height="112" fill="none" stroke="url(#goldFrame)" strokeWidth="4" rx="2" className="animate-pulse">
              <animate attributeName="stroke-dasharray" values="0,400;200,200;400,0;400,0" dur="3s" repeatCount="indefinite"/>
            </rect>
            
            {/* Cadre intérieur décoratif */}
            <rect x="16" y="16" width="96" height="96" fill="none" stroke="url(#goldFrame2)" strokeWidth="2" rx="1" className="animate-pulse" style={{animationDelay: '0.5s'}}>
              <animate attributeName="stroke-dasharray" values="0,350;175,175;350,0;350,0" dur="2.5s" repeatCount="indefinite"/>
            </rect>
            
            {/* Ornements de coins */}
            <circle cx="20" cy="20" r="3" fill="url(#goldFrame)" className="animate-pulse" style={{animationDelay: '1s'}}/>
            <circle cx="108" cy="20" r="3" fill="url(#goldFrame)" className="animate-pulse" style={{animationDelay: '1.2s'}}/>
            <circle cx="20" cy="108" r="3" fill="url(#goldFrame)" className="animate-pulse" style={{animationDelay: '1.4s'}}/>
            <circle cx="108" cy="108" r="3" fill="url(#goldFrame)" className="animate-pulse" style={{animationDelay: '1.6s'}}/>
          </svg>
        </div>

        {/* Étoiles scintillantes autour du cadre */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 animate-pulse"
              style={{
                left: `${15 + (i % 3) * 35}%`,
                top: `${10 + Math.floor(i / 3) * 80}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: '1.8s',
                fontSize: i % 2 === 0 ? '12px' : '8px'
              }}
            >
              ✨
            </div>
          ))}
        </div>
        
        {/* Tableau central avec effet de mise en valeur */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Fond de tableau vintage */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-yellow-200/30 rounded border border-amber-300/40 animate-pulse"
              style={{
                width: '80px',
                height: '80px',
                margin: '-40px 0 0 -40px',
                animationDuration: '3s'
              }}
            />
            
            {/* Icône principale - palette d'artiste */}
            <div 
              className={`${getMainIconSize()} text-amber-400 filter drop-shadow-2xl animate-bounce z-20`}
              style={{
                animationDuration: '2s',
                filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.8))'
              }}
            >🖼️</div>
            
            {/* Accessoires artistiques qui gravitent */}
            <div 
              className="absolute -top-6 -left-4 text-2xl text-yellow-500 animate-spin z-10" 
              style={{
                animationDuration: '6s',
                filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.7))'
              }}
            >🎨</div>
            
            <div 
              className="absolute -bottom-4 -right-6 text-xl text-amber-600 animate-bounce z-10" 
              style={{
                animationDuration: '1.5s',
                animationDelay: '0.3s',
                filter: 'drop-shadow(0 0 10px rgba(217, 119, 6, 0.6))'
              }}
            >🖌️</div>
            
            <div 
              className="absolute top-2 -right-8 text-lg text-yellow-400 animate-pulse z-10" 
              style={{
                animationDuration: '2.2s',
                animationDelay: '0.8s'
              }}
            >🏛️</div>
            
            {/* Lumière de galerie */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div 
                className="w-12 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent animate-pulse opacity-60" 
                style={{animationDuration: '2.5s'}}
              />
              <div 
                className="w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-pulse opacity-80 mt-1" 
                style={{animationDuration: '2s', animationDelay: '0.5s'}}
              />
            </div>
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