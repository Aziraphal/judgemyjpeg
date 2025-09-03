/**
 * Page d'analyse de retouche approfondie
 * /analysis/[id]/advanced-editing
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { logger } from '@/lib/logger'

interface EditingStep {
  id: string
  title: string
  description: string
  values: Record<string, number | string>
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'advanced'
}

interface AdvancedEditingAnalysis {
  estimatedNewScore: number
  scoreImprovement: number
  lightroom: {
    steps: EditingStep[]
    webUrl: string
  }
  snapseed: {
    steps: EditingStep[]
    downloadUrl: string
  }
  explanation: string
  priority: 'exposure' | 'composition' | 'colors' | 'details'
}

interface PhotoData {
  id: string
  imageUrl: string
  originalName: string
  score: number
  analysis: string
  exifData?: any
}

export default function AdvancedEditingPage() {
  const router = useRouter()
  const { id } = router.query
  
  const [photoData, setPhotoData] = useState<PhotoData | null>(null)
  const [editingAnalysis, setEditingAnalysis] = useState<AdvancedEditingAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lightroom' | 'snapseed'>('lightroom')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchPhotoData()
    }
  }, [id])

  const fetchPhotoData = async () => {
    try {
      // Récupérer les données de la photo depuis le localStorage ou API
      const storedAnalyses = localStorage.getItem('photo-analyses')
      if (storedAnalyses) {
        const analyses = JSON.parse(storedAnalyses)
        const photo = analyses.find((a: any) => a.id === id)
        
        if (photo) {
          setPhotoData(photo)
          await generateEditingAnalysis(photo)
        } else {
          setError('Photo non trouvée')
        }
      } else {
        setError('Aucune analyse trouvée')
      }
    } catch (error) {
      logger.error('Erreur récupération photo:', error)
      setError('Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const generateEditingAnalysis = async (photo: PhotoData) => {
    try {
      setIsLoading(true)
      
      // Convertir l'image en base64
      const imageBase64 = await urlToBase64(photo.imageUrl)
      
      const response = await fetch('/api/analysis/advanced-editing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64.split(',')[1], // Enlever le préfixe data:
          currentScore: photo.score,
          currentAnalysis: photo.analysis,
          exifData: photo.exifData,
          platform: 'both'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setEditingAnalysis(result.analysis)
      } else {
        setError(result.error || 'Erreur analyse avancée')
      }
    } catch (error) {
      logger.error('Erreur analyse avancée:', error)
      setError('Erreur lors de l\'analyse avancée')
    } finally {
      setIsLoading(false)
    }
  }

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/10'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10'
      case 'low': return 'text-green-400 bg-green-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢'
      case 'medium': return '🟡'
      case 'advanced': return '🔴'
      default: return '⚪'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-text-white">Génération de l'analyse approfondie...</p>
          <p className="text-text-gray text-sm mt-2">Analyse des détails techniques de votre photo</p>
        </div>
      </div>
    )
  }

  if (error || !photoData || !editingAnalysis) {
    return (
      <div className="min-h-screen bg-cosmic-overlay flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-400 mb-2">Erreur</h1>
          <p className="text-text-gray mb-6">{error || 'Données non disponibles'}</p>
          <button
            onClick={() => router.back()}
            className="btn-neon-cyan"
          >
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Analyse de retouche avancée | {photoData.originalName} - JudgeMyJPEG</title>
        <meta name="description" content="Conseils de retouche précis avec Lightroom Web et Snapseed pour améliorer votre photo." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="btn-neon-secondary mb-4"
            >
              ← Retour à l'analyse
            </button>
            
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                🎨 Retouche Approfondie
              </span>
            </h1>
            <p className="text-text-gray">
              Conseils précis pour améliorer votre photo avec des outils gratuits
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Photo et scores */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-8">
                <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                  <Image
                    src={photoData.imageUrl}
                    alt={photoData.originalName}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <h3 className="font-semibold text-text-white mb-4">{photoData.originalName}</h3>
                
                {/* Scores */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-500/10 rounded-lg">
                    <span className="text-text-gray">Score actuel</span>
                    <span className="text-2xl font-bold text-neon-cyan">{photoData.score}/100</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <span className="text-green-300">Score estimé</span>
                    <span className="text-2xl font-bold text-green-400">{editingAnalysis.estimatedNewScore}/100</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neon-pink/10 rounded-lg border border-neon-pink/30">
                    <span className="text-neon-pink">Amélioration</span>
                    <span className="text-xl font-bold text-neon-pink">+{editingAnalysis.scoreImprovement} pts</span>
                  </div>
                </div>

                {/* Priorité */}
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-semibold mb-2">🎯 Priorité</h4>
                  <p className="text-text-white text-sm">
                    {editingAnalysis.priority === 'exposure' && 'Correction d\'exposition'}
                    {editingAnalysis.priority === 'composition' && 'Amélioration composition'}
                    {editingAnalysis.priority === 'colors' && 'Optimisation couleurs'}
                    {editingAnalysis.priority === 'details' && 'Amélioration détails'}
                  </p>
                </div>

                {/* Progrès */}
                <div className="mt-6">
                  <h4 className="text-text-white font-semibold mb-2">📊 Progrès</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-neon-pink to-neon-cyan h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(completedSteps.size / (editingAnalysis.lightroom.steps.length + editingAnalysis.snapseed.steps.length)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-text-gray">
                      {completedSteps.size}/{editingAnalysis.lightroom.steps.length + editingAnalysis.snapseed.steps.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutoriels */}
            <div className="lg:col-span-2">
              
              {/* Explication */}
              <div className="glass-card p-6 mb-6">
                <h3 className="text-xl font-bold text-neon-cyan mb-4">💡 Analyse détaillée</h3>
                <p className="text-text-white leading-relaxed">{editingAnalysis.explanation}</p>
              </div>

              {/* Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab('lightroom')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'lightroom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-cosmic-glass text-text-gray hover:text-text-white'
                  }`}
                >
                  💻 Lightroom Web
                </button>
                <button
                  onClick={() => setActiveTab('snapseed')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'snapseed'
                      ? 'bg-green-600 text-white'
                      : 'bg-cosmic-glass text-text-gray hover:text-text-white'
                  }`}
                >
                  📱 Snapseed
                </button>
              </div>

              {/* Lightroom Steps */}
              {activeTab === 'lightroom' && (
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">💻 Lightroom Web (Gratuit)</h3>
                    <p className="text-text-gray mb-4">
                      Ouvrez Lightroom Web gratuitement dans votre navigateur :
                    </p>
                    <a
                      href={editingAnalysis.lightroom.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neon-cyan inline-block mb-6"
                    >
                      🚀 Ouvrir Lightroom Web
                    </a>
                  </div>

                  {editingAnalysis.lightroom.steps.map((step, index) => (
                    <div key={step.id} className="glass-card p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => toggleStep(`lightroom-${step.id}`)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              completedSteps.has(`lightroom-${step.id}`)
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-500 hover:border-neon-cyan'
                            }`}
                          >
                            {completedSteps.has(`lightroom-${step.id}`) ? '✓' : index + 1}
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-text-white">{step.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(step.impact)}`}>
                              {step.impact === 'high' && 'Impact élevé'}
                              {step.impact === 'medium' && 'Impact moyen'}
                              {step.impact === 'low' && 'Impact faible'}
                            </span>
                            <span className="text-sm">
                              {getDifficultyIcon(step.difficulty)} {step.difficulty === 'easy' ? 'Facile' : step.difficulty === 'medium' ? 'Moyen' : 'Avancé'}
                            </span>
                          </div>
                          
                          <p className="text-text-gray mb-4">{step.description}</p>
                          
                          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                            <h5 className="text-blue-300 font-semibold mb-2">⚙️ Réglages à appliquer :</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(step.values).map(([param, value]) => (
                                <div key={param} className="flex justify-between">
                                  <span className="text-text-gray capitalize">{param} :</span>
                                  <span className="text-blue-300 font-mono">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Snapseed Steps */}
              {activeTab === 'snapseed' && (
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">📱 Snapseed (Mobile)</h3>
                    <p className="text-text-gray mb-4">
                      Téléchargez Snapseed gratuitement sur votre mobile :
                    </p>
                    <a
                      href={editingAnalysis.snapseed.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neon-pink inline-block mb-6"
                    >
                      📱 Télécharger Snapseed
                    </a>
                  </div>

                  {editingAnalysis.snapseed.steps.map((step, index) => (
                    <div key={step.id} className="glass-card p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => toggleStep(`snapseed-${step.id}`)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              completedSteps.has(`snapseed-${step.id}`)
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-500 hover:border-neon-cyan'
                            }`}
                          >
                            {completedSteps.has(`snapseed-${step.id}`) ? '✓' : index + 1}
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-text-white">{step.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(step.impact)}`}>
                              {step.impact === 'high' && 'Impact élevé'}
                              {step.impact === 'medium' && 'Impact moyen'}
                              {step.impact === 'low' && 'Impact faible'}
                            </span>
                            <span className="text-sm">
                              {getDifficultyIcon(step.difficulty)} {step.difficulty === 'easy' ? 'Facile' : step.difficulty === 'medium' ? 'Moyen' : 'Avancé'}
                            </span>
                          </div>
                          
                          <p className="text-text-gray mb-4">{step.description}</p>
                          
                          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                            <h5 className="text-green-300 font-semibold mb-2">📱 Actions dans Snapseed :</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(step.values).map(([param, value]) => (
                                <div key={param} className="flex justify-between">
                                  <span className="text-text-gray capitalize">{param} :</span>
                                  <span className="text-green-300 font-mono">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Final */}
              <div className="glass-card p-6 text-center">
                <h3 className="text-xl font-bold text-neon-cyan mb-4">🎉 Terminez vos retouches</h3>
                <p className="text-text-gray mb-6">
                  Une fois vos retouches terminées, relancez une analyse pour voir votre nouveau score !
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn-neon-pink"
                >
                  🔄 Nouvelle analyse
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}