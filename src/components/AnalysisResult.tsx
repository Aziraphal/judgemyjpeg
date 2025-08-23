import { PhotoAnalysis, AnalysisTone } from '@/types/analysis'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'
import AddToCollectionModal from '@/components/AddToCollectionModal'
import SocialShare from '@/components/SocialShare'
import InstagramGenerator from '@/components/InstagramGenerator'
import ExifDisplay from '@/components/ExifDisplay'
import { PDFExporter } from '@/services/pdf-export'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import SmartGlossaryText from '@/components/SmartGlossaryText'

interface AnalysisResultProps {
  photo: {
    id: string
    url: string
    filename: string
    createdAt: string
  }
  analysis: PhotoAnalysis
  tone?: AnalysisTone
  onNewAnalysis?: () => void
}

export default function AnalysisResult({ photo, analysis, tone = 'professional', onNewAnalysis }: AnalysisResultProps) {
  const { data: session } = useSession()
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [showHelpBanner, setShowHelpBanner] = useState(true)

  // Vérifier localStorage pour masquer le bandeau après première visite
  useEffect(() => {
    const hasSeenGlossaryHelp = localStorage.getItem('hasSeenGlossaryHelp')
    if (hasSeenGlossaryHelp) {
      setShowHelpBanner(false)
    }
  }, [])

  const hideHelpBanner = () => {
    setShowHelpBanner(false)
    localStorage.setItem('hasSeenGlossaryHelp', 'true')
  }
  
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

  // Fonction pour extraire les notes des analyses
  const extractScoreFromText = (text: string): number => {
    const match = text.match(/\[(\d+)\/\d+\]/)
    return match ? parseInt(match[1]) : 0
  }

  const getScoreBreakdown = () => {
    return {
      composition: { score: analysis.partialScores?.composition || 0, max: 15 },
      lighting: { score: analysis.partialScores?.lighting || 0, max: 15 },
      focus: { score: analysis.partialScores?.focus || 0, max: 15 },
      exposure: { score: analysis.partialScores?.exposure || 0, max: 15 },
      creativity: { score: analysis.partialScores?.creativity || 0, max: 15 },
      emotion: { score: analysis.partialScores?.emotion || 0, max: 15 },
      storytelling: { score: analysis.partialScores?.storytelling || 0, max: 10 }
    }
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
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative px-4">
      {/* Floating decorative elements */}
      <div className="hidden sm:block absolute -top-10 -right-10 w-20 h-20 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
      <div className="hidden sm:block absolute top-1/2 -left-10 w-16 h-16 bg-glow-cyan rounded-full blur-lg opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Bandeau aide glossaire (masqué après première visite) */}
      {showHelpBanner && (
        <div className="glass-card p-3 sm:p-4 border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/5 to-transparent animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm text-text-white font-medium">
                  Termes techniques pas clairs ?
                </p>
                <p className="text-xs text-text-muted hidden sm:block">
                  Cliquez sur les mots surlignés en bleu pour voir leur définition
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="/glossaire"
                target="_blank"
                className="btn-neon-secondary text-xs px-3 py-2 flex items-center space-x-1 hover:scale-105 transition-transform"
              >
                <span>📚</span>
                <span className="hidden sm:inline">Glossaire</span>
              </a>
              <button
                onClick={hideHelpBanner}
                className="text-text-muted hover:text-text-white text-lg hover:scale-110 transition-all"
                title="Masquer cette aide"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Photo et Score */}
      <div className="glass-card p-4 sm:p-8 hover-glow">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="relative group">
              <Image
                src={photo.url}
                alt={photo.filename}
                width={500}
                height={400}
                className="rounded-xl w-full h-auto object-cover neon-border group-hover:shadow-neon-cyan transition-all duration-300"
                style={{ imageOrientation: 'from-image' }}
              />
            </div>
            
            {/* Affichage des données EXIF pour le mode Expert */}
            {tone === 'expert' && analysis.hasExifData && analysis.exifData && (
              <ExifDisplay exifData={analysis.exifData} className="mt-4" />
            )}
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-text-white mb-2 text-glow">
                <span className="block sm:inline">Analyse de</span>{' '}
                <span className="text-neon-cyan break-all">{photo.filename}</span>
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

            {/* Scores détaillés */}
            <div className="glass-card p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-text-white mb-3 sm:mb-4 flex items-center">
                <span className="text-lg sm:text-xl mr-2">📊</span>
                <span className="hidden sm:inline">Détail des notes</span>
                <span className="sm:hidden">Notes</span>
              </h4>
              
              <div className="space-y-3">
                {/* Technique */}
                <div>
                  <h5 className="text-sm font-medium text-neon-cyan mb-2">Technique (/60)</h5>
                  <div className="space-y-2 text-xs">
                    {(() => {
                      const breakdown = getScoreBreakdown()
                      return [
                        { key: 'composition', label: 'Composition', shortLabel: 'Compo', data: breakdown.composition },
                        { key: 'lighting', label: 'Lumière', shortLabel: 'Lumière', data: breakdown.lighting },
                        { key: 'focus', label: 'Mise au point', shortLabel: 'MAP', data: breakdown.focus },
                        { key: 'exposure', label: 'Exposition', shortLabel: 'Expo', data: breakdown.exposure }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-2 bg-cosmic-glass rounded-lg">
                          <span className="text-text-gray text-xs sm:text-sm flex-shrink-0">
                            <span className="hidden sm:inline">{item.label}</span>
                            <span className="sm:hidden">{item.shortLabel}</span>
                          </span>
                          <div className="flex items-center space-x-2 ml-2">
                            <div className="w-16 sm:w-20 h-2 bg-cosmic-glassborder rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  item.data.score >= item.data.max * 0.8 ? 'bg-neon-cyan' :
                                  item.data.score >= item.data.max * 0.6 ? 'bg-yellow-400' :
                                  'bg-neon-pink'
                                }`}
                                style={{ width: `${(item.data.score / item.data.max) * 100}%` }}
                              />
                            </div>
                            <span className="text-text-white font-semibold text-xs sm:text-sm min-w-[35px] text-right">
                              {item.data.score}/{item.data.max}
                            </span>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>

                {/* Artistique */}
                <div>
                  <h5 className="text-sm font-medium text-neon-pink mb-2">Artistique (/40)</h5>
                  <div className="space-y-2 text-xs">
                    {(() => {
                      const breakdown = getScoreBreakdown()
                      return [
                        { key: 'creativity', label: 'Créativité', shortLabel: 'Créa', data: breakdown.creativity },
                        { key: 'emotion', label: 'Émotion', shortLabel: 'Émotion', data: breakdown.emotion },
                        { key: 'storytelling', label: 'Narration', shortLabel: 'Story', data: breakdown.storytelling }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-2 bg-cosmic-glass rounded-lg">
                          <span className="text-text-gray text-xs sm:text-sm flex-shrink-0">
                            <span className="hidden sm:inline">{item.label}</span>
                            <span className="sm:hidden">{item.shortLabel}</span>
                          </span>
                          <div className="flex items-center space-x-2 ml-2">
                            <div className="w-16 sm:w-20 h-2 bg-cosmic-glassborder rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  item.data.score >= item.data.max * 0.8 ? 'bg-neon-cyan' :
                                  item.data.score >= item.data.max * 0.6 ? 'bg-yellow-400' :
                                  'bg-neon-pink'
                                }`}
                                style={{ width: `${(item.data.score / item.data.max) * 100}%` }}
                              />
                            </div>
                            <span className="text-text-white font-semibold text-xs sm:text-sm min-w-[35px] text-right">
                              {item.data.score}/{item.data.max}
                            </span>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Bilan récapitulatif */}
            <div className="glass-card p-4 sm:p-6 border border-neon-cyan/30">
              <h4 className="text-base sm:text-lg font-semibold text-neon-cyan mb-3 sm:mb-4 flex items-center">
                <span className="text-lg sm:text-xl mr-2">📋</span>
                Bilan de l'analyse
              </h4>
              
              <div className="space-y-3">
                {/* Score et niveau */}
                <div className="flex items-center justify-between p-3 bg-cosmic-glass rounded-lg">
                  <span className="text-text-white font-medium">Niveau global</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl ${getScoreColor(analysis.score)}`}>
                      {analysis.score >= 85 ? '🏆' : analysis.score >= 70 ? '⭐' : analysis.score >= 55 ? '💪' : '📈'}
                    </span>
                    <span className={`font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score >= 85 ? 'Excellent' : 
                       analysis.score >= 70 ? 'Très bon' : 
                       analysis.score >= 55 ? 'Bon' : 'À améliorer'}
                    </span>
                  </div>
                </div>

                {/* Points forts */}
                <div className="p-3 bg-cosmic-glass rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-green-400 mr-2">✅</span>
                    <span className="text-text-white font-medium text-sm">Points forts</span>
                  </div>
                  <div className="text-xs sm:text-sm text-text-gray">
                    {(() => {
                      const scores = analysis.partialScores
                      const strengths = []
                      if (scores.composition >= 12) strengths.push('Composition')
                      if (scores.lighting >= 12) strengths.push('Éclairage')
                      if (scores.focus >= 12) strengths.push('Netteté')
                      if (scores.creativity >= 12) strengths.push('Créativité')
                      if (scores.emotion >= 12) strengths.push('Émotion')
                      
                      return strengths.length > 0 
                        ? strengths.join(', ') 
                        : 'Continuez vos efforts, vous progressez !'
                    })()}
                  </div>
                </div>

                {/* Point à améliorer */}
                <div className="p-3 bg-cosmic-glass rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400 mr-2">💡</span>
                    <span className="text-text-white font-medium text-sm">Priorité d'amélioration</span>
                  </div>
                  <div className="text-xs sm:text-sm text-text-gray">
                    {(() => {
                      const scores = analysis.partialScores
                      const weaknesses = [
                        { name: 'Composition', score: scores.composition, max: 15 },
                        { name: 'Éclairage', score: scores.lighting, max: 15 },
                        { name: 'Netteté', score: scores.focus, max: 15 },
                        { name: 'Exposition', score: scores.exposure, max: 15 },
                        { name: 'Créativité', score: scores.creativity, max: 15 }
                      ]
                      
                      const mainWeakness = weaknesses.sort((a, b) => (a.score/a.max) - (b.score/b.max))[0]
                      return `${mainWeakness.name} (${mainWeakness.score}/${mainWeakness.max})`
                    })()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <p className="text-text-gray text-sm leading-relaxed mb-4">
                <span className="text-neon-pink font-semibold">Intelligence Artificielle</span> a analysé votre photo selon des critères techniques et artistiques professionnels
              </p>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
                <FavoriteButton
                  photoId={photo.id}
                  initialIsFavorite={false}
                  size="md"
                />
                <button
                  onClick={() => setIsCollectionModalOpen(true)}
                  className="btn-neon-secondary text-sm px-4 py-2 flex items-center justify-center space-x-2"
                >
                  <span>📁</span>
                  <span className="hidden sm:inline">Ajouter à collection</span>
                  <span className="sm:hidden">Collection</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const exporter = new PDFExporter()
                      await exporter.exportSingleAnalysis(
                        photo,
                        analysis,
                        session?.user?.email || 'client'
                      )
                    } catch (error) {
                      console.error('Erreur export PDF:', error)
                      alert('Erreur lors de l\'export PDF')
                    }
                  }}
                  className="btn-neon-pink text-sm px-4 py-2 flex items-center justify-center space-x-2"
                >
                  <span>📄</span>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyse Technique */}
      <div className="glass-card p-4 sm:p-8 hover-glow">
        <h3 className="text-xl sm:text-2xl font-bold text-text-white mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🔧</span>
          <span className="text-neon-cyan">Analyse Technique</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {Object.entries(analysis.technical).map(([key, value]) => (
            <div key={key} className="glass-card p-4 sm:p-6 hover:bg-cosmic-glassborder transition-all duration-300">
              <h4 className="font-bold text-text-white mb-2 sm:mb-3 text-sm sm:text-base capitalize flex items-center">
                <span className="w-2 h-2 bg-neon-pink rounded-full mr-2"></span>
                {key === 'composition' ? 'Composition' : 
                 key === 'lighting' ? 'Éclairage' :
                 key === 'focus' ? 'Mise au point' : 'Exposition'}
              </h4>
              <p className="text-text-gray leading-relaxed text-sm sm:text-base">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse Artistique */}
      <div className="glass-card p-4 sm:p-8 hover-glow">
        <h3 className="text-xl sm:text-2xl font-bold text-text-white mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">🎨</span>
          <span className="text-neon-pink">Analyse Artistique</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.entries(analysis.artistic).map(([key, value]) => (
            <div key={key} className="glass-card p-4 sm:p-6 hover:bg-cosmic-glassborder transition-all duration-300">
              <h4 className="font-bold text-text-white mb-2 sm:mb-3 text-sm sm:text-base capitalize flex items-center">
                <span className="w-2 h-2 bg-neon-cyan rounded-full mr-2"></span>
                {key === 'creativity' ? 'Créativité' : 
                 key === 'emotion' ? 'Émotion' : 'Narration'}
              </h4>
              <p className="text-text-gray leading-relaxed text-sm sm:text-base">{value}</p>
            </div>
          ))}
        </div>
      </div>


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
              <SmartGlossaryText 
                text={suggestion} 
                className="text-text-white leading-relaxed"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Conseils pour la prochaine prise */}
      {analysis.nextShotTips && analysis.nextShotTips.length > 0 && (
        <div className="glass-card p-8 hover-glow">
          <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">📸</span>
            <span className="text-neon-cyan">Conseils pour la prochaine prise</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {analysis.nextShotTips.map((tip, index) => {
              const categoryIcons = {
                technique: '⚙️',
                composition: '🎯',
                éclairage: '💡',
                créativité: '✨'
              }
              
              const difficultyColors = {
                débutant: 'bg-green-500/20 text-green-400',
                intermédiaire: 'bg-yellow-500/20 text-yellow-400',
                avancé: 'bg-red-500/20 text-red-400'
              }
              
              return (
                <div key={index} className="glass-card p-6 hover:bg-cosmic-glassborder transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{categoryIcons[tip.category]}</span>
                      <span className="text-sm font-semibold text-neon-pink capitalize">
                        {tip.category}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[tip.difficulty]}`}>
                      {tip.difficulty}
                    </span>
                  </div>
                  <SmartGlossaryText 
                    text={tip.tip} 
                    className="text-text-gray leading-relaxed text-sm"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Suggestions de retouche */}
      {analysis.editingRecommendations && analysis.editingRecommendations.length > 0 && (
        <div className="glass-card p-8 hover-glow">
          <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">🎨</span>
            <span className="text-neon-pink">Suggestions de retouche</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {analysis.editingRecommendations.map((rec, index) => {
              const toolIcons = {
                Lightroom: '📷',
                Photoshop: '🖌️',
                Snapseed: '📱',
                GIMP: '🆓'
              }
              
              const difficultyColors = {
                facile: 'bg-green-500/20 text-green-400',
                moyen: 'bg-yellow-500/20 text-yellow-400',
                difficile: 'bg-red-500/20 text-red-400'
              }
              
              return (
                <div key={index} className="glass-card p-6 hover:bg-cosmic-glassborder transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{toolIcons[rec.tool]}</span>
                      <span className="text-sm font-semibold text-neon-cyan">
                        {rec.tool}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[rec.difficulty]}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <SmartGlossaryText 
                    text={rec.suggestion} 
                    className="text-text-gray leading-relaxed text-sm mb-3"
                  />
                  <div className="text-xs text-neon-pink font-semibold">
                    ✨ {rec.expectedImprovement}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

      {/* Générateur Instagram */}
      <InstagramGenerator 
        photo={photo}
        analysis={analysis}
      />

      {/* Partage social */}
      <SocialShare 
        photo={photo}
        analysis={analysis}
        tone={tone}
      />

      {/* Bouton Nouvelle Analyse (Mobile uniquement) */}
      {onNewAnalysis && (
        <div className="block md:hidden mt-8 pt-6 border-t border-cosmic-glassborder">
          <button
            onClick={onNewAnalysis}
            className="w-full btn-neon-pink text-lg py-4 font-semibold"
          >
            📸 Analyser une nouvelle photo
          </button>
          <p className="text-text-muted text-center text-sm mt-2">
            Testez une autre photo pour comparer vos résultats
          </p>
        </div>
      )}

      {/* Disclaimer artistique */}
      <div className="mt-8 p-4 bg-cosmic-glass/30 rounded-lg border border-neon-cyan/20">
        <div className="flex items-start space-x-3 text-sm text-text-muted">
          <span className="text-lg flex-shrink-0 mt-0.5">🎨</span>
          <div className="flex-1">
            <p className="leading-relaxed">
              Cette analyse reflète une vision IA basée sur les règles photographiques classiques et les tendances actuelles. 
              <span className="text-neon-cyan font-medium"> Votre style personnel et votre créativité artistique restent uniques</span> — 
              l&apos;art n&apos;a pas de vérité absolue !
            </p>
            <p className="text-xs text-text-gray mt-2 opacity-75">
              💡 Utilisez ces conseils comme inspiration pour développer votre propre vision artistique.
            </p>
          </div>
        </div>
      </div>

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