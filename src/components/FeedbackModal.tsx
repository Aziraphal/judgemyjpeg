import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  initialPage?: string
}

export default function FeedbackModal({ isOpen, onClose, initialPage }: FeedbackModalProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    type: 'general',
    category: '',
    rating: 0,
    title: '',
    message: '',
    email: session?.user?.email || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const feedbackTypes = [
    { value: 'love', label: '❤️ J\'adore !', emoji: '❤️' },
    { value: 'bug', label: '🐛 Bug/Problème', emoji: '🐛' },
    { value: 'feature', label: '💡 Nouvelle idée', emoji: '💡' },
    { value: 'confusion', label: '😕 C\'est confus', emoji: '😕' },
    { value: 'general', label: '💬 Autre', emoji: '💬' }
  ]

  const categories = [
    { value: 'interface', label: 'Interface utilisateur' },
    { value: 'ai_analysis', label: 'Analyse IA' },
    { value: 'performance', label: 'Performance/Vitesse' },
    { value: 'pricing', label: 'Tarifs/Abonnement' },
    { value: 'mobile', label: 'Version mobile' },
    { value: 'other', label: 'Autre' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!formData.message.trim()) {
      alert('Veuillez écrire un message')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          page: initialPage || window.location.pathname
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setFormData({
            type: 'general',
            category: '',
            rating: 0,
            title: '',
            message: '',
            email: session?.user?.email || ''
          })
        }, 2000)
      } else {
        alert(result.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Feedback error:', error)
      alert('Erreur réseau. Réessayez plus tard.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-4">Merci !</h3>
            <p className="text-text-gray">
              Votre feedback nous aide énormément à améliorer JudgeMyJPEG.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-cosmic-glassborder">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-white">
                  💬 <span className="text-neon-cyan">Donnez votre avis</span>
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-text-gray mt-2">
                Votre feedback brut nous aide à comprendre ce qui fonctionne (ou pas) !
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Type de feedback */}
              <div>
                <label className="block text-text-white font-semibold mb-3">
                  Type de feedback
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.value})}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        formData.type === type.value
                          ? 'border-neon-cyan bg-neon-cyan bg-opacity-10 text-neon-cyan'
                          : 'border-cosmic-glassborder text-text-white hover:border-neon-cyan hover:border-opacity-50 hover:text-neon-cyan'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.emoji}</div>
                      <div className="text-xs">{type.label.replace(/^[^A-Za-z]*/, '')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating (si c'est du love) */}
              {formData.type === 'love' && (
                <div>
                  <label className="block text-text-white font-semibold mb-3">
                    Note globale
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className={`text-2xl transition-colors ${
                          star <= formData.rating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Catégorie */}
              <div>
                <label className="block text-text-white font-semibold mb-3">
                  Concernant quelle partie ?
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 bg-cosmic-dark border border-cosmic-glassborder rounded-lg text-text-white focus:border-neon-cyan focus:outline-none [&>option]:bg-cosmic-dark [&>option]:text-text-white"
                >
                  <option value="">Sélectionnez...</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Titre (optionnel) */}
              <div>
                <label className="block text-text-white font-semibold mb-3">
                  Titre (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Résumé en quelques mots..."
                  className="w-full p-3 bg-cosmic-dark border border-cosmic-glassborder rounded-lg text-text-white focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* Message principal */}
              <div>
                <label className="block text-text-white font-semibold mb-3">
                  Votre message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Décrivez ce que vous pensez, ce qui vous pose problème, vos idées d'amélioration... Soyez franc, c'est exactement ce qu'on veut entendre !"
                  rows={4}
                  className="w-full p-3 bg-cosmic-dark border border-cosmic-glassborder rounded-lg text-text-white focus:border-neon-cyan focus:outline-none resize-none"
                />
                <div className="text-right text-sm text-text-muted mt-1">
                  {formData.message.length}/2000
                </div>
              </div>

              {/* Email (si pas connecté) */}
              {!session && (
                <div>
                  <label className="block text-text-white font-semibold mb-3">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Pour vous répondre si besoin..."
                    className="w-full p-3 bg-cosmic-dark border border-cosmic-glassborder rounded-lg text-text-white focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              )}

              {/* Boutons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-cosmic-glassborder rounded-lg text-text-white hover:text-neon-cyan hover:border-neon-cyan transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim()}
                  className="flex-1 btn-neon-pink py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner-neon w-4 h-4"></div>
                      <span>Envoi...</span>
                    </div>
                  ) : (
                    'Envoyer'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}