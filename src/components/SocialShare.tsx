import { PhotoAnalysis } from '@/types/analysis'
import ShareableImageGenerator from '@/components/ShareableImageGenerator'

interface SocialShareProps {
  photo: {
    filename: string
    url: string
  }
  analysis: PhotoAnalysis
  tone: 'professional' | 'roast' | 'artcritic'
}

export default function SocialShare({ photo, analysis, tone }: SocialShareProps) {
  // Calcul de la viralité basé sur le score et le ton
  const getViralPotential = () => {
    let viralScore = 0
    
    // Base sur le score photo (0-40 points)
    viralScore += Math.round(analysis.score * 0.4)
    
    // Bonus ton (0-30 points)
    if (tone === 'roast') viralScore += 30  // Le roast est plus viral
    else if (tone === 'artcritic') viralScore += 15
    else viralScore += 10
    
    // Bonus scores extrêmes (0-30 points)
    if (analysis.score >= 90 || analysis.score <= 30) viralScore += 30
    else if (analysis.score >= 80 || analysis.score <= 40) viralScore += 15
    
    // Déterminer le niveau
    if (viralScore >= 75) return { level: 'TRÈS ÉLEVÉ', color: 'text-red-400' }
    if (viralScore >= 60) return { level: 'ÉLEVÉ', color: 'text-orange-400' }
    if (viralScore >= 40) return { level: 'MOYEN', color: 'text-yellow-400' }
    return { level: 'FAIBLE', color: 'text-gray-400' }
  }

  const generateShareText = () => {
    const baseText = `🤖 JudgeMyJPEG a jugé ma photo : ${analysis.score}/100`
    
    if (tone === 'roast') {
      return `${baseText} 🔥 L'IA m'a grillé mais j'ai adoré ! 😂`
    } else if (tone === 'artcritic') {
      return `${baseText} 🎨 Vision artistique par l'IA ! 🖼️`
    } else {
      return `${baseText} 📸 Analyse pro par IA !`
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText = generateShareText()
  
  // Hashtags intelligents basés sur le contenu de l'analyse
  const getHashtags = () => {
    const baseHashtags = '#JudgeMyJPEG #PhotographieIA #AIAnalysis'
    let contextHashtags: string[] = []
    
    // Analyse du texte d'analyse pour détecter le contenu
    const analysisText = analysis.analysis?.toLowerCase() || ''
    
    // Hashtags par sujet/type de photo détecté
    if (analysisText.includes('portrait') || analysisText.includes('visage') || analysisText.includes('regard')) {
      contextHashtags.push('#Portrait', '#PortraitPhotography')
    }
    if (analysisText.includes('paysage') || analysisText.includes('nature') || analysisText.includes('montagne') || analysisText.includes('ciel')) {
      contextHashtags.push('#Paysage', '#Nature', '#LandscapePhotography')
    }
    if (analysisText.includes('rue') || analysisText.includes('urbain') || analysisText.includes('ville') || analysisText.includes('street')) {
      contextHashtags.push('#StreetPhotography', '#Urbain', '#Ville')
    }
    if (analysisText.includes('macro') || analysisText.includes('détail') || analysisText.includes('fleur') || analysisText.includes('insecte')) {
      contextHashtags.push('#MacroPhotography', '#Macro', '#Détail')
    }
    if (analysisText.includes('nuit') || analysisText.includes('étoile') || analysisText.includes('nocturne')) {
      contextHashtags.push('#PhotoNuit', '#NightPhotography', '#Nocturne')
    }
    if (analysisText.includes('sport') || analysisText.includes('action') || analysisText.includes('mouvement')) {
      contextHashtags.push('#SportPhotography', '#Action', '#Mouvement')
    }
    if (analysisText.includes('mariage') || analysisText.includes('événement') || analysisText.includes('fête')) {
      contextHashtags.push('#EventPhotography', '#Wedding', '#Mariage')
    }
    
    // Hashtags techniques basés sur les critiques
    if (analysisText.includes('flou') || analysisText.includes('netteté') || analysisText.includes('focus')) {
      contextHashtags.push('#Focus', '#Netteté')
    }
    if (analysisText.includes('exposition') || analysisText.includes('luminosité') || analysisText.includes('éclairage')) {
      contextHashtags.push('#Exposition', '#Lighting', '#Éclairage')
    }
    if (analysisText.includes('couleur') || analysisText.includes('saturation') || analysisText.includes('contraste')) {
      contextHashtags.push('#Colors', '#Couleurs', '#Editing')
    }
    if (analysisText.includes('composition') || analysisText.includes('cadrage') || analysisText.includes('règle des tiers')) {
      contextHashtags.push('#Composition', '#Cadrage', '#RuleOfThirds')
    }
    
    // Hashtags par qualité/niveau 
    if (analysis.score >= 85) {
      contextHashtags.push('#PhotoPro', '#Excellence', '#Masterpiece')
    } else if (analysis.score >= 70) {
      contextHashtags.push('#BonnePhoto', '#Quality', '#GoodShot')
    } else if (analysis.score <= 40) {
      contextHashtags.push('#PhotoFail', '#Learning', '#Progress')
    }
    
    // Hashtags par tone spécifique
    if (tone === 'roast') {
      contextHashtags.push('#PhotoFail', '#IAhumour', '#Funny', '#Roasted', '#Fails')
    } else if (tone === 'artcritic') {
      contextHashtags.push('#ArtistiquéPhoto', '#CritiqueArt', '#VisionArtistique', '#ArtPhotography')
    } else {
      contextHashtags.push('#PhotoTips', '#Amateur', '#Learning', '#PhotoSkills')
    }
    
    // Ajouter hashtags génériques populaires
    const generalHashtags = ['#Photography', '#Photo', '#Photographer', '#InstaPhoto', '#PicOfTheDay']
    
    // Limiter à 30 hashtags max (limite Instagram)
    const allHashtags = [
      ...baseHashtags.split(' '),
      ...contextHashtags.slice(0, 15), // Max 15 contextuels
      ...generalHashtags.slice(0, 10)  // Max 10 génériques
    ].slice(0, 30)
    
    return allHashtags.join(' ')
  }
  
  const hashtags = getHashtags()
  const fullShareText = `${shareText}\n\n${hashtags}`

  const socialLinks: Record<string, {
    url: string
    icon: string
    name: string
    color: string
    copyText?: boolean
  }> = {
    instagram: {
      url: `https://www.instagram.com/`,
      icon: '📷',
      name: 'Instagram',
      color: 'hover:bg-pink-500/20 hover:text-pink-400',
      copyText: true // Pour copier le texte avec hashtags
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
    whatsapp: {
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      icon: '💬',
      name: 'WhatsApp',
      color: 'hover:bg-green-500/20 hover:text-green-400'
    },
    snapchat: {
      url: `https://www.snapchat.com/`,
      icon: '👻',
      name: 'Snapchat',
      color: 'hover:bg-yellow-400/20 hover:text-yellow-400',
      copyText: true
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

  const copyInstagramText = (platform: string) => {
    navigator.clipboard.writeText(fullShareText).then(() => {
      // Feedback visuel pour Instagram/Snapchat
      const button = document.getElementById(`${platform}-button`)
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '✅ Texte copié !'
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      }
    })
  }

  return (
    <div className="glass-card p-4 sm:p-6 hover-glow">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-text-white mb-2 flex items-center justify-center">
          <span className="text-xl sm:text-2xl mr-2">🚀</span>
          <span className="hidden sm:inline">Partager votre analyse</span>
          <span className="sm:hidden">Partager</span>
        </h3>
        <p className="text-text-gray text-xs sm:text-sm">
          {tone === 'roast' 
            ? "Montrez comme l'IA vous a grillé ! 🔥" 
            : "Partagez vos insights photo ! 📸"
          }
        </p>
      </div>

      {/* Aperçu du texte de partage */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-cosmic-glass rounded-lg border border-cosmic-glassborder">
        <div className="text-xs sm:text-sm text-text-muted mb-2">
          <span className="hidden sm:inline">Aperçu du partage :</span>
          <span className="sm:hidden">Aperçu :</span>
        </div>
        <div className="text-text-white font-medium text-sm sm:text-base">{shareText}</div>
        <div className="text-xs text-neon-cyan mt-1">{hashtags}</div>
      </div>

      {/* Boutons de partage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {Object.entries(socialLinks).map(([platform, config]) => {
          if (config.copyText) {
            // Boutons Instagram et Snapchat : copier le texte + ouvrir l'app
            return (
              <button
                key={platform}
                id={`${platform}-button`}
                onClick={() => {
                  copyInstagramText(platform)
                  // Ouvrir l'app après copie
                  setTimeout(() => {
                    window.open(config.url, '_blank')
                  }, 100)
                }}
                className={`
                  flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg 
                  bg-cosmic-glass border border-cosmic-glassborder
                  transition-all duration-300 hover:scale-105 hover:shadow-neon-cyan/20 hover:shadow-lg
                  ${config.color} cursor-pointer
                `}
              >
                <span className="text-base sm:text-lg">{config.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{config.name}</span>
              </button>
            )
          } else {
            // Boutons classiques avec lien direct
            return (
              <a
                key={platform}
                href={config.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg 
                  bg-cosmic-glass border border-cosmic-glassborder
                  transition-all duration-300 hover:scale-105 hover:shadow-neon-cyan/20 hover:shadow-lg
                  ${config.color}
                `}
              >
                <span className="text-base sm:text-lg">{config.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{config.name}</span>
              </a>
            )
          }
        })}
      </div>

      {/* Actions supplémentaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 sm:mb-4">
        <button
          id="copy-button"
          onClick={copyToClipboard}
          className="btn-neon-secondary flex items-center space-x-2 justify-center text-sm"
        >
          <span>📋</span>
          <span className="hidden sm:inline">Copier le lien</span>
          <span className="sm:hidden">Copier</span>
        </button>
        
        <div className="flex justify-center">
          <ShareableImageGenerator 
            photo={photo}
            analysis={analysis}
            tone={tone}
          />
        </div>
      </div>

      {/* Stats motivantes avec explication */}
      <div className="mt-4 sm:mt-6">
        <div className="text-center mb-3">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:space-x-4 sm:gap-0 text-xs">
            <div className="flex items-center space-x-1">
              <span>👀</span>
              <span className={`font-semibold ${getViralPotential().color}`}>
                Viral: {getViralPotential().level}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-text-muted">
              <span>⚡</span>
              <span>Score: {analysis.score}/100</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}