import { PhotoAnalysis } from '@/services/openai'
import ShareableImageGenerator from '@/components/ShareableImageGenerator'

interface SocialShareProps {
  photo: {
    filename: string
    url: string
  }
  analysis: PhotoAnalysis
  tone: 'professional' | 'roast'
}

export default function SocialShare({ photo, analysis, tone }: SocialShareProps) {
  const generateShareText = () => {
    const baseText = `🤖 JudgeMyJPEG a jugé ma photo : ${analysis.score}/100`
    
    if (tone === 'roast') {
      return `${baseText} 🔥 L'IA m'a grillé mais j'ai adoré ! 😂`
    } else {
      return `${baseText} 📸 Analyse pro par IA !`
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText = generateShareText()
  const hashtags = tone === 'roast' 
    ? '#JudgeMyJPEG #PhotoFail #IAhumour #Photography'
    : '#JudgeMyJPEG #PhotographyTips #AIAnalysis #Photography'

  const socialLinks = {
    instagram: {
      url: `https://www.instagram.com/`,
      icon: '📷',
      name: 'Instagram',
      color: 'hover:bg-pink-500/20 hover:text-pink-400',
      note: 'Copiez le lien pour partager'
    },
    twitter: {
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags.replace(/#/g, ''))}`,
      icon: '𝕏',
      name: 'Twitter / X',
      color: 'hover:bg-black/20 hover:text-white'
    },
    facebook: {
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      icon: 'f',
      name: 'Facebook', 
      color: 'hover:bg-blue-600/20 hover:text-blue-400'
    },
    linkedin: {
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
      icon: 'in',
      name: 'LinkedIn',
      color: 'hover:bg-blue-500/20 hover:text-blue-300'
    },
    reddit: {
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      icon: '🤖',
      name: 'Reddit',
      color: 'hover:bg-orange-500/20 hover:text-orange-400'
    },
    whatsapp: {
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      icon: '💬',
      name: 'WhatsApp',
      color: 'hover:bg-green-500/20 hover:text-green-400'
    }
  }

  const copyToClipboard = () => {
    const textToCopy = `${shareText}\n\n${shareUrl}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Feedback visuel simple
      const button = document.getElementById('copy-button')
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '✅ Copié !'
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      }
    })
  }

  return (
    <div className="glass-card p-6 hover-glow">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-text-white mb-2 flex items-center justify-center">
          <span className="text-2xl mr-2">🚀</span>
          Partager votre analyse
        </h3>
        <p className="text-text-gray text-sm">
          {tone === 'roast' 
            ? "Montrez comme l'IA vous a grillé ! 🔥" 
            : "Partagez vos insights photo ! 📸"
          }
        </p>
      </div>

      {/* Aperçu du texte de partage */}
      <div className="mb-6 p-4 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
        <div className="text-sm text-text-muted mb-2">Aperçu du partage :</div>
        <div className="text-text-white font-medium">{shareText}</div>
        <div className="text-xs text-neon-cyan mt-1">{hashtags}</div>
      </div>

      {/* Boutons de partage */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {Object.entries(socialLinks).map(([platform, config]) => (
          <a
            key={platform}
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center justify-center space-x-2 p-3 rounded-lg 
              bg-cosmic-glass border border-cosmic-glassborder
              transition-all duration-300 hover:scale-105 hover:shadow-neon-cyan/20 hover:shadow-lg
              ${config.color}
            `}
          >
            <span className="text-lg">{config.icon}</span>
            <span className="text-sm font-medium">{config.name}</span>
          </a>
        ))}
      </div>

      {/* Actions supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <button
          id="copy-button"
          onClick={copyToClipboard}
          className="btn-neon-secondary flex items-center space-x-2 justify-center"
        >
          <span>📋</span>
          <span>Copier le lien</span>
        </button>
        
        <div className="flex justify-center">
          <ShareableImageGenerator 
            photo={photo}
            analysis={analysis}
            tone={tone}
          />
        </div>
      </div>

      {/* Stats motivantes */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-4 text-xs text-text-muted">
          <div className="flex items-center space-x-1">
            <span>👀</span>
            <span>Viral potential: {tone === 'roast' ? 'ÉLEVÉ' : 'MOYEN'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⚡</span>
            <span>Score: {analysis.score}/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}