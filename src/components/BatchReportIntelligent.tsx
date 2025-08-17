import React from 'react'
import Image from 'next/image'

interface BatchPhoto {
  id: string
  filename: string
  analysis: any
  rank: number
  isFamous: boolean
  famousInfo?: {
    photographer: string
    title: string
    confidence: number
  }
}

interface BatchReportProps {
  report: {
    totalPhotos: number
    avgScore: number
    bestPhoto: {
      id: string
      filename: string
      score: number
      reason: string
    }
    worstPhoto: {
      id: string
      filename: string
      score: number
      issues: string[]
    }
    categoryAverages: {
      composition: number
      lighting: number
      focus: number
      exposure: number
      creativity: number
      emotion: number
      storytelling: number
    }
    overallRecommendations: string[]
    photographyStyle: string
    improvementPriority: string
    famousPhotosCount: number
  }
  photos: BatchPhoto[]
}

export default function BatchReportIntelligent({ report, photos }: BatchReportProps) {
  const competitivePhotos = photos.filter(p => !p.isFamous && p.rank > 0)
  const famousPhotos = photos.filter(p => p.isFamous)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neon-cyan'
    if (score >= 60) return 'text-yellow-400'
    return 'text-neon-pink'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-neon-cyan/20'
    if (score >= 60) return 'bg-yellow-400/20'
    return 'bg-neon-pink/20'
  }

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="space-y-8">
      {/* Résumé global */}
      <div className="glass-card p-6 hover-glow">
        <h2 className="text-2xl font-bold text-text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">📊</span>
          Rapport d'Analyse en Lot
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-cyan">
              {report.totalPhotos}
            </div>
            <div className="text-text-muted">Photos analysées</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(report.avgScore)}`}>
              {report.avgScore}/100
            </div>
            <div className="text-text-muted">Score moyen</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-pink">
              {report.famousPhotosCount}
            </div>
            <div className="text-text-muted">Photos célèbres détectées</div>
          </div>
        </div>
      </div>

      {/* Style photographique et priorité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 hover-glow">
          <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
            <span className="text-xl mr-2">🎨</span>
            Style Détecté
          </h3>
          <p className="text-neon-cyan font-medium">{report.photographyStyle}</p>
        </div>
        
        <div className="glass-card p-6 hover-glow">
          <h3 className="text-lg font-semibold text-text-white mb-4 flex items-center">
            <span className="text-xl mr-2">🎯</span>
            Priorité d'Amélioration
          </h3>
          <p className="text-neon-pink font-medium">{report.improvementPriority}</p>
        </div>
      </div>

      {/* Meilleure et pire photo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 hover-glow border border-neon-cyan/30">
          <h3 className="text-lg font-semibold text-neon-cyan mb-4 flex items-center">
            <span className="text-xl mr-2">🏆</span>
            Meilleure Photo
          </h3>
          <div className="space-y-3">
            <div className="font-medium text-text-white">{report.bestPhoto.filename}</div>
            <div className="text-2xl font-bold text-neon-cyan">{report.bestPhoto.score}/100</div>
            <p className="text-text-gray text-sm">{report.bestPhoto.reason}</p>
          </div>
        </div>
        
        <div className="glass-card p-6 hover-glow border border-neon-pink/30">
          <h3 className="text-lg font-semibold text-neon-pink mb-4 flex items-center">
            <span className="text-xl mr-2">📈</span>
            Photo à Améliorer
          </h3>
          <div className="space-y-3">
            <div className="font-medium text-text-white">{report.worstPhoto.filename}</div>
            <div className="text-2xl font-bold text-neon-pink">{report.worstPhoto.score}/100</div>
            <div className="space-y-1">
              {report.worstPhoto.issues.map((issue, index) => (
                <p key={index} className="text-text-gray text-sm">• {issue}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Classement compétitif */}
      {competitivePhotos.length > 0 && (
        <div className="glass-card p-6 hover-glow">
          <h3 className="text-xl font-semibold text-text-white mb-6 flex items-center">
            <span className="text-2xl mr-3">🏅</span>
            Classement de vos Photos
          </h3>
          
          <div className="space-y-4">
            {competitivePhotos.map((photo) => (
              <div key={photo.id} className="flex items-center justify-between p-4 bg-cosmic-glass rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold">
                    {getRankMedal(photo.rank)}
                  </div>
                  <div>
                    <div className="font-medium text-text-white">{photo.filename}</div>
                    <div className="text-sm text-text-muted">
                      Rang {photo.rank} sur {competitivePhotos.length}
                    </div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full ${getScoreBg(photo.analysis.score)} ${getScoreColor(photo.analysis.score)} font-bold`}>
                  {photo.analysis.score}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos célèbres détectées */}
      {famousPhotos.length > 0 && (
        <div className="glass-card p-6 hover-glow border border-yellow-400/30">
          <h3 className="text-xl font-semibold text-yellow-400 mb-6 flex items-center">
            <span className="text-2xl mr-3">🎨</span>
            Photos d'Œuvres Célèbres Détectées
          </h3>
          
          <div className="space-y-4">
            {famousPhotos.map((photo) => (
              <div key={photo.id} className="p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-white">{photo.filename}</div>
                    {photo.famousInfo && (
                      <div className="text-sm text-yellow-400">
                        🎭 {photo.famousInfo.photographer} - {photo.famousInfo.title}
                      </div>
                    )}
                    <div className="text-xs text-text-muted mt-1">
                      📚 Analyse à titre éducatif - Ne compte pas dans le classement
                    </div>
                  </div>
                  
                  <div className="text-yellow-400 font-bold">
                    {photo.analysis.score}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moyennes par catégorie */}
      <div className="glass-card p-6 hover-glow">
        <h3 className="text-xl font-semibold text-text-white mb-6 flex items-center">
          <span className="text-2xl mr-3">📈</span>
          Analyse par Catégorie
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(report.categoryAverages).map(([category, score]) => {
            const categoryNames = {
              composition: 'Composition',
              lighting: 'Éclairage',
              focus: 'Netteté',
              exposure: 'Exposition',
              creativity: 'Créativité',
              emotion: 'Émotion',
              storytelling: 'Narration'
            }
            
            const maxScore = category === 'storytelling' ? 10 : 15
            const percentage = (score / maxScore) * 100
            
            return (
              <div key={category} className="text-center p-4 bg-cosmic-glass rounded-lg">
                <div className="text-lg font-bold text-text-white">
                  {score}/{maxScore}
                </div>
                <div className="text-sm text-text-muted mb-2">
                  {categoryNames[category as keyof typeof categoryNames]}
                </div>
                <div className="w-full bg-cosmic-glassborder rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-neon-cyan' :
                      percentage >= 60 ? 'bg-yellow-400' :
                      'bg-neon-pink'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommandations */}
      <div className="glass-card p-6 hover-glow">
        <h3 className="text-xl font-semibold text-text-white mb-6 flex items-center">
          <span className="text-2xl mr-3">💡</span>
          Recommandations Personnalisées
        </h3>
        
        <div className="space-y-3">
          {report.overallRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start p-3 bg-cosmic-glass rounded-lg">
              <span className="text-neon-cyan mr-3 mt-1">✨</span>
              <span className="text-text-white">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}