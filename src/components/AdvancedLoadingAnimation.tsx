/**
 * Composant d'animations de chargement avancées pour JudgeMyJPEG
 * Animations spectaculaires spécifiques à chaque mode d'analyse
 */

import { useEffect, useState } from 'react'

interface AdvancedLoadingAnimationProps {
  mode: 'roast' | 'expert' | 'general'
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

  if (mode === 'expert') {
    return (
      <div className={`relative ${getSizeClasses()} mx-auto`}>
        {/* Réseau de connexions techniques SVG */}
        <div className="absolute inset-0 opacity-60">
          <svg className="w-full h-full" viewBox="0 0 128 128">
            <defs>
              <linearGradient id="techGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8"/>
              </linearGradient>
              <linearGradient id="techGlow2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            
            {/* Lignes de connexion animées */}
            <path d="M20,64 Q40,30 64,64 T108,64" fill="none" stroke="url(#techGlow)" strokeWidth="2" className="animate-pulse">
              <animate attributeName="stroke-dasharray" values="0,200;100,100;200,0;0,200" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M64,20 Q90,40 64,64 T64,108" fill="none" stroke="url(#techGlow2)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '1s'}}>
              <animate attributeName="stroke-dasharray" values="0,180;90,90;180,0;0,180" dur="3.5s" repeatCount="indefinite"/>
            </path>
            <path d="M30,30 Q64,50 98,30 Q80,64 98,98 Q64,80 30,98 Q50,64 30,30" fill="none" stroke="url(#techGlow)" strokeWidth="1" className="animate-pulse" style={{animationDelay: '2s'}}>
              <animate attributeName="stroke-dasharray" values="0,300;150,150;300,0;0,300" dur="5s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>

        {/* Points de connexion clignotants */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${20 + (i % 4) * 20}%`,
                top: `${20 + Math.floor(i / 4) * 60}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
        
        {/* Engrenages imbriqués centraux */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div 
              className={`${getMainIconSize()} text-blue-400 filter drop-shadow-2xl animate-spin z-20`}
              style={{
                animationDuration: '4s',
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))'
              }}
            >⚙️</div>
            
            <div 
              className="absolute -top-2 -right-2 text-3xl text-cyan-400 animate-spin z-10" 
              style={{
                animationDuration: '3s', 
                animationDirection: 'reverse',
                filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.7))'
              }}
            >⚙️</div>
            
            <div 
              className="absolute -bottom-2 -left-2 text-2xl text-indigo-400 animate-spin z-10" 
              style={{
                animationDuration: '2s',
                filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.7))'
              }}
            >⚙️</div>
            
            {/* Microscope analyseur */}
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
              <div 
                className="text-4xl text-cyan-300 animate-bounce" 
                style={{
                  animationDuration: '2s',
                  filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))'
                }}
              >🔬</div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse" style={{animationDuration: '1.5s'}} />
              </div>
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