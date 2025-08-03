import { useRef } from 'react'
import { PhotoAnalysis } from '@/services/openai'

interface ShareableImageGeneratorProps {
  photo: {
    filename: string
    url: string
  }
  analysis: PhotoAnalysis
  tone: 'professional' | 'roast'
}

export default function ShareableImageGenerator({ photo, analysis, tone }: ShareableImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateShareableImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dimensions Instagram Story (9:16)
    canvas.width = 1080
    canvas.height = 1920

    // Fond dégradé cosmic
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0A0B1A')
    gradient.addColorStop(0.5, '#1A0B2E') 
    gradient.addColorStop(1, '#16213E')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Charger et dessiner l'image de la photo (miniature)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = photo.url
      })

      // Dessiner la photo en haut (carré centré)
      const imgSize = 400
      const imgX = (canvas.width - imgSize) / 2
      const imgY = 100
      
      // Dessiner la photo (carré simple)
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize)

      // Bordure néon autour de l'image
      ctx.strokeStyle = analysis.score >= 80 ? '#00FFFF' : '#FF006E'
      ctx.lineWidth = 4
      ctx.strokeRect(imgX, imgY, imgSize, imgSize)

    } catch (error) {
      console.log('Erreur chargement image:', error)
    }

    // Textes
    ctx.textAlign = 'center'
    ctx.fillStyle = '#FFFFFF'

    // Logo JudgeMyJPEG
    ctx.font = 'bold 80px Arial'
    const logoGradient = ctx.createLinearGradient(0, 600, canvas.width, 600)
    logoGradient.addColorStop(0, '#FF006E')
    logoGradient.addColorStop(1, '#00FFFF')
    ctx.fillStyle = logoGradient
    ctx.fillText('JudgeMyJPEG', canvas.width / 2, 650)

    // Score principal
    ctx.font = 'bold 120px Arial'
    ctx.fillStyle = analysis.score >= 80 ? '#00FFFF' : analysis.score >= 60 ? '#FFFF00' : '#FF006E'
    ctx.fillText(`${analysis.score}/100`, canvas.width / 2, 800)

    // Texte du mode
    ctx.font = 'bold 40px Arial'
    ctx.fillStyle = tone === 'roast' ? '#FF006E' : '#00FFFF'
    const modeText = tone === 'roast' ? '🔥 MODE CASSANT' : '👔 MODE PRO'
    ctx.fillText(modeText, canvas.width / 2, 900)

    // Citation de l'analyse (tronquée)
    ctx.font = '36px Arial'
    ctx.fillStyle = '#CCCCCC'
    const maxLength = 80
    let quoteText = ''
    
    if (analysis.artistic?.creativity) {
      quoteText = analysis.artistic.creativity.substring(0, maxLength)
      if (analysis.artistic.creativity.length > maxLength) {
        quoteText += '...'
      }
    }

    // Diviser en lignes
    const words = quoteText.split(' ')
    const lines = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > canvas.width - 100 && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    // Dessiner les lignes
    let yPos = 1000
    for (const line of lines.slice(0, 3)) { // Max 3 lignes
      ctx.fillText(`"${line}"`, canvas.width / 2, yPos)
      yPos += 50
    }

    // Call to action
    ctx.font = 'bold 36px Arial'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('Teste tes photos sur JudgeMyJPEG.com', canvas.width / 2, yPos + 100)

    // Télécharger l'image
    const link = document.createElement('a')
    link.download = `judgemyjpeg-${photo.filename}-${analysis.score}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="text-center">
      <button
        onClick={generateShareableImage}
        className="btn-neon-secondary text-sm flex items-center space-x-2 mx-auto"
      >
        <span>🎨</span>
        <span>Créer image partageable</span>
      </button>
      
      <canvas 
        ref={canvasRef} 
        className="hidden" 
        width={1080} 
        height={1920}
      />
      
    </div>
  )
}