import { PhotoAnalysis, AnalysisTone } from '@/services/openai'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'
import AddToCollectionModal from '@/components/AddToCollectionModal'
import PotentialScoreCard from '@/components/PotentialScoreCard'
import SocialShare from '@/components/SocialShare'
import { useState } from 'react'

interface AnalysisResultProps {
  photo: {
    id: string
    url: string
    filename: string
    createdAt: string
  }
  analysis: PhotoAnalysis
  tone?: AnalysisTone
}

export default function AnalysisResult({ photo, analysis, tone = 'professional' }: AnalysisResultProps) {
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  
  const getAIPersonality = (score: number) => {
    if (score <= 25) return { name: 'Chef Militaire', emoji: '🪖', color: 'text-red-500' }
    if (score <= 50) return { name: 'Chef Italien', emoji: '🇮🇹', color: 'text-orange-400' }
    if (score <= 75) return { name: 'Juge TV Réalité', emoji: '📺', color: 'text-purple-400' }
    return { name: 'Chef Français', emoji: '🇫🇷', color: 'text-green-400' }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neon-cyan'
    if (score >= 60) return 'text-yellow-400'
    return 'text-neon-pink'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10'
    if (score >= 60) return 'bg-gradient-to-r from-yellow-400/20 to-yellow-400/10'
    return 'bg-gradient-to-r from-neon-pink/20 to-neon-pink/10'
  }

  const getScoreBorder = (score: number) => {
    if (score >= 80) return 'border-neon-cyan/50'
    if (score >= 60) return 'border-yellow-400/50'
    return 'border-neon-pink/50'
  }

  // Fonction pour obtenir les liens selon la région et stratégie
  const getToolLinks = () => {
    // Détection simple du pays via langue du navigateur
    const locale = navigator.language || 'en-US'
    const country = locale.includes('fr') ? 'fr' : 'us'
    
    return {
      lightroom: country === 'fr' 
        ? 'https://www.adobe.com/fr/products/photoshop-lightroom.html?promoid=KLXLS'
        : 'https://www.adobe.com/products/photoshop-lightroom.html?promoid=KLXLS',
      photoshop: country === 'fr'
        ? 'https://www.adobe.com/fr/products/photoshop.html?promoid=KLXLS' 
        : 'https://www.adobe.com/products/photoshop.html?promoid=KLXLS',
      snapseed: 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed',
      canva: country === 'fr'
        ? 'https://www.canva.com/fr_fr/pro/'
        : 'https://www.canva.com/pro/',
      luminar: 'https://skylum.com/luminar?irclickid=photo-judge-reco'
    }
  }

  const toolLinks = getToolLinks()

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      {/* Floating decorative elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-1/2 -left-10 w-16 h-16 bg-glow-cyan rounded-full blur-lg opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Photo et Score */}
      <div className="glass-card p-8 hover-glow">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative group">
              <Image
                src={photo.url}
                alt={photo.filename}
                width={500}
                height={400}
                className="rounded-xl w-full h-auto object-cover neon-border group-hover:shadow-neon-cyan transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-text-white mb-2 text-glow">
                Analyse de{' '}
                <span className="text-neon-cyan">{photo.filename}</span>
              </h2>
              <p className="text-text-muted">
                {new Date(photo.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className={`inline-flex items-center px-6 py-3 rounded-full border ${getScoreBg(analysis.score)} ${getScoreBorder(analysis.score)} backdrop-blur-sm`}>
              <span className="text-text-white font-medium mr-3">Score global:</span>
              <span className={`text-3xl font-bold ${getScoreColor(analysis.score)} animate-pulse`}>
                {analysis.score}/100
              </span>
              <span className="ml-2 text-2xl">
                {analysis.score >= 80 ? '🏆' : analysis.score >= 60 ? '⭐' : '💪'}
              </span>
            </div>
            
            {/* Indicateur de personnalité - juste l'emoji subtil */}
            {tone === 'roast' && (
              <div className="glass-card p-3 border border-cosmic-glassborder/50">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs text-text-muted">Mode IA activé :</span>
                  <span className={`text-lg ${getAIPersonality(analysis.score).color}`}>
                    {getAIPersonality(analysis.score).emoji}
                  </span>
                </div>
              </div>
            )}
            
            <div className="glass-card p-4">
              <p className="text-text-gray text-sm leading-relaxed mb-4">
                <span className="text-neon-pink font-semibold">Intelligence Artificielle</span> a analysé votre photo selon des critères techniques et artistiques professionnels
              </p>
              
              {/* Actions */}
              <div className="flex space-x-3">
                <FavoriteButton
                  photoId={photo.id}
                  initialIsFavorite={false}
                  size="md"
                />
                <button
                  onClick={() => setIsCollectionModalOpen(true)}
                  className="btn-neon-secondary text-sm px-4 py-2 flex items-center space-x-2"
                >
                  <span>📁</span>
                  <span>Ajouter à collection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse Technique */}
      <div className="glass-card p-8 hover-glow">
        <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">🔧</span>
          <span className="text-neon-cyan">Analyse Technique</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(analysis.technical).map(([key, value]) => (
            <div key={key} className="glass-card p-6 hover:bg-cosmic-glassborder transition-all duration-300">
              <h4 className="font-bold text-text-white mb-3 capitalize flex items-center">
                <span className="w-2 h-2 bg-neon-pink rounded-full mr-2"></span>
                {key === 'composition' ? 'Composition' : 
                 key === 'lighting' ? 'Éclairage' :
                 key === 'focus' ? 'Mise au point' : 'Exposition'}
              </h4>
              <p className="text-text-gray leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse Artistique */}
      <div className="glass-card p-8 hover-glow">
        <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">🎨</span>
          <span className="text-neon-pink">Analyse Artistique</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(analysis.artistic).map(([key, value]) => (
            <div key={key} className="glass-card p-6 hover:bg-cosmic-glassborder transition-all duration-300">
              <h4 className="font-bold text-text-white mb-3 capitalize flex items-center">
                <span className="w-2 h-2 bg-neon-cyan rounded-full mr-2"></span>
                {key === 'creativity' ? 'Créativité' : 
                 key === 'emotion' ? 'Émotion' : 'Narration'}
              </h4>
              <p className="text-text-gray leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Score Potentiel */}
      {analysis.potentialScore && analysis.improvements && (
        <PotentialScoreCard 
          currentScore={analysis.score}
          potentialScore={analysis.potentialScore}
          improvements={analysis.improvements}
        />
      )}

      {/* Suggestions */}
      <div className="glass-card p-8 hover-glow">
        <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">💡</span>
          <span className="text-neon-cyan">Conseils d'amélioration</span>
        </h3>
        <ul className="space-y-4">
          {analysis.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start glass-card p-4 hover:bg-cosmic-glassborder transition-all duration-300">
              <span className="text-neon-pink mr-3 text-xl flex-shrink-0">✨</span>
              <span className="text-text-white leading-relaxed">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Outils recommandés */}
      <div className="glass-card p-8 hover-glow">
        <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">🛠️</span>
          <span className="text-neon-pink">Outils recommandés</span>
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analysis.toolRecommendations).map(([tool, recommendations]) => {
            const toolInfo = {
              lightroom: { 
                name: 'Adobe Lightroom', 
                badge: 'Professionnel', 
                color: 'bg-blue-500/20 text-blue-400',
                icon: '📸'
              },
              photoshop: { 
                name: 'Adobe Photoshop', 
                badge: 'Avancé', 
                color: 'bg-purple-500/20 text-purple-400',
                icon: '🎨'
              },
              snapseed: { 
                name: 'Snapseed', 
                badge: 'Gratuit', 
                color: 'bg-green-500/20 text-green-400',
                icon: '📱'
              },
              canva: { 
                name: 'Canva Pro', 
                badge: 'Facile', 
                color: 'bg-pink-500/20 text-pink-400',
                icon: '✨'
              },
              luminar: { 
                name: 'Luminar Neo', 
                badge: 'IA', 
                color: 'bg-cyan-500/20 text-cyan-400',
                icon: '🤖'
              }
            }
            
            const info = toolInfo[tool as keyof typeof toolInfo] || { 
              name: tool, 
              badge: 'Outil', 
              color: 'bg-gray-500/20 text-gray-400',
              icon: '🛠️'
            }
            
            return (
              <a
                key={tool}
                href={toolLinks[tool as keyof typeof toolLinks]}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 hover-glow group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{info.icon}</span>
                    <h4 className="font-bold text-text-white text-sm">{info.name}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${info.color}`}>
                    {info.badge}
                  </span>
                </div>
                
                <ul className="space-y-1 mb-3">
                  {recommendations?.map((rec, index) => (
                    <li key={index} className="text-text-gray flex items-start text-xs">
                      <span className="text-neon-cyan mr-1 flex-shrink-0 text-xs">▶</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-neon-pink group-hover:text-neon-cyan transition-colors duration-300 flex items-center justify-center">
                  <span>{tool === 'snapseed' ? '📱 Télécharger' : '🚀 Découvrir'}</span>
                  <span className="ml-1">→</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Partage social */}
      <SocialShare 
        photo={photo}
        analysis={analysis}
        tone={tone}
      />

      {/* Modal ajouter à collection */}
      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        photoId={photo.id}
        photoName={photo.filename}
      />
    </div>
  )
}