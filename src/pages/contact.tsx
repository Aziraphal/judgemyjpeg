import { useState } from 'react'
import Head from 'next/head'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'support',
    message: '',
    priority: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const categories = [
    { id: 'support', name: '🛠️ Support Technique', description: 'Problèmes d\'utilisation, bugs, erreurs' },
    { id: 'billing', name: '💳 Facturation', description: 'Questions sur les abonnements, paiements' },
    { id: 'feature', name: '💡 Suggestion', description: 'Idées d\'amélioration, nouvelles fonctionnalités' },
    { id: 'bug', name: '🐛 Signaler un Bug', description: 'Dysfonctionnements, erreurs rencontrées' },
    { id: 'business', name: '🤝 Partenariat', description: 'Collaboration, intégration, API' },
    { id: 'legal', name: '⚖️ Question Légale', description: 'Confidentialité, RGPD, conditions d\'utilisation' },
    { id: 'abuse', name: '🚨 Signalement', description: 'Contenu inapproprié, violation des règles' },
    { id: 'other', name: '📧 Autre', description: 'Toute autre question' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulation d'envoi - À remplacer par votre API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Ici, vous intégrerez votre service d'email (Resend, SendGrid, etc.)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'support',
          message: '',
          priority: 'normal'
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Erreur envoi formulaire:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      <Head>
        <title>Contact & Support | Aide analyse photo IA - JudgeMyJPEG</title>
        <meta name="description" content="Besoin d'aide avec l'analyse de vos photos ? Contactez notre support technique. Questions sur l'abonnement, bugs ou suggestions d'amélioration." />
      </Head>

      <main className="min-h-screen bg-cosmic-overlay particles-container relative">
        <div className="container mx-auto px-4 py-12 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text">
                Contact & Support
              </span>
            </h1>
            <p className="text-text-gray max-w-2xl mx-auto">
              Une question ? Un problème ? Notre équipe est là pour vous aider !
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => window.history.back()}
              className="btn-neon-secondary"
            >
              ← Retour
            </button>
          </div>

          <div className="max-w-6xl mx-auto">
            
            {/* Liens rapides */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-neon-cyan mb-6 text-center">🚀 Aide Rapide</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <a 
                  href="/faq" 
                  className="glass-card p-4 text-center hover:scale-105 transition-transform hover-glow group"
                >
                  <div className="text-3xl mb-2 group-hover:animate-pulse">❓</div>
                  <h3 className="font-semibold text-neon-cyan mb-1">FAQ</h3>
                  <p className="text-xs text-text-gray">Questions fréquentes</p>
                </a>
                
                <a 
                  href="/legal/terms" 
                  className="glass-card p-4 text-center hover:scale-105 transition-transform hover-glow group"
                >
                  <div className="text-3xl mb-2 group-hover:animate-pulse">📋</div>
                  <h3 className="font-semibold text-neon-cyan mb-1">CGU</h3>
                  <p className="text-xs text-text-gray">Conditions d'utilisation</p>
                </a>
                
                <a 
                  href="/legal/privacy" 
                  className="glass-card p-4 text-center hover:scale-105 transition-transform hover-glow group"
                >
                  <div className="text-3xl mb-2 group-hover:animate-pulse">🔒</div>
                  <h3 className="font-semibold text-neon-cyan mb-1">Confidentialité</h3>
                  <p className="text-xs text-text-gray">Protection des données</p>
                </a>
                
                <a 
                  href="/pricing" 
                  className="glass-card p-4 text-center hover:scale-105 transition-transform hover-glow group"
                >
                  <div className="text-3xl mb-2 group-hover:animate-pulse">💎</div>
                  <h3 className="font-semibold text-neon-cyan mb-1">Tarifs</h3>
                  <p className="text-xs text-text-gray">Plans et abonnements</p>
                </a>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Formulaire de contact */}
              <div className="lg:col-span-2">
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold text-neon-pink mb-6">💬 Nous Contacter</h2>
                  
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-green-400 text-xl">✅</span>
                        <div>
                          <h3 className="font-semibold text-green-400">Message envoyé !</h3>
                          <p className="text-green-300 text-sm">Nous vous répondrons sous 2-6 heures en moyenne.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-red-400 text-xl">❌</span>
                        <div>
                          <h3 className="font-semibold text-red-400">Erreur d'envoi</h3>
                          <p className="text-red-300 text-sm">Veuillez réessayer ou nous contacter par email.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Informations personnelles */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-white mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:border-neon-cyan focus:outline-none"
                          placeholder="Votre nom"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-white mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:border-neon-cyan focus:outline-none"
                          placeholder="votre.email@exemple.com"
                        />
                      </div>
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Type de demande *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white focus:border-neon-cyan focus:outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-text-muted mt-1">
                        {categories.find(c => c.id === formData.category)?.description}
                      </p>
                    </div>

                    {/* Priorité */}
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Urgence
                      </label>
                      <div className="flex space-x-4">
                        {[
                          { id: 'low', name: '🟢 Faible', desc: 'Réponse sous 24-48h' },
                          { id: 'normal', name: '🟡 Normale', desc: 'Réponse sous 2-6h' },
                          { id: 'high', name: '🔴 Urgente', desc: 'Réponse prioritaire' }
                        ].map(priority => (
                          <label key={priority.id} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="priority"
                              value={priority.id}
                              checked={formData.priority === priority.id}
                              onChange={handleChange}
                              className="mr-2 text-neon-cyan"
                            />
                            <span className="text-sm text-text-white">{priority.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sujet */}
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Sujet *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:border-neon-cyan focus:outline-none"
                        placeholder="Résumé de votre demande en quelques mots"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-text-white mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-cosmic-glass border border-cosmic-glassborder rounded-lg text-text-white placeholder-text-muted focus:border-neon-cyan focus:outline-none resize-none"
                        placeholder="Décrivez votre demande en détail. Plus vous donnez d'informations, plus nous pourrons vous aider efficacement !"
                      />
                      <p className="text-xs text-text-muted mt-1">
                        Minimum 20 caractères ({formData.message.length}/20)
                      </p>
                    </div>

                    {/* Bouton d'envoi */}
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || formData.message.length < 20}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                          isSubmitting || formData.message.length < 20
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'btn-neon-pink hover-glow'
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center space-x-2">
                            <div className="spinner-neon w-4 h-4"></div>
                            <span>Envoi en cours...</span>
                          </span>
                        ) : (
                          '📧 Envoyer le message'
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-6">
                
                {/* Temps de réponse */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-neon-cyan mb-4">⏰ Temps de Réponse</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <span className="text-green-400">🟢</span>
                      <div>
                        <div className="font-medium text-text-white">Support général</div>
                        <div className="text-text-gray">2-6 heures</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-400">🔵</span>
                      <div>
                        <div className="font-medium text-text-white">Facturation</div>
                        <div className="text-text-gray">1-3 heures</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-red-400">🔴</span>
                      <div>
                        <div className="font-medium text-text-white">Urgences</div>
                        <div className="text-text-gray">&lt; 1 heure</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-4">
                    Horaires : 9h-18h (jours ouvrés, heure française)
                  </p>
                </div>

                {/* Contact direct */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-neon-pink mb-4">📞 Contact Direct</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-medium text-text-white mb-1">Support général</div>
                      <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-neon-cyan hover:underline">
                        contact.judgemyjpeg@gmail.com
                      </a>
                    </div>
                    <div>
                      <div className="font-medium text-text-white mb-1">Questions de facturation</div>
                      <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-neon-cyan hover:underline">
                        contact.judgemyjpeg@gmail.com
                      </a>
                    </div>
                    <div>
                      <div className="font-medium text-text-white mb-1">Partenariats</div>
                      <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-neon-cyan hover:underline">
                        contact.judgemyjpeg@gmail.com
                      </a>
                    </div>
                    <div>
                      <div className="font-medium text-text-white mb-1">Questions légales</div>
                      <a href="mailto:contact.judgemyjpeg@gmail.com" className="text-neon-cyan hover:underline">
                        contact.judgemyjpeg@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Conseils */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-neon-cyan mb-4">💡 Conseils</h3>
                  <div className="space-y-3 text-xs text-text-gray">
                    <p>
                      <strong className="text-text-white">Pour un support plus rapide :</strong>
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• Décrivez précisément votre problème</li>
                      <li>• Joignez des captures d'écran si possible</li>
                      <li>• Mentionnez votre navigateur et OS</li>
                      <li>• Indiquez votre plan d'abonnement</li>
                    </ul>
                    <p className="text-neon-pink text-xs mt-4">
                      ✨ Avant de nous contacter, consultez notre FAQ qui répond à 80% des questions !
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}