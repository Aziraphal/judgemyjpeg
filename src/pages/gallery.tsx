import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'
import AddToCollectionModal from '@/components/AddToCollectionModal'

interface Photo {
  id: string
  url: string
  filename: string
  score: number
  createdAt: string
  isFavorite: boolean
  favoriteCount: number
}

export default function GalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topPhotos, setTopPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [collectionModalPhoto, setCollectionModalPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (session) {
      fetchTopPhotos()
    }
  }, [session, status])

  const fetchTopPhotos = async () => {
    try {
      const response = await fetch('/api/photos/top')
      if (response.ok) {
        const data = await response.json()
        setTopPhotos(data.topPhotos)
      }
    } catch (error) {
      console.error('Erreur chargement top photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = (photoId: string, isFavorite: boolean) => {
    setTopPhotos(prev => 
      prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, isFavorite }
          : photo
      )
    )
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTopPhotos(prev => prev.filter(photo => photo.id !== photoId))
        
        // Si on était en train de voir cette photo, fermer la modal
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null)
        }
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { emoji: '👑', text: 'Legendary', color: 'from-yellow-400 to-yellow-600' }
    if (score >= 90) return { emoji: '🏆', text: 'Masterpiece', color: 'from-neon-cyan to-blue-400' }
    return { emoji: '⭐', text: 'Excellent', color: 'from-neon-pink to-purple-400' }
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
        <title>Top Photos - Photo Judge</title>
        <meta name="description" content="Vos meilleures photos avec un score supérieur à 85" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-8 w-20 h-20 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-24 right-12 w-28 h-28 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-glow mb-4">
              🏆 Top{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Photos
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Vos{' '}
              <span className="text-neon-cyan font-semibold">chefs-d'œuvre</span>{' '}
              avec un score supérieur à{' '}
              <span className="text-neon-pink font-semibold">85/100</span>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/analyze')}
                className="btn-neon-pink"
              >
                📸 Analyser une photo
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          {topPhotos.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-text-white mb-4">
                Aucune top photo pour le moment
              </h3>
              <p className="text-text-gray mb-6">
                Uploadez des photos et obtenez un score de{' '}
                <span className="text-neon-pink font-semibold">85+</span>{' '}
                pour les voir apparaître ici !
              </p>
              <button
                onClick={() => router.push('/analyze')}
                className="btn-neon-pink"
              >
                Commencer l'analyse
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topPhotos.map((photo) => {
                const badge = getScoreBadge(photo.score)
                return (
                  <div
                    key={photo.id}
                    className="glass-card p-4 hover-glow group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="relative">
                      <Image
                        src={photo.url}
                        alt={photo.filename}
                        width={400}
                        height={300}
                        className="rounded-lg w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Badge score */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${badge.color} text-white shadow-lg`}>
                        <span className="mr-1">{badge.emoji}</span>
                        {photo.score}/100
                      </div>
                      
                      {/* Boutons actions */}
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePhoto(photo.id)
                          }}
                          className="bg-red-500/80 backdrop-blur-sm border border-red-400 p-2 rounded-full hover:bg-red-500 transition-colors duration-300 text-white text-sm"
                          title="Supprimer cette photo"
                        >
                          ✕
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCollectionModalPhoto(photo)
                          }}
                          className="bg-cosmic-glass backdrop-blur-sm border border-cosmic-glassborder p-2 rounded-full hover:bg-cosmic-glassborder transition-colors duration-300 text-neon-cyan hover:text-white text-sm"
                          title="Ajouter à une collection"
                        >
                          📁
                        </button>
                        <FavoriteButton
                          photoId={photo.id}
                          initialIsFavorite={photo.isFavorite}
                          onToggle={(isFavorite) => handleFavoriteToggle(photo.id, isFavorite)}
                          size="sm"
                        />
                      </div>
                      
                      {/* Badge type */}
                      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-cosmic-glass backdrop-blur-sm border border-cosmic-glassborder text-xs text-text-white">
                        {badge.text}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h3 className="text-text-white font-semibold truncate">
                        {photo.filename}
                      </h3>
                      <div className="flex justify-between items-center text-sm text-text-muted">
                        <span>
                          {new Date(photo.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span>{photo.favoriteCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal photo détail */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-cosmic-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="glass-card p-6 max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-text-white">
                  {selectedPhoto.filename}
                </h3>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="btn-neon-secondary text-lg px-3 py-1"
                >
                  ×
                </button>
              </div>
              
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                width={800}
                height={600}
                className="rounded-lg w-full h-auto object-contain"
              />
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {(() => {
                    const badge = getScoreBadge(selectedPhoto.score)
                    return (
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white font-bold`}>
                        {badge.emoji} {selectedPhoto.score}/100 - {badge.text}
                      </div>
                    )
                  })()}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="bg-red-500/80 text-white px-4 py-2 rounded-lg border border-red-400 hover:bg-red-500 transition-colors flex items-center space-x-2"
                  >
                    <span>✕</span>
                    <span>Supprimer</span>
                  </button>
                  <button
                    onClick={() => setCollectionModalPhoto(selectedPhoto)}
                    className="btn-neon-secondary flex items-center space-x-2"
                  >
                    <span>📁</span>
                    <span>Ajouter à collection</span>
                  </button>
                  <FavoriteButton
                    photoId={selectedPhoto.id}
                    initialIsFavorite={selectedPhoto.isFavorite}
                    onToggle={(isFavorite) => handleFavoriteToggle(selectedPhoto.id, isFavorite)}
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal ajouter à collection */}
        {collectionModalPhoto && (
          <AddToCollectionModal
            isOpen={!!collectionModalPhoto}
            onClose={() => setCollectionModalPhoto(null)}
            photoId={collectionModalPhoto.id}
            photoName={collectionModalPhoto.filename}
          />
        )}
      </main>
    </>
  )
}