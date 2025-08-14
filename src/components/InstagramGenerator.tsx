import { useState } from 'react'
import { PhotoAnalysis } from '@/services/openai'
import { InstagramGenerator, InstagramPost } from '@/services/instagram-generator'

interface InstagramGeneratorProps {
  photo: {
    id: string
    url: string
    filename: string
    createdAt: string
  }
  analysis: PhotoAnalysis
}

export default function InstagramGeneratorComponent({ photo, analysis }: InstagramGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<'minimal' | 'tips' | 'storytelling' | 'professional'>('tips')
  const [generatedPost, setGeneratedPost] = useState<InstagramPost | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const styles = {
    minimal: { name: 'Minimal', emoji: '✨', desc: 'Simple et épuré' },
    tips: { name: 'Conseils', emoji: '💡', desc: 'Éducatif avec tips' },
    storytelling: { name: 'Histoire', emoji: '📖', desc: 'Narratif et émotionnel' },
    professional: { name: 'Pro', emoji: '📊', desc: 'Technique détaillé' }
  }

  const generatePost = async () => {
    setIsGenerating(true)
    try {
      const post = await InstagramGenerator.generatePost(
        { filename: photo.filename, url: photo.url },
        analysis,
        selectedStyle
      )
      setGeneratedPost(post)
      setShowPreview(true)
    } catch (error) {
      console.error('Erreur génération Instagram:', error)
      alert('Erreur lors de la génération du post')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${type} copié dans le presse-papier !`)
    } catch (error) {
      console.error('Erreur copie:', error)
      alert('Erreur lors de la copie')
    }
  }

  const generateAllVariants = async () => {
    setIsGenerating(true)
    try {
      const variants = await InstagramGenerator.generateMultipleVariants(
        { filename: photo.filename, url: photo.url },
        analysis
      )
      
      // Créer un fichier texte avec toutes les variantes
      const allContent = Object.entries(variants).map(([style, post]) => {
        return `=== ${styles[style as keyof typeof styles].name.toUpperCase()} ===\n\n${post.caption}\n\nHashtags: ${post.hashtags.join(' ')}\n\nStory: ${post.storyText}\n\n`
      }).join('\n')
      
      // Télécharger comme fichier
      const blob = new Blob([allContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `instagram-posts-${photo.filename.replace(/\.[^/.]+$/, "")}.txt`
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erreur génération multi:', error)
      alert('Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="glass-card p-8 hover-glow">
      <h3 className="text-2xl font-bold text-text-white mb-6 flex items-center">
        <span className="text-3xl mr-3">📱</span>
        <span className="text-neon-pink">Partage Instagram</span>
      </h3>

      {/* Sélecteur de style */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-text-white mb-4">Choisissez votre style :</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(styles).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key as any)}
              className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                selectedStyle === key
                  ? 'border-neon-pink bg-neon-pink/20'
                  : 'border-cosmic-glassborder hover:border-neon-pink/50 bg-cosmic-glass'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{config.emoji}</div>
                <div className="text-text-white font-semibold text-sm">{config.name}</div>
                <div className="text-text-muted text-xs">{config.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={generatePost}
          disabled={isGenerating}
          className="btn-neon-pink flex items-center space-x-2"
        >
          <span>📱</span>
          <span>{isGenerating ? 'Génération...' : 'Générer le post'}</span>
        </button>
        
        <button
          onClick={generateAllVariants}
          disabled={isGenerating}
          className="btn-neon-secondary flex items-center space-x-2"
        >
          <span>📄</span>
          <span>Toutes les variantes</span>
        </button>
      </div>

      {/* Preview */}
      {showPreview && generatedPost && (
        <div className="space-y-6">
          <div className="border-t border-cosmic-glassborder pt-6">
            <h4 className="text-lg font-semibold text-neon-cyan mb-4">Aperçu du post :</h4>
            
            {/* Caption */}
            <div className="glass-card p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-text-white">Caption</h5>
                <button
                  onClick={() => copyToClipboard(generatedPost.caption, 'Caption')}
                  className="btn-neon-secondary text-xs px-3 py-1"
                >
                  📋 Copier
                </button>
              </div>
              <div className="bg-cosmic-overlay p-3 rounded text-sm text-text-gray whitespace-pre-wrap">
                {generatedPost.caption}
              </div>
            </div>

            {/* Hashtags */}
            <div className="glass-card p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-text-white">Hashtags</h5>
                <button
                  onClick={() => copyToClipboard(generatedPost.hashtags.join(' '), 'Hashtags')}
                  className="btn-neon-secondary text-xs px-3 py-1"
                >
                  📋 Copier
                </button>
              </div>
              <div className="bg-cosmic-overlay p-3 rounded text-sm text-text-gray">
                {generatedPost.hashtags.join(' ')}
              </div>
            </div>

            {/* Story */}
            <div className="glass-card p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-text-white">Story Instagram</h5>
                <button
                  onClick={() => copyToClipboard(generatedPost.storyText, 'Story')}
                  className="btn-neon-secondary text-xs px-3 py-1"
                >
                  📋 Copier
                </button>
              </div>
              <div className="bg-cosmic-overlay p-3 rounded text-sm text-text-gray whitespace-pre-wrap">
                {generatedPost.storyText}
              </div>
            </div>

            {/* Carousel Slides si disponible */}
            {generatedPost.carouselSlides && generatedPost.carouselSlides.length > 0 && (
              <div className="glass-card p-4">
                <h5 className="font-semibold text-text-white mb-3">Slides pour Carousel</h5>
                <div className="grid md:grid-cols-3 gap-3">
                  {generatedPost.carouselSlides.map((slide, index) => (
                    <div key={index} className="bg-cosmic-overlay p-3 rounded">
                      <div className="text-center mb-2">
                        <span className="text-2xl">{slide.emoji}</span>
                        <h6 className="font-semibold text-text-white text-sm">{slide.title}</h6>
                      </div>
                      <div className="text-xs text-text-gray">{slide.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conseils d'utilisation */}
          <div className="glass-card p-4 border border-neon-cyan/30">
            <h5 className="font-semibold text-neon-cyan mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Conseils d'utilisation
            </h5>
            <ul className="text-sm text-text-gray space-y-1">
              <li>• Adaptez le texte à votre style personnel</li>
              <li>• Ajoutez vos hashtags spécifiques à votre niche</li>
              <li>• Postez aux heures où votre audience est active</li>
              <li>• Engagez avec votre communauté dans les commentaires</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}