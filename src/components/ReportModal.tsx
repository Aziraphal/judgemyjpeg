import { useState } from 'react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  photoId?: string
  photoUrl?: string
}

export default function ReportModal({ isOpen, onClose, photoId, photoUrl }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reportReasons = [
    { id: 'nudity', label: 'Nudité ou contenu sexuel' },
    { id: 'violence', label: 'Violence ou contenu choquant' },
    { id: 'hate', label: 'Discours de haine ou discrimination' },
    { id: 'illegal', label: 'Contenu illégal' },
    { id: 'harassment', label: 'Harcèlement' },
    { id: 'privacy', label: 'Violation de la vie privée' },
    { id: 'spam', label: 'Spam ou contenu indésirable' },
    { id: 'other', label: 'Autre raison' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId,
          photoUrl,
          reason,
          details,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setReason('')
          setDetails('')
        }, 2000)
      } else {
        throw new Error('Erreur lors du signalement')
      }
    } catch (error) {
      console.error('Erreur signalement:', error)
      alert('Erreur lors du signalement. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-cosmic-glass backdrop-blur-lg border border-cosmic-glassborder rounded-lg p-6 w-full max-w-md mx-4">
        
        {submitted ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-neon-cyan mb-2">Signalement envoyé</h2>
            <p className="text-text-gray">
              Merci de nous aider à maintenir un environnement sain.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neon-cyan">🚨 Signaler un contenu</h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Prévisualisation si disponible */}
            {photoUrl && (
              <div className="mb-4">
                <img 
                  src={photoUrl} 
                  alt="Contenu signalé" 
                  className="w-full h-32 object-cover rounded border border-cosmic-glassborder"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-white mb-2">
                  Raison du signalement *
                </label>
                <div className="space-y-2">
                  {reportReasons.map((reasonOption) => (
                    <label key={reasonOption.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={reasonOption.id}
                        checked={reason === reasonOption.id}
                        onChange={(e) => setReason(e.target.value)}
                        className="mr-3 text-neon-cyan focus:ring-neon-cyan"
                      />
                      <span className="text-text-gray text-sm">{reasonOption.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-white mb-2">
                  Détails supplémentaires
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Décrivez le problème (optionnel)..."
                  className="w-full px-3 py-2 bg-cosmic-glass border border-cosmic-glassborder rounded text-text-white placeholder-text-muted focus:border-neon-cyan focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <p className="text-yellow-300 text-xs">
                  ⚠️ Les signalements abusifs peuvent entraîner des restrictions sur votre compte.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!reason || isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Envoi...' : 'Signaler'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}