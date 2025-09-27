import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { UserInsights } from '@/services/insights'
import { logger } from '@/lib/logger'

export default function InsightsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [insights, setInsights] = useState<UserInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
  }, [status])

  const generateInsights = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Gestion spéciale pour le service en développement
        if (response.status === 503 && errorData.status === 'development') {
          setError(errorData.message || 'Service en développement')
          return
        }
        
        throw new Error(errorData.error || 'Erreur génération insights')
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      logger.error('Erreur insights:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/export/data?format=${format}`)
      
      if (!response.ok) {
        throw new Error('Erreur export')
      }

      // Télécharger le fichier
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-judge-export-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Erreur lors de l\'export')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Insights IA - JudgeMyJPEG</title>
        <meta name="description" content="Découvrez vos patterns photo et recommandations IA personnalisées" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              🧠{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Insights IA
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Découvrez vos{' '}
              <span className="text-neon-cyan font-semibold">patterns photographiques</span>{' '}
              et obtenez des{' '}
              <span className="text-neon-pink font-semibold">recommandations intelligentes</span>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour au dashboard</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => exportData('json')}
                className="btn-neon-secondary flex items-center space-x-2"
              >
                <span>📄</span>
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => exportData('csv')}
                className="btn-neon-secondary flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          {!insights ? (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-6">🔮</div>
                <h3 className="text-2xl font-bold text-text-white mb-4">
                  Générer vos insights personnalisés
                </h3>
                <p className="text-text-gray mb-8 leading-relaxed">
                  Notre IA va analyser toutes vos photos, favoris et collections pour identifier vos{' '}
                  <span className="text-neon-pink font-semibold">patterns créatifs</span>,{' '}
                  <span className="text-neon-cyan font-semibold">forces</span> et{' '}
                  <span className="text-neon-pink font-semibold">axes d'amélioration</span>.
                </p>
                
                {error && (
                  <div className="glass-card p-4 border border-red-500/50 bg-red-500/10 mb-6">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
                
                <button
                  onClick={generateInsights}
                  disabled={loading}
                  className="btn-neon-pink text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <div className="spinner-neon w-5 h-5"></div>
                      <span>Analyse en cours...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>🚀</span>
                      <span>Générer mes insights</span>
                    </span>
                  )}
                </button>
                
                <div className="mt-6 text-sm text-text-muted">
                  💡 Analysez au moins 5-10 photos pour des insights pertinents
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Conseil personnalisé principal */}
              <div className="glass-card p-8 hover-glow text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-text-white mb-4">
                  Votre profil photographique
                </h3>
                <p className="text-lg text-text-gray leading-relaxed max-w-3xl mx-auto">
                  {insights.personalizedAdvice}
                </p>
              </div>

              {/* Patterns détectés */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 hover-glow">
                  <h3 className="text-xl font-bold text-text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">🎨</span>
                    Vos patterns créatifs
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-neon-cyan font-semibold mb-2">Styles favoris</h4>
                      <div className="flex flex-wrap gap-2">
                        {insights.patterns.favoriteStyles.map((style, index) => (
                          <span key={index} className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-neon-pink font-semibold mb-2">Vos forces</h4>
                      <div className="space-y-2">
                        {insights.patterns.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-neon-pink">💪</span>
                            <span className="text-text-white">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 hover-glow">
                  <h3 className="text-xl font-bold text-text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    Axes d'amélioration
                  </h3>
                  
                  <div className="space-y-4">
                    {insights.patterns.improvements.map((improvement, index) => (
                      <div key={index} className="glass-card p-3 hover:bg-cosmic-glassborder transition-all duration-300">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-400">🎯</span>
                          <span className="text-text-white font-medium">{improvement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-text-gray text-sm leading-relaxed">
                      {insights.patterns.preferences}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 hover-glow">
                  <h3 className="text-lg font-bold text-text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">📸</span>
                    Prochaines photos
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations.nextPhotos.map((photo, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-neon-cyan text-sm">▶</span>
                        <span className="text-text-gray text-sm">{photo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 hover-glow">
                  <h3 className="text-lg font-bold text-text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">🛠️</span>
                    Techniques à maîtriser
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations.techniques.map((technique, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-neon-pink text-sm">▶</span>
                        <span className="text-text-gray text-sm">{technique}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 hover-glow">
                  <h3 className="text-lg font-bold text-text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">🎯</span>
                    Défis créatifs
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations.challenges.map((challenge, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-400 text-sm">▶</span>
                        <span className="text-text-gray text-sm">{challenge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tutoriels recommandés */}
              <div className="glass-card p-6 hover-glow">
                <h3 className="text-xl font-bold text-text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">🎓</span>
                  Tutoriels personnalisés
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {insights.tutorials.map((tutorial, index) => {
                    const priorityColors = {
                      high: 'border-red-500/50 bg-red-500/10',
                      medium: 'border-yellow-500/50 bg-yellow-500/10',
                      low: 'border-green-500/50 bg-green-500/10'
                    }
                    
                    const priorityLabels = {
                      high: '🔥 Priorité haute',
                      medium: '⭐ Priorité moyenne',
                      low: '💡 Priorité basse'
                    }
                    
                    return (
                      <div key={index} className={`glass-card p-4 border ${priorityColors[tutorial.priority]} hover:bg-cosmic-glassborder transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-text-white font-semibold">{tutorial.title}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-cosmic-glass text-text-muted">
                            {tutorial.category}
                          </span>
                        </div>
                        
                        <p className="text-text-gray text-sm mb-3 leading-relaxed">
                          {tutorial.description}
                        </p>
                        
                        <div className="text-xs text-text-muted">
                          {priorityLabels[tutorial.priority]}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="text-center">
                <div className="space-y-4">
                  <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="btn-neon-secondary"
                  >
                    🔄 Regénérer les insights
                  </button>
                  
                  <div className="text-sm text-text-muted">
                    💡 Les insights se basent sur vos photos, favoris et collections actuels
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}