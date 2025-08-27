import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'
import AddToCollectionModal from '@/components/AddToCollectionModal'
import { logger } from '@/lib/logger'

interface Photo {
  id: string
  url: string
  filename: string
  score: number | null
  createdAt: string
  favoriteCount: number
  analysis: string | null
  improvements: string | null
  suggestions: string | null
}

export default function AllPhotosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [collectionModalPhoto, setCollectionModalPhoto] = useState<Photo | null>(null)
  const [filter, setFilter] = useState<'all' | 'top' | 'recent'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (session) {
      fetchPhotos()
    }
  }, [session, status, filter, sortBy])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/photos/all')
      if (response.ok) {
        const data = await response.json()
        let filteredPhotos = data.photos || []

        // Appliquer filtre
        if (filter === 'top') {
          filteredPhotos = filteredPhotos.filter((p: Photo) => p.score && p.score >= 85)
        } else if (filter === 'recent') {
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          filteredPhotos = filteredPhotos.filter((p: Photo) => new Date(p.createdAt) >= oneWeekAgo)
        }

        // Appliquer tri
        filteredPhotos.sort((a: Photo, b: Photo) => {
          if (sortBy === 'score') {
            return (b.score || 0) - (a.score || 0)
          } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
        })

        setPhotos(filteredPhotos)
      }
    } catch (error) {
      logger.error('Erreur chargement photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseAnalysis = (analysisStr: string | null) => {
    if (!analysisStr) return null
    try {
      return JSON.parse(analysisStr)
    } catch {
      return null
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400'
    if (score >= 85) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'Non noté'
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Bon'
    if (score >= 50) return 'Moyen'
    return 'À améliorer'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen particles-container">
        <div className="spinner-neon w-12 h-12"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Toutes mes photos - JudgeMyJPEG</title>
        <meta name="description" content="Toutes vos photos analysées avec détails" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              📸{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Toutes mes photos
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} analysée{photos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-4 mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-neon-secondary flex items-center justify-center space-x-2 w-full sm:w-auto self-start"
            >
              <span>←</span>
              <span>Retour au dashboard</span>
            </button>

            {/* Filtres et tri */}
            <div className="glass-card p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-text-white font-medium">Filtre:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="input-cosmic text-sm"
                  >
                    <option value="all">Toutes</option>
                    <option value="top">Top Photos (≥85)</option>
                    <option value="recent">Récentes (7 jours)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-text-white font-medium">Tri:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input-cosmic text-sm"
                  >
                    <option value="date">Date (plus récent)</option>
                    <option value="score">Score (meilleur)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-text-white mb-4">
                Aucune photo trouvée
              </h3>
              <p className="text-text-gray mb-6">
                {filter === 'all' ? 'Vous n\'avez pas encore analysé de photos.' : 'Aucune photo ne correspond aux filtres sélectionnés.'}
              </p>
              <button
                onClick={() => router.push('/analyze')}
                className="btn-neon-pink"
              >
                📸 Analyser une photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => {
                const analysis = parseAnalysis(photo.analysis)
                return (
                  <div key={photo.id} className="glass-card p-4 hover-glow group">
                    <div className="relative mb-3">
                      <div 
                        className="aspect-square relative rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.filename}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          style={{ imageOrientation: 'from-image' }}
                        />
                        
                        {/* Score badge */}
                        {photo.score && (
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-md bg-cosmic-glass backdrop-blur-sm text-xs font-bold ${getScoreColor(photo.score)}`}>
                            {photo.score}/100
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex flex-col space-y-1">
                          <FavoriteButton
                            photoId={photo.id}
                            initialIsFavorite={photo.favoriteCount > 0}
                            size="sm"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCollectionModalPhoto(photo)
                            }}
                            className="w-8 h-8 rounded-full bg-cosmic-glass backdrop-blur-sm text-white hover:bg-neon-cyan hover:text-black transition-all duration-200 flex items-center justify-center text-sm"
                            title="Ajouter à une collection"
                          >
                            📁
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Info photo */}
                    <div className="space-y-2">
                      <h3 className="text-text-white font-medium text-sm truncate">
                        {photo.filename}
                      </h3>
                      
                      {photo.score && (
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${getScoreColor(photo.score)}`}>
                            {getScoreLabel(photo.score)}
                          </span>
                          <span className="text-text-muted text-xs">
                            {new Date(photo.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      
                      {/* Aperçu analyse */}
                      {analysis && (
                        <p className="text-text-gray text-xs line-clamp-2">
                          {analysis.summary || analysis.critique || 'Analyse disponible'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal agrandissement photo */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-cosmic-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="glass-card p-6 max-w-6xl max-h-[90vh] overflow-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-text-white mb-2">
                    {selectedPhoto.filename}
                  </h3>
                  {selectedPhoto.score && (
                    <div className={`text-lg font-bold ${getScoreColor(selectedPhoto.score)}`}>
                      🎯 {selectedPhoto.score}/100 - {getScoreLabel(selectedPhoto.score)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="btn-neon-secondary text-lg px-3 py-1"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div>
                  <Image
                    src={selectedPhoto.url}
                    alt={selectedPhoto.filename}
                    width={600}
                    height={400}
                    className="rounded-lg w-full h-auto object-contain"
                    style={{ imageOrientation: 'from-image' }}
                  />
                </div>
                
                {/* Analyse détaillée */}
                <div className="space-y-4">
                  {(() => {
                    const analysis = parseAnalysis(selectedPhoto.analysis)
                    if (!analysis) return <p className="text-text-gray">Aucune analyse disponible</p>
                    
                    return (
                      <>
                        {analysis.critique && (
                          <div>
                            <h4 className="font-bold text-neon-cyan mb-2">📝 Analyse :</h4>
                            <p className="text-text-gray">{analysis.critique}</p>
                          </div>
                        )}
                        
                        {analysis.strengths && analysis.strengths.length > 0 && (
                          <div>
                            <h4 className="font-bold text-green-400 mb-2">✅ Points forts :</h4>
                            <ul className="list-disc list-inside text-text-gray space-y-1">
                              {analysis.strengths.map((strength: string, index: number) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysis.improvements && analysis.improvements.length > 0 && (
                          <div>
                            <h4 className="font-bold text-yellow-400 mb-2">🔧 Améliorations :</h4>
                            <ul className="list-disc list-inside text-text-gray space-y-1">
                              {analysis.improvements.map((improvement: any, index: number) => (
                                <li key={index}>
                                  {typeof improvement === 'string' ? improvement : improvement.description || improvement.impact}
                                  {typeof improvement === 'object' && improvement.scoreGain && (
                                    <span className="text-green-400 ml-2">(+{improvement.scoreGain} pts)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysis.suggestions && analysis.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-bold text-neon-pink mb-2">💡 Suggestions :</h4>
                            <ul className="list-disc list-inside text-text-gray space-y-1">
                              {analysis.suggestions.map((suggestion: any, index: number) => (
                                <li key={index}>
                                  {typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )
                  })()}
                  
                  <div className="pt-4 border-t border-cosmic-glassborder">
                    <p className="text-text-muted text-sm">
                      Analysée le {new Date(selectedPhoto.createdAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Collection */}
        {collectionModalPhoto && (
          <AddToCollectionModal
            isOpen={true}
            photoId={collectionModalPhoto.id}
            photoName={collectionModalPhoto.filename}
            onClose={() => setCollectionModalPhoto(null)}
          />
        )}
      </main>
    </>
  )
}