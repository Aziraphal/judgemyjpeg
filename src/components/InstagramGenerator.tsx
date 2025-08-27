import { useState } from 'react'
import { PhotoAnalysis } from '@/types/analysis'
import { InstagramGenerator, InstagramPost } from '@/services/instagram-generator'
import { logger } from '@/lib/logger'

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
      logger.error('Erreur génération Instagram:', error)
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
      logger.error('Erreur copie:', error)
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
      logger.error('Erreur génération multi:', error)
      alert('Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="glass-card p-4 sm:p-8 hover-glow">
      <h3 className="text-xl sm:text-2xl font-bold text-text-white mb-4 sm:mb-6 flex items-center">
        <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📱</span>
        <span className="text-neon-pink">Partage Instagram</span>
      </h3>

      {/* Sélecteur de style */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-base sm:text-lg font-semibold text-text-white mb-3 sm:mb-4">
          <span className="hidden sm:inline">Choisissez votre style :</span>
          <span className="sm:hidden">Style :</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(styles).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key as any)}
              className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                selectedStyle === key
                  ? 'border-neon-pink bg-neon-pink/20'
                  : 'border-cosmic-glassborder hover:border-neon-pink/50 bg-cosmic-glass'
              }`}
            >
              <div className="text-center">
                <div className="text-xl sm:text-2xl mb-1">{config.emoji}</div>
                <div className="text-text-white font-semibold text-xs sm:text-sm">{config.name}</div>
                <div className="text-text-muted text-xs hidden sm:block">{config.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 sm:gap-0 mb-4 sm:mb-6">
        <button
          onClick={generatePost}
          disabled={isGenerating}
          className="btn-neon-pink flex items-center justify-center space-x-2"
        >
          <span>📱</span>
          <span className="hidden sm:inline">{isGenerating ? 'Génération...' : 'Générer le post'}</span>
          <span className="sm:hidden">{isGenerating ? 'Génération...' : 'Générer'}</span>
        </button>
        
        <button
          onClick={generateAllVariants}
          disabled={isGenerating}
          className="btn-neon-secondary flex items-center justify-center space-x-2"
        >
          <span>📄</span>
          <span className="hidden sm:inline">Toutes les variantes</span>
          <span className="sm:hidden">Toutes</span>
        </button>
        
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-neon-secondary flex items-center justify-center space-x-2 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
        >
          <span>📷</span>
          <span className="hidden sm:inline">Ouvrir Instagram</span>
          <span className="sm:hidden">Instagram</span>
        </a>
      </div>

      {/* Preview */}
      {showPreview && generatedPost && (
        <div className="space-y-4 sm:space-y-6">
          <div className="border-t border-cosmic-glassborder pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-semibold text-neon-cyan mb-3 sm:mb-4">
              <span className="hidden sm:inline">Aperçu du post :</span>
              <span className="sm:hidden">Aperçu :</span>
            </h4>
            
            {/* Caption */}
            <div className="glass-card p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-text-white text-sm sm:text-base">Caption</h5>
                <button
                  onClick={() => copyToClipboard(generatedPost.caption, 'Caption')}
                  className="btn-neon-secondary text-xs px-2 sm:px-3 py-1"
                >
                  <span className="hidden sm:inline">📋 Copier</span>
                  <span className="sm:hidden">📋</span>
                </button>
              </div>
              <div className="bg-cosmic-overlay p-2 sm:p-3 rounded text-xs sm:text-sm text-text-gray whitespace-pre-wrap">
                {generatedPost.caption}
              </div>
            </div>

            {/* Hashtags */}
            <div className="glass-card p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-text-white text-sm sm:text-base">Hashtags</h5>
                <button
                  onClick={() => copyToClipboard(generatedPost.hashtags.join(' '), 'Hashtags')}
                  className="btn-neon-secondary text-xs px-2 sm:px-3 py-1"
                >
                  <span className="hidden sm:inline">📋 Copier</span>
                  <span className="sm:hidden">📋</span>
                </button>
              </div>
              <div className="bg-cosmic-overlay p-2 sm:p-3 rounded text-xs sm:text-sm text-text-gray">
                {generatedPost.hashtags.join(' ')}
              </div>
            </div>

            {/* Story */}
            <div className="glass-card p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-text-white text-sm sm:text-base">
                  <span className="hidden sm:inline">Story Instagram</span>
                  <span className="sm:hidden">Story</span>
                </h5>
                <button
                  onClick={() => copyToClipboard(generatedPost.storyText, 'Story')}
                  className="btn-neon-secondary text-xs px-2 sm:px-3 py-1"
                >
                  <span className="hidden sm:inline">📋 Copier</span>
                  <span className="sm:hidden">📋</span>
                </button>
              </div>
              <div className="bg-cosmic-overlay p-2 sm:p-3 rounded text-xs sm:text-sm text-text-gray whitespace-pre-wrap">
                {generatedPost.storyText}
              </div>
            </div>

            {/* Carousel Slides si disponible */}
            {generatedPost.carouselSlides && generatedPost.carouselSlides.length > 0 && (
              <div className="glass-card p-3 sm:p-4">
                <h5 className="font-semibold text-text-white mb-3 text-sm sm:text-base">
                  <span className="hidden sm:inline">Slides pour Carousel</span>
                  <span className="sm:hidden">Carousel</span>
                </h5>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {generatedPost.carouselSlides.map((slide, index) => (
                    <div key={index} className="bg-cosmic-overlay p-2 sm:p-3 rounded">
                      <div className="text-center mb-2">
                        <span className="text-xl sm:text-2xl">{slide.emoji}</span>
                        <h6 className="font-semibold text-text-white text-xs sm:text-sm">{slide.title}</h6>
                      </div>
                      <div className="text-xs text-text-gray">{slide.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conseils d'utilisation */}
          <div className="glass-card p-3 sm:p-4 border border-neon-cyan/30">
            <h5 className="font-semibold text-neon-cyan mb-2 flex items-center text-sm sm:text-base">
              <span className="mr-2">💡</span>
              <span className="hidden sm:inline">Conseils d'utilisation</span>
              <span className="sm:hidden">Conseils</span>
            </h5>
            <ul className="text-xs sm:text-sm text-text-gray space-y-1">
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