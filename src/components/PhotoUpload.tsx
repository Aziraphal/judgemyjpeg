import { useState, useRef } from 'react'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage } from '@/services/gemini'

interface PhotoUploadProps {
  onAnalysisComplete: (result: { photo: any; analysis: PhotoAnalysis }) => void
  tone: AnalysisTone
  language: AnalysisLanguage
}

export default function PhotoUpload({ onAnalysisComplete, tone, language }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image doit faire moins de 10MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('tone', tone)
      formData.append('language', language)

      const response = await fetch('/api/photos/analyze', {
        method: 'POST',
        body: formData,
        // Augmenter le timeout côté client
        signal: AbortSignal.timeout(60000), // 60 secondes
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur lors de l\'analyse')
      }

      const result = await response.json()
      onAnalysisComplete(result)

    } catch (error) {
      console.error('Erreur:', error)
      
      // Message d'erreur plus précis
      let errorMessage = 'Erreur lors de l\'analyse de la photo'
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          errorMessage = 'Timeout - le fichier est peut-être trop volumineux ou votre connexion trop lente'
        } else if (error.message.includes('Upload interrompu')) {
          errorMessage = 'Upload interrompu - essayez avec un fichier plus petit'
        } else if (error.message.includes('connexion')) {
          errorMessage = 'Erreur de connexion - vérifiez votre réseau'
        } else if (error.message) {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative glass-card p-12 text-center cursor-pointer
          transition-all duration-500 transform hover:scale-105
          ${dragActive 
            ? 'neon-border shadow-neon-cyan bg-cosmic-glassborder' 
            : 'hover:shadow-neon-pink border-cosmic-glassborder'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'hover-glow'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="spinner-neon w-20 h-20"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                🤖
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-neon-cyan text-glow">
                Analyse en cours...
              </p>
              <p className="text-text-gray">
                L'IA avancée analyse votre photo avec précision
              </p>
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-8xl animate-float">📸</div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-glow">
                Glissez votre photo ici
              </h3>
              <p className="text-xl text-text-gray">
                ou{' '}
                <span className="text-neon-cyan font-semibold cursor-pointer hover:text-neon-pink transition-colors">
                  cliquez pour sélectionner
                </span>
              </p>
            </div>
            
            <div className="glass-card p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4 text-sm text-text-muted">
                <div className="flex items-center space-x-1">
                  <span className="text-neon-pink">✓</span>
                  <span>JPG, PNG, WebP</span>
                </div>
                <div className="w-1 h-1 bg-text-muted rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <span className="text-neon-cyan">✓</span>
                  <span>Max 10MB</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-text-muted">
              Powered by{' '}
              <span className="text-neon-pink font-semibold">Intelligence Artificielle</span> ✨
            </div>
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-glow-pink rounded-full blur-md opacity-50"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-glow-cyan rounded-full blur-md opacity-30"></div>
      </div>
    </div>
  )
}