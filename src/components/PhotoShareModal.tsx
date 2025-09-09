/**
 * Modal de partage photo avec solutions Desktop/Mobile
 * Génère une image composite + texte pour partage social
 */

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { PhotoAnalysis, AnalysisTone } from '@/types/analysis'
import { logger } from '@/lib/logger'

interface PhotoShareModalProps {
  isOpen: boolean
  onClose: () => void
  analysis: PhotoAnalysis
  photoUrl: string
  tone?: AnalysisTone
}

export default function PhotoShareModal({ isOpen, onClose, analysis, photoUrl, tone = 'professional' }: PhotoShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [compositeImageUrl, setCompositeImageUrl] = useState<string | null>(null)
  const [shareText, setShareText] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenImageRef = useRef<HTMLImageElement>(null)

  // Détecter le type d'appareil
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const hasWebShare = typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator

  useEffect(() => {
    if (isOpen) {
      generateShareContent()
    }
  }, [isOpen, analysis])

  const generateShareContent = () => {
    const modeEmoji = tone === 'roast' ? '🔥' : tone === 'expert' ? '🎯' : '⚡'
    // Utiliser l'analyse technique ou artistique comme texte principal
    const analysisText = analysis.technical.composition || analysis.artistic.creativity || 'Analyse IA complète'
    const shareMessage = `${modeEmoji} Ma photo analysée par l'IA fait ${analysis.score}/100 !\n\n"${analysisText.substring(0, 100)}${analysisText.length > 100 ? '...' : ''}"\n\n📸 Analyse gratuite sur JudgeMyJPEG.fr\n\n#photographie #IA #JudgeMyJPEG`
    
    setShareText(shareMessage)
  }

  const generateCompositeImage = async (): Promise<Blob | null> => {
    if (!canvasRef.current || !hiddenImageRef.current) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    try {
      setIsGenerating(true)
      
      // Attendre que l'image soit chargée
      await new Promise((resolve, reject) => {
        if (hiddenImageRef.current!.complete) {
          resolve(null)
        } else {
          hiddenImageRef.current!.onload = () => resolve(null)
          hiddenImageRef.current!.onerror = reject
        }
      })

      const img = hiddenImageRef.current
      
      // Dimensions de l'image composite (format Instagram optimal)
      const compositeWidth = 1080
      const compositeHeight = 1080
      
      canvas.width = compositeWidth
      canvas.height = compositeHeight

      // Background gradient cosmic
      const gradient = ctx.createLinearGradient(0, 0, compositeWidth, compositeHeight)
      gradient.addColorStop(0, '#0D1117')
      gradient.addColorStop(0.5, '#161B22') 
      gradient.addColorStop(1, '#21262D')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, compositeWidth, compositeHeight)

      // Calculer les dimensions de l'image pour qu'elle tienne dans le carré
      const imageSize = 800
      const imageX = (compositeWidth - imageSize) / 2
      const imageY = 80

      // Dessiner l'image principale avec coins arrondis
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(imageX, imageY, imageSize, imageSize, 20)
      ctx.clip()
      
      // Garder le ratio de l'image originale
      const imgRatio = img.naturalWidth / img.naturalHeight
      let drawWidth = imageSize
      let drawHeight = imageSize
      let drawX = imageX
      let drawY = imageY
      
      if (imgRatio > 1) {
        // Image plus large que haute
        drawHeight = imageSize / imgRatio
        drawY = imageY + (imageSize - drawHeight) / 2
      } else {
        // Image plus haute que large
        drawWidth = imageSize * imgRatio
        drawX = imageX + (imageSize - drawWidth) / 2
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      ctx.restore()

      // Badge score avec glow
      const modeEmoji = tone === 'roast' ? '🔥' : tone === 'expert' ? '🎯' : '⚡'
      const badgeX = imageX + 30
      const badgeY = imageY + 30
      
      // Badge background avec glow
      ctx.shadowColor = tone === 'roast' ? '#EF4444' : tone === 'expert' ? '#06B6D4' : '#8B5CF6'
      ctx.shadowBlur = 20
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, 180, 60, 15)
      ctx.fill()
      
      // Reset shadow
      ctx.shadowBlur = 0

      // Badge text
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 28px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${modeEmoji} ${analysis.score}/100`, badgeX + 90, badgeY + 38)

      // Citation d'analyse (tronquée)
      const maxQuoteLength = 120
      const analysisText = analysis.technical.composition || analysis.artistic.creativity || 'Analyse IA complète'
      const quote = analysisText.length > maxQuoteLength 
        ? analysisText.substring(0, maxQuoteLength) + '...'
        : analysisText

      // Background citation
      const quoteY = imageY + imageSize + 30
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.beginPath()
      ctx.roundRect(imageX, quoteY, imageSize, 100, 15)
      ctx.fill()

      // Texte citation
      ctx.fillStyle = '#E5E7EB'
      ctx.font = '18px system-ui'
      ctx.textAlign = 'left'
      
      // Word wrap pour la citation
      const words = quote.split(' ')
      let line = ''
      let lineY = quoteY + 30
      const maxWidth = imageSize - 60
      
      for (const word of words) {
        const testLine = line + word + ' '
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line.trim(), imageX + 30, lineY)
          line = word + ' '
          lineY += 25
        } else {
          line = testLine
        }
        
        if (lineY > quoteY + 80) break // Limite de hauteur
      }
      ctx.fillText(line.trim(), imageX + 30, lineY)

      // Logo/watermark JudgeMyJPEG
      ctx.fillStyle = '#6B7280'
      ctx.font = 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('📸 JudgeMyJPEG.fr - Analyse gratuite', compositeWidth / 2, compositeHeight - 30)

      // Convertir en blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setCompositeImageUrl(url)
          }
          resolve(blob)
        }, 'image/png', 0.9)
      })

    } catch (error) {
      logger.error('Error generating composite image:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMobileShare = async () => {
    try {
      const imageBlob = await generateCompositeImage()
      if (!imageBlob) {
        throw new Error('Failed to generate image')
      }

      const file = new File([imageBlob], `judgemyjpeg-${analysis.score}.png`, { type: 'image/png' })

      if (hasWebShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Ma photo analysée par l\'IA',
          text: shareText,
          files: [file]
        })
        logger.info('Mobile share successful')
      } else {
        // Fallback: montrer les instructions de screenshot
        setShowInstructions(true)
      }
    } catch (error) {
      logger.error('Mobile share failed:', error)
      setShowInstructions(true)
    }
  }

  const handleDesktopDownload = async () => {
    try {
      const imageBlob = await generateCompositeImage()
      if (!imageBlob) return

      // Télécharger l'image
      const url = URL.createObjectURL(imageBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `judgemyjpeg-analyse-${analysis.score}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Copier le texte dans le presse-papiers
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        logger.info('Text copied to clipboard')
      }

      setShowInstructions(true)
    } catch (error) {
      logger.error('Desktop share failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">📸 Partager sur Instagram</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Image cachée pour génération canvas */}
          <img
            ref={hiddenImageRef}
            src={photoUrl}
            alt="Hidden"
            className="hidden"
            crossOrigin="anonymous"
          />

          {/* Canvas caché */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Preview de l'image composite */}
          {compositeImageUrl && (
            <div className="mb-6">
              <img
                src={compositeImageUrl}
                alt="Aperçu du partage"
                className="w-full rounded-lg border border-gray-600"
              />
            </div>
          )}

          {/* Texte de partage */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Texte du post :
            </label>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm resize-none focus:border-neon-cyan focus:outline-none"
              placeholder="Personnalisez votre message..."
            />
          </div>

          {/* Boutons d'action */}
          {!showInstructions ? (
            <div className="space-y-3">
              {isMobile ? (
                <button
                  onClick={handleMobileShare}
                  disabled={isGenerating}
                  className="btn-neon-pink w-full disabled:opacity-50"
                >
                  {isGenerating ? '⏳ Génération...' : '📱 Partager sur mobile'}
                </button>
              ) : (
                <button
                  onClick={handleDesktopDownload}
                  disabled={isGenerating}
                  className="btn-neon-cyan w-full disabled:opacity-50"
                >
                  {isGenerating ? '⏳ Génération...' : '💻 Télécharger + Copier texte'}
                </button>
              )}
            </div>
          ) : (
            // Instructions après action
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-blue-300 font-semibold mb-2">
                {isMobile ? '📱 Instructions mobile' : '💻 Instructions desktop'}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {isMobile
                  ? hasWebShare
                    ? 'Votre image et texte sont prêts à partager ! Choisissez Instagram dans le menu de partage.'
                    : 'Faites un screenshot de l\'image ci-dessus, puis collez-la dans Instagram avec le texte copié.'
                  : 'Image téléchargée et texte copié ! Glissez l\'image dans Instagram et collez le texte (Ctrl+V).'
                }
              </p>
              <button
                onClick={() => {
                  setShowInstructions(false)
                  onClose()
                }}
                className="btn-neon-secondary mt-4"
              >
                ✅ Compris !
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}