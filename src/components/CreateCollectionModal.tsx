import { useState } from 'react'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCollectionCreated: (collection: any) => void
}

const COLLECTION_COLORS = [
  { name: 'Rose Neon', value: '#FF006E', bg: 'bg-[#FF006E]' },
  { name: 'Cyan Neon', value: '#00F5FF', bg: 'bg-[#00F5FF]' },
  { name: 'Violet', value: '#8B5CF6', bg: 'bg-violet-500' },
  { name: 'Emerald', value: '#10B981', bg: 'bg-emerald-500' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-amber-500' },
  { name: 'Rouge', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Bleu', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
]

export default function CreateCollectionModal({ isOpen, onClose, onCollectionCreated }: CreateCollectionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0].value)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color: selectedColor,
        })
      })

      if (response.ok) {
        const data = await response.json()
        onCollectionCreated(data.collection)
        resetForm()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedColor(COLLECTION_COLORS[0].value)
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-cosmic-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-text-white flex items-center">
            <span className="text-3xl mr-2">📁</span>
            Nouvelle Collection
          </h3>
          <button
            onClick={handleClose}
            className="btn-neon-secondary text-lg px-3 py-1"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom de la collection */}
          <div>
            <label className="block text-text-white font-medium mb-2">
              Nom de la collection *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Portraits, Paysages, Street Photo..."
              className="input-cosmic w-full"
              maxLength={50}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-text-white font-medium mb-2">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre collection..."
              className="input-cosmic w-full h-20 resize-none"
              maxLength={200}
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-text-white font-medium mb-3">
              Couleur de la collection
            </label>
            <div className="grid grid-cols-4 gap-3">
              {COLLECTION_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${color.bg}
                    ${selectedColor === color.value 
                      ? 'border-text-white shadow-neon-cyan scale-110' 
                      : 'border-cosmic-glassborder hover:border-text-white hover:scale-105'
                    }
                  `}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="glass-card p-3 border border-red-500/50 bg-red-500/10">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-neon-secondary flex-1"
              disabled={isCreating}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="btn-neon-pink flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <div className="spinner-neon w-4 h-4 mr-2"></div>
                  Création...
                </span>
              ) : (
                'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}