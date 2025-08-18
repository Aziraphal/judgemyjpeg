import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import CreateCollectionModal from '@/components/CreateCollectionModal'
import FavoriteButton from '@/components/FavoriteButton'

interface Photo {
  id: string
  url: string
  filename: string
  score: number
  createdAt: string
  isFavorite?: boolean
  analysis?: string
  improvements?: string
  suggestions?: string
}

interface Collection {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
  _count: { items: number }
  items: Array<{
    id: string
    addedAt: string
    photo: Photo
  }>
}

export default function CollectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (session) {
      fetchCollections()
    }
  }, [session, status])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections)
      }
    } catch (error) {
      console.error('Erreur chargement collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectionCreated = (newCollection: Collection) => {
    setCollections(prev => [newCollection, ...(prev || [])])
  }

  const handleRemoveFromCollection = async (collectionId: string, photoId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })

      if (response.ok) {
        // Mettre à jour la collection sélectionnée
        if (selectedCollection && selectedCollection.id === collectionId) {
          setSelectedCollection(prev => prev ? {
            ...prev,
            items: prev.items.filter(item => item.photo.id !== photoId),
            _count: { items: prev._count.items - 1 }
          } : null)
        }

        // Mettre à jour la liste des collections
        setCollections(prev => 
          prev.map(col => 
            col.id === collectionId 
              ? { 
                  ...col, 
                  _count: { items: col._count.items - 1 },
                  items: col.items.filter(item => item.photo.id !== photoId)
                }
              : col
          )
        )
      }
    } catch (error) {
      console.error('Erreur suppression photo:', error)
    }
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
        <title>Collections - Photo Judge</title>
        <meta name="description" content="Organisez vos photos en collections personnalisées" />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-4 sm:left-12 w-16 sm:w-24 h-16 sm:h-24 bg-glow-pink rounded-full blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-32 right-4 sm:right-8 w-20 sm:w-32 h-20 sm:h-32 bg-glow-cyan rounded-full blur-xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-glow mb-4">
              📁{' '}
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Collections
              </span>
            </h1>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              Organisez vos{' '}
              <span className="text-neon-cyan font-semibold">photos</span>{' '}
              par thème, style ou{' '}
              <span className="text-neon-pink font-semibold">projet</span>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
            <button
              onClick={() => router.push('/')}
              className="btn-neon-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à l'accueil</span>
            </button>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-neon-pink flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nouvelle Collection</span>
            </button>
          </div>

          {/* Vue principale */}
          {!selectedCollection ? (
            // Liste des collections
            <div>
              {collections.length === 0 ? (
                <div className="glass-card p-12 text-center max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">📂</div>
                  <h3 className="text-2xl font-bold text-text-white mb-4">
                    Aucune collection pour le moment
                  </h3>
                  <p className="text-text-gray mb-6">
                    Créez votre première collection pour organiser vos photos par{' '}
                    <span className="text-neon-pink font-semibold">thème</span>,{' '}
                    <span className="text-neon-cyan font-semibold">style</span> ou projet
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-neon-pink"
                  >
                    ➕ Créer ma première collection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(collections || []).map((collection) => (
                    <div
                      key={collection.id}
                      className="glass-card p-6 hover-glow group cursor-pointer"
                      onClick={() => setSelectedCollection(collection)}
                    >
                      {/* Header collection */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: collection.color }}
                        />
                        <h3 className="text-xl font-bold text-text-white truncate">
                          {collection.name}
                        </h3>
                      </div>

                      {/* Description */}
                      {collection.description && (
                        <p className="text-text-gray text-sm mb-4 line-clamp-2">
                          {collection.description}
                        </p>
                      )}

                      {/* Preview photos */}
                      <div className="mb-4">
                        {(collection.items || []).length > 0 ? (
                          <div className="grid grid-cols-3 gap-1">
                            {(collection.items || []).slice(0, 3).map((item, index) => (
                              <div
                                key={item.id}
                                className="aspect-square relative rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300"
                              >
                                <Image
                                  src={item.photo.url}
                                  alt={item.photo.filename}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-20 bg-cosmic-glass rounded-lg flex items-center justify-center">
                            <span className="text-text-muted text-sm">Aucune photo</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted">
                          {collection._count.items} photo{collection._count.items !== 1 ? 's' : ''}
                        </span>
                        <span className="text-text-muted">
                          {new Date(collection.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Vue détail d'une collection
            <div>
              {/* Header collection détail */}
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedCollection(null)}
                      className="btn-neon-secondary text-lg px-3 py-2"
                    >
                      ←
                    </button>
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: selectedCollection.color }}
                    />
                    <div>
                      <h2 className="text-3xl font-bold text-text-white">
                        {selectedCollection.name}
                      </h2>
                      {selectedCollection.description && (
                        <p className="text-text-gray">
                          {selectedCollection.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neon-cyan">
                      {selectedCollection._count.items}
                    </div>
                    <div className="text-text-muted text-sm">
                      photo{selectedCollection._count.items !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos de la collection */}
              {(selectedCollection.items || []).length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="text-6xl mb-6">📷</div>
                  <h3 className="text-2xl font-bold text-text-white mb-4">
                    Collection vide
                  </h3>
                  <p className="text-text-gray mb-6">
                    Cette collection ne contient pas encore de photos
                  </p>
                  <button
                    onClick={() => router.push('/analyze')}
                    className="btn-neon-pink"
                  >
                    📸 Analyser une photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(selectedCollection.items || []).map((item) => (
                    <div key={item.id} className="glass-card p-4 hover-glow group">
                      <div className="relative">
                        <Image
                          src={item.photo.url}
                          alt={item.photo.filename}
                          width={400}
                          height={300}
                          className="rounded-lg w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => setSelectedPhoto(item.photo)}
                        />
                        
                        {/* Score badge */}
                        {item.photo.score && (
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-cosmic-glass backdrop-blur-sm border border-cosmic-glassborder text-xs text-text-white">
                            {item.photo.score}/100
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <FavoriteButton
                            photoId={item.photo.id}
                            initialIsFavorite={item.photo.isFavorite || false}
                            size="sm"
                          />
                          <button
                            onClick={() => handleRemoveFromCollection(selectedCollection.id, item.photo.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-cosmic-glass backdrop-blur-sm border border-cosmic-glassborder text-text-muted hover:text-red-400 hover:border-red-400/50 transition-all duration-300"
                            title="Retirer de la collection"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <h3 className="text-text-white font-semibold truncate">
                          {item.photo.filename}
                        </h3>
                        <div className="flex justify-between items-center text-sm text-text-muted">
                          <span>
                            Ajouté le {new Date(item.addedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal création collection */}
        <CreateCollectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCollectionCreated={handleCollectionCreated}
        />

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
                    <div className={`text-lg font-bold ${selectedPhoto.score >= 85 ? 'text-green-400' : selectedPhoto.score >= 70 ? 'text-yellow-400' : selectedPhoto.score >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                      🎯 {selectedPhoto.score}/100
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
                    if (!selectedPhoto.analysis) return <p className="text-text-gray">Aucune analyse disponible</p>
                    
                    let analysis
                    try {
                      analysis = JSON.parse(selectedPhoto.analysis)
                    } catch {
                      return <p className="text-text-gray">Analyse non disponible</p>
                    }
                    
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
      </main>
    </>
  )
}