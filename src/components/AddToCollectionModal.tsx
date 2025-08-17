import { useState, useEffect } from 'react'
import CreateCollectionModal from './CreateCollectionModal'

interface Collection {
  id: string
  name: string
  description?: string
  color: string
  _count: { items: number }
}

interface AddToCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  photoId: string
  photoName: string
}

export default function AddToCollectionModal({ isOpen, onClose, photoId, photoName }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen])

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

  const handleAddToCollection = async (collectionId: string) => {
    setAdding(collectionId)

    try {
      const response = await fetch(`/api/collections/${collectionId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })

      if (response.ok) {
        // Mettre à jour le compteur de la collection
        setCollections(prev => 
          prev.map(col => 
            col.id === collectionId 
              ? { ...col, _count: { items: col._count.items + 1 } }
              : col
          )
        )
        
        // Fermer le modal après un délai
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      alert('Erreur de connexion')
    } finally {
      setAdding(null)
    }
  }

  const handleCollectionCreated = (newCollection: Collection) => {
    try {
      setCollections(prev => [newCollection, ...prev])
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Erreur mise à jour collections:', error)
      // Fallback: rechargement complet des collections
      fetchCollections()
      setIsCreateModalOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-cosmic-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-6 w-full max-w-md max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-white flex items-center">
              <span className="text-2xl mr-2">📁</span>
              Ajouter à une collection
            </h3>
            <p className="text-text-muted text-sm mt-1">
              {photoName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-neon-secondary text-lg px-3 py-1"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner-neon w-8 h-8"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📂</div>
            <p className="text-text-gray mb-4">
              Aucune collection trouvée
            </p>
            <p className="text-text-muted text-sm mb-6">
              Créez votre première collection pour organiser vos photos
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-neon-pink mx-auto flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Créer une collection</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bouton créer nouvelle collection */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full glass-card p-4 text-left transition-all duration-300 hover:bg-cosmic-glassborder hover:scale-102 border-2 border-dashed border-cosmic-glassborder"
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-neon-pink flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-white">➕</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-neon-pink font-medium">
                    Nouvelle collection
                  </h4>
                  <p className="text-text-muted text-sm">
                    Créer une nouvelle collection
                  </p>
                </div>
                <span className="text-neon-pink">→</span>
              </div>
            </button>

            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={adding !== null}
                className={`
                  w-full glass-card p-4 text-left transition-all duration-300
                  hover:bg-cosmic-glassborder hover:scale-102
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${adding === collection.id ? 'animate-pulse' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: collection.color }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-text-white font-medium truncate">
                      {collection.name}
                    </h4>
                    {collection.description && (
                      <p className="text-text-muted text-sm truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-text-muted text-sm">
                      {collection._count.items} photo{collection._count.items !== 1 ? 's' : ''}
                    </span>
                    
                    {adding === collection.id ? (
                      <div className="spinner-neon w-4 h-4"></div>
                    ) : (
                      <span className="text-neon-cyan">→</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cosmic-glassborder">
          <p className="text-text-muted text-xs text-center">
            💡 Tip: Organisez vos photos par thème, style ou projet
          </p>
        </div>
      </div>

      {/* Modal création de collection */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCollectionCreated={handleCollectionCreated}
      />
    </div>
  )
}