import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useDropzone } from 'react-dropzone'
import Head from 'next/head'
import Image from 'next/image'
import { PhotoAnalysis } from '@/services/openai'
import { PDFExporter } from '@/services/pdf-export'
import BatchReportIntelligent from '@/components/BatchReportIntelligent'

interface BatchPhoto {
  id: string
  file: File
  url: string
  analysis?: PhotoAnalysis
  status: 'pending' | 'analyzing' | 'completed' | 'error'
}

interface BatchReport {
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

export default function BatchAnalysis() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [photos, setPhotos] = useState<BatchPhoto[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalyzing, setCurrentAnalyzing] = useState(0)
  const [report, setReport] = useState<BatchReport | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  // Vérifier le statut premium
  useEffect(() => {
    if (session) {
      checkPremiumStatus()
    }
  }, [session])

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setIsPremium(data.isPremium)
      }
    } catch (error) {
      console.error('Erreur vérification premium:', error)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
  }, [status])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limite à 10 photos pour le premium
    const maxFiles = isPremium ? 10 : 3
    const selectedFiles = acceptedFiles.slice(0, maxFiles)
    
    const newPhotos: BatchPhoto[] = selectedFiles.map((file, index) => ({
      id: `batch-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      status: 'pending'
    }))
    
    setPhotos(prev => [...prev, ...newPhotos].slice(0, maxFiles))
  }, [isPremium])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: isPremium ? 10 : 3,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
    setReport(null)
  }

  const startBatchAnalysis = async () => {
    if (photos.length === 0) return
    
    setIsAnalyzing(true)
    setCurrentAnalyzing(1)
    setReport(null)
    
    try {
      // Marquer toutes les photos comme en cours
      const updatedPhotos = photos.map(p => ({ ...p, status: 'analyzing' as const }))
      setPhotos(updatedPhotos)
      
      // Convertir toutes les images en base64
      const imagesData = await Promise.all(
        updatedPhotos.map(async (photo) => ({
          id: photo.id,
          data: await fileToBase64(photo.file),
          filename: photo.file.name
        }))
      )
      
      // Analyser toutes les photos d'un coup
      const response = await fetch('/api/batch-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: imagesData,
          tone: 'professional'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Mettre à jour avec les résultats
        const finalPhotos = updatedPhotos.map(photo => {
          const result = data.results.find((r: any) => r.id === photo.id)
          if (result?.analysis) {
            return { ...photo, analysis: result.analysis, status: 'completed' as const }
          } else {
            return { ...photo, status: 'error' as const }
          }
        })
        
        setPhotos(finalPhotos)
        
        // Utiliser le rapport généré par l'API si disponible
        if (data.report) {
          setReport({
            totalPhotos: data.report.totalPhotos,
            avgScore: data.report.avgScore,
            bestPhoto: data.report.bestPhoto,
            worstPhoto: data.report.worstPhoto,
            categoryAverages: data.report.categoryAverages,
            overallRecommendations: data.report.overallRecommendations,
            photographyStyle: data.report.photographyStyle,
            improvementPriority: data.report.improvementPriority,
            famousPhotosCount: data.report.famousPhotosCount
          })
        } else {
          // Générer le rapport côté client en fallback
          generateReport(finalPhotos)
        }
      } else {
        // Marquer toutes comme erreur
        const errorPhotos = updatedPhotos.map(p => ({ ...p, status: 'error' as const }))
        setPhotos(errorPhotos)
      }
    } catch (error) {
      console.error('Erreur analyse batch:', error)
      const errorPhotos = photos.map(p => ({ ...p, status: 'error' as const }))
      setPhotos(errorPhotos)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = error => reject(error)
    })
  }

  const generateReport = (completedPhotos: BatchPhoto[]) => {
    const successfulAnalyses = completedPhotos.filter(p => p.analysis && p.status === 'completed')
    
    if (successfulAnalyses.length === 0) return
    
    const totalScore = successfulAnalyses.reduce((sum, p) => sum + p.analysis!.score, 0)
    const avgScore = Math.round(totalScore / successfulAnalyses.length)
    
    // Trouver la meilleure et la pire photo
    const topPhoto = successfulAnalyses.reduce((best, current) => 
      current.analysis!.score > best.analysis!.score ? current : best
    )
    
    const worstPhoto = successfulAnalyses.reduce((worst, current) => 
      current.analysis!.score < worst.analysis!.score ? current : worst
    )
    
    // Moyennes par catégorie
    const categoryTotals = successfulAnalyses.reduce((totals, photo) => {
      const scores = photo.analysis!.partialScores
      return {
        composition: totals.composition + scores.composition,
        lighting: totals.lighting + scores.lighting,
        focus: totals.focus + scores.focus,
        exposure: totals.exposure + scores.exposure,
        creativity: totals.creativity + scores.creativity,
        emotion: totals.emotion + scores.emotion,
        storytelling: totals.storytelling + scores.storytelling
      }
    }, {
      composition: 0, lighting: 0, focus: 0, exposure: 0,
      creativity: 0, emotion: 0, storytelling: 0
    })
    
    const categoryAverages = {
      composition: Math.round(categoryTotals.composition / successfulAnalyses.length),
      lighting: Math.round(categoryTotals.lighting / successfulAnalyses.length),
      focus: Math.round(categoryTotals.focus / successfulAnalyses.length),
      exposure: Math.round(categoryTotals.exposure / successfulAnalyses.length),
      creativity: Math.round(categoryTotals.creativity / successfulAnalyses.length),
      emotion: Math.round(categoryTotals.emotion / successfulAnalyses.length),
      storytelling: Math.round(categoryTotals.storytelling / successfulAnalyses.length)
    }
    
    // Recommandations globales basées sur les faiblesses communes
    const overallRecommendations = generateOverallRecommendations(categoryAverages, successfulAnalyses)
    
    const report: BatchReport = {
      totalPhotos: successfulAnalyses.length,
      avgScore,
      bestPhoto: {
        id: topPhoto.id,
        filename: topPhoto.file.name,
        score: topPhoto.analysis!.score,
        reason: 'Score le plus élevé du lot'
      },
      worstPhoto: successfulAnalyses.length > 1 ? {
        id: worstPhoto.id,
        filename: worstPhoto.file.name,
        score: worstPhoto.analysis!.score,
        issues: ['Score le plus bas du lot']
      } : {
        id: '',
        filename: '',
        score: 0,
        issues: ['Pas assez de photos pour comparaison']
      },
      categoryAverages: categoryAverages,
      overallRecommendations,
      photographyStyle: 'Style mixte détecté',
      improvementPriority: Object.entries(categoryAverages).sort(([,a], [,b]) => a - b)[0][0],
      famousPhotosCount: 0
    }
    
    setReport(report)
  }

  const generateOverallRecommendations = (categories: any, photos: BatchPhoto[]): string[] => {
    const recommendations: string[] = []
    const weakest = Object.entries(categories)
      .sort(([,a], [,b]) => (a as number) - (b as number))
      .slice(0, 3)
    
    weakest.forEach(([category, score]) => {
      if ((score as number) < 12) {
        switch (category) {
          case 'composition':
            recommendations.push("Travaillez davantage la règle des tiers et l'équilibre visuel de vos cadrages")
            break
          case 'lighting':
            recommendations.push("Portez plus attention à la qualité et direction de la lumière dans vos prises")
            break
          case 'focus':
            recommendations.push("Améliorez la netteté en vérifiant votre mise au point avant le déclenchement")
            break
          case 'exposure':
            recommendations.push("Maîtrisez mieux l'exposition en utilisant l'histogramme de votre appareil")
            break
          case 'creativity':
            recommendations.push("Explorez des angles de vue et des perspectives plus originales")
            break
          case 'emotion':
            recommendations.push("Cherchez à capturer des moments plus expressifs et émouvants")
            break
          case 'storytelling':
            recommendations.push("Développez la narration visuelle pour raconter une histoire plus claire")
            break
        }
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push("Excellent travail ! Continuez à expérimenter pour maintenir ce niveau de qualité.")
    }
    
    return recommendations
  }

  const getStatusIcon = (status: BatchPhoto['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'analyzing': return '🔄'
      case 'completed': return '✅'
      case 'error': return '❌'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neon-cyan'
    if (score >= 60) return 'text-yellow-400'
    return 'text-neon-pink'
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
        <title>Analyse en Lot - JudgeMyJPEG</title>
        <meta name="description" content="Analysez jusqu'à 10 photos simultanément avec un rapport comparatif détaillé" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-24 h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-12 w-32 h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              📊{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Analyse en Lot
              </span>
              {isPremium && <span className="text-yellow-400 ml-3">💎</span>}
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Analysez jusqu'à {isPremium ? '10' : '3'} photos simultanément et obtenez un{' '}
              <span className="text-neon-cyan font-semibold">rapport comparatif</span>
            </p>
          </div>

          {!isPremium && (
            <div className="glass-card p-6 mb-8 border border-yellow-400/50">
              <div className="text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Fonctionnalité Premium</h3>
                <p className="text-text-gray mb-4">
                  Version gratuite : 3 photos max. Version premium : 10 photos + rapport avancé
                </p>
                <button
                  onClick={() => router.push('/premium')}
                  className="btn-neon-pink"
                >
                  💎 Passer Premium
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/analyze')}
                className="btn-neon-secondary"
              >
                📸 Analyse simple
              </button>
              {report && (
                <button
                  onClick={async () => {
                    try {
                      const exporter = new PDFExporter()
                      await exporter.exportBatchReport(
                        photos.filter(p => p.analysis),
                        report,
                        session?.user?.email || 'client'
                      )
                    } catch (error) {
                      console.error('Erreur export PDF:', error)
                      alert('Erreur lors de l\'export PDF')
                    }
                  }}
                  className="btn-neon-pink"
                >
                  📄 Export PDF
                </button>
              )}
            </div>
          </div>

          {/* Upload Zone */}
          {!isAnalyzing && !report && (
            <div className="glass-card p-8 mb-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-neon-cyan bg-neon-cyan/10' 
                    : 'border-cosmic-glassborder hover:border-neon-pink'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-xl font-bold text-text-white mb-2">
                  {isDragActive ? 'Déposez vos photos ici' : 'Glissez-déposez vos photos'}
                </h3>
                <p className="text-text-gray mb-4">
                  ou cliquez pour sélectionner • Max {isPremium ? '10' : '3'} photos • 10MB max
                </p>
                <div className="text-sm text-text-muted">
                  Formats supportés : JPEG, PNG, WebP
                </div>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          {photos.length > 0 && (
            <div className="glass-card p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-white">
                  Photos sélectionnées ({photos.length}/{isPremium ? '10' : '3'})
                </h3>
                {!isAnalyzing && !report && (
                  <button
                    onClick={startBatchAnalysis}
                    className="btn-neon-pink"
                    disabled={photos.length === 0}
                  >
                    🚀 Lancer l'analyse
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={photo.url}
                        alt={photo.file.name}
                        fill
                        className="object-cover"
                      />
                      
                      {/* Status overlay */}
                      <div className="absolute inset-0 bg-cosmic-overlay/80 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-1">{getStatusIcon(photo.status)}</div>
                          {photo.analysis && (
                            <div className={`text-lg font-bold ${getScoreColor(photo.analysis.score)}`}>
                              {photo.analysis.score}/100
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove button */}
                      {!isAnalyzing && (
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    <p className="mt-2 text-sm text-text-white truncate">
                      {photo.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Analysis */}
          {isAnalyzing && (
            <div className="glass-card p-8 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-text-white mb-4">
                  Analyse en cours... ({currentAnalyzing}/{photos.length})
                </h3>
                
                <div className="w-full bg-cosmic-glassborder rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-neon-pink to-neon-cyan h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(currentAnalyzing / photos.length) * 100}%` }}
                  />
                </div>
                
                <p className="text-text-gray">
                  Analyse intelligente en cours... Veuillez patienter
                </p>
              </div>
            </div>
          )}

          {/* Rapport Intelligent */}
          {report && (
            <BatchReportIntelligent 
              report={report} 
              photos={photos.filter(p => p.analysis).map(p => ({
                id: p.id,
                filename: p.file.name,
                analysis: p.analysis!,
                rank: 0, // Sera mis à jour par le composant
                isFamous: false, // Sera déterminé par l'API
                famousInfo: undefined
              }))}
            />
          )}
        </div>
      </main>
    </>
  )
}