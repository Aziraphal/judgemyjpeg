import { useState, useRef } from 'react'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage } from '@/services/openai'
import { AccessibleError, useAccessibility } from '@/components/AccessibilityProvider'
import { usePWA } from '@/components/PWAManager'

interface PhotoUploadProps {
  onAnalysisComplete: (result: { photo: any; analysis: PhotoAnalysis }) => void
  tone: AnalysisTone
  language: AnalysisLanguage
}

export default function PhotoUpload({ onAnalysisComplete, tone, language }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${info}`])
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { announceToScreenReader } = useAccessibility()
  const { isOnline, queueAnalysis } = usePWA()

  // SUPPRIMÉ: Fonctions de compression Canvas (plus nécessaires avec Vercel Pro 50MB)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP)')
      announceToScreenReader('Erreur : Format de fichier non supporté')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    
    const originalSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
    console.log(`PhotoUpload: Original file size ${originalSizeMB}MB, type: ${file.type}`)
    addDebugInfo(`📁 Fichier détecté: ${originalSizeMB}MB, ${file.type}`)
    
    // RÉALITÉ VERCEL: Limite ~4.5MB même sur Pro - compression obligatoire
    let processedFile = file
    
    if (file.size > 3.8 * 1024 * 1024) { // 3.8MB seuil sécurisé
      addDebugInfo(`⚡ Compression obligatoire: ${originalSizeMB}MB > 3.8MB`)
      
      try {
        // Compression progressive robuste
        processedFile = await new Promise<File>((resolve, reject) => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas non supporté sur cet appareil'))
            return
          }
          
          const img = new Image()
          
          // Timeout sécurité pour mobiles lents
          const timeout = setTimeout(() => {
            reject(new Error('Timeout compression (appareil trop lent)'))
          }, 15000)
          
          img.onload = () => {
            clearTimeout(timeout)
            
            try {
              // Calcul intelligent des dimensions
              let { width, height } = img
              let quality = 0.6
              let maxDimension = 1200
              
              // Ajustements selon la taille originale
              if (file.size > 8 * 1024 * 1024) {
                maxDimension = 900
                quality = 0.4
              } else if (file.size > 6 * 1024 * 1024) {
                maxDimension = 1000
                quality = 0.5
              }
              
              // Redimensionnement proportionnel
              if (width > maxDimension || height > maxDimension) {
                const ratio = Math.min(maxDimension / width, maxDimension / height)
                width = Math.round(width * ratio)
                height = Math.round(height * ratio)
              }
              
              canvas.width = width
              canvas.height = height
              
              // Dessin avec gestion mémoire
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(0, 0, width, height) // Fond blanc
              ctx.drawImage(img, 0, 0, width, height)
              
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const compressed = new File([blob], file.name, { 
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    })
                    const compressedMB = Math.round(compressed.size / 1024 / 1024 * 100) / 100
                    const ratio = Math.round((1 - compressed.size / file.size) * 100)
                    addDebugInfo(`✅ Compressé: ${originalSizeMB}MB → ${compressedMB}MB (-${ratio}%)`)
                    resolve(compressed)
                  } else {
                    reject(new Error('Échec création du fichier compressé'))
                  }
                },
                'image/jpeg',
                quality
              )
            } catch (canvasError) {
              reject(new Error('Erreur lors du traitement Canvas'))
            }
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Image corrompue ou format non supporté'))
          }
          
          // Chargement de l'image
          img.src = URL.createObjectURL(file)
        })
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur de compression'
        addDebugInfo(`❌ ${errorMsg}`)
        
        // Messages spécifiques selon l'erreur
        if (errorMsg.includes('Canvas non supporté')) {
          setErrorMessage('Votre navigateur ne supporte pas la compression d\'images. Essayez avec une photo plus petite (<4MB).')
        } else if (errorMsg.includes('Timeout') || errorMsg.includes('lent')) {
          setErrorMessage('Photo trop complexe pour cet appareil. Essayez une photo plus simple ou utilisez un autre appareil.')
        } else {
          setErrorMessage(`Impossible de compresser cette photo (${originalSizeMB}MB). Essayez avec une image plus simple.`)
        }
        
        setIsUploading(false)
        return
      }
    } else {
      addDebugInfo(`✅ Taille OK pour Vercel: ${originalSizeMB}MB`)
    }

    announceToScreenReader('Début de l\'analyse de la photo')

    // Gestion mode hors ligne
    if (!isOnline) {
      try {
        const formData = new FormData()
        formData.append('photo', processedFile)
        formData.append('tone', tone)
        formData.append('language', language)

        const queueId = await queueAnalysis(formData)
        announceToScreenReader('Photo ajoutée à la file d\'attente. Elle sera analysée dès que la connexion sera rétablie.')
        
        setErrorMessage('Mode hors ligne : Votre photo a été mise en file d\'attente et sera analysée automatiquement dès que la connexion sera rétablie.')
        setIsUploading(false)
        return
      } catch (error) {
        setErrorMessage('Impossible de mettre en file d\'attente en mode hors ligne')
        setIsUploading(false)
        return
      }
    }

    try {
      // Upload avec fichier potentiellement compressé
      const finalSizeMB = Math.round(processedFile.size / 1024 / 1024 * 100) / 100
      addDebugInfo(`📤 Upload final: ${finalSizeMB}MB`)
      
      const formData = new FormData()
      formData.append('photo', processedFile)
      formData.append('tone', tone)
      formData.append('language', language)

      const response = await fetch('/api/photos/analyze', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(90000), // 90s pour gros fichiers
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        addDebugInfo(`❌ Serveur erreur ${response.status}: ${errorData.error || 'Inconnu'}`)
        
        // Debug spécial pour 413
        if (response.status === 413) {
          addDebugInfo(`🚨 413 = Limite dépassée. Vérifiez Vercel Pro activé`)
          addDebugInfo(`🔍 Server: ${response.headers.get('server') || 'Unknown'}`)
        }
        
        throw new Error(errorData.error || 'Erreur lors de l\'analyse')
      }

      const result = await response.json()
      addDebugInfo(`✅ Analyse terminée avec succès`)
      announceToScreenReader('Analyse de la photo terminée avec succès')
      onAnalysisComplete(result)

    } catch (error) {
      // Log pour debug uniquement
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur:', error)
      }
      
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
      
      addDebugInfo(`🔴 Erreur finale: ${errorMessage}`)
      setErrorMessage(errorMessage)
      announceToScreenReader(`Erreur : ${errorMessage}`)
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openFileDialog()
    }
  }

  const clearError = () => {
    setErrorMessage(null)
  }

  // SUPPRIMÉ: Upload direct Cloudinary (plus nécessaire avec Vercel Pro 50MB)

  return (
    <div className="w-full max-w-lg sm:max-w-2xl mx-auto">
      {errorMessage && (
        <AccessibleError message={errorMessage} onRetry={clearError} />
      )}
      <div
        className={`
          relative glass-card p-4 sm:p-6 md:p-12 text-center cursor-pointer
          transition-all duration-500 transform hover:scale-105 focus-visible
          min-h-[200px] sm:min-h-[280px] md:min-h-[320px] flex items-center justify-center
          ${dragActive 
            ? 'neon-border shadow-neon-cyan bg-cosmic-glassborder' 
            : 'hover:shadow-neon-pink border-cosmic-glassborder'
          }
          ${isUploading && tone === 'roast' 
            ? 'pointer-events-none animate-pulse bg-red-900/20 border-red-500/50 shadow-red-500/30' 
            : isUploading 
            ? 'pointer-events-none opacity-50' 
            : 'hover-glow'
          }
        `}
        role="button"
        tabIndex={0}
        aria-label="Zone de téléchargement d'image. Cliquez pour sélectionner un fichier ou glissez une image ici."
        aria-describedby="upload-instructions"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
      >
        <label htmlFor="photo-upload" className="sr-only">
          Sélectionner une photo à analyser
        </label>
        <input
          id="photo-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
          aria-describedby="file-constraints"
        />

        {isUploading ? (
          <div className="space-y-4 sm:space-y-6" role="status" aria-live="polite">
            <div className="relative mx-auto w-16 sm:w-20 h-16 sm:h-20">
              <div 
                className={`spinner-neon w-16 sm:w-20 h-16 sm:h-20 ${tone === 'roast' ? 'border-red-500' : ''}`}
                aria-hidden="true"
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl" aria-hidden="true">
                🤖
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-xl sm:text-2xl font-bold text-glow ${
                tone === 'roast' ? 'text-red-400' : 'text-neon-cyan'
              }`}>
                <span aria-hidden="true">{tone === 'roast' ? '🔥 ' : '🚀 '}</span>
                {tone === 'roast' ? 'Préparation du massacre...' : 'Analyse IA en cours...'}
              </p>
              <p className="text-sm sm:text-base text-text-gray">
                {tone === 'roast' 
                  ? 'L\'IA se prépare à détruire votre photo' 
                  : 'GPT-4 Vision analyse votre photo avec Vercel Pro'
                }
              </p>
              
              {/* Debug info mobile - visible pendant le traitement */}
              {debugInfo.length > 0 && (
                <div className="glass-card p-3 mt-4 text-left">
                  <h4 className="text-xs font-semibold text-neon-cyan mb-2">📊 Debug Mobile</h4>
                  <div className="space-y-1 text-xs text-text-muted font-mono max-h-20 overflow-y-auto">
                    {debugInfo.map((info, idx) => (
                      <div key={idx} className="truncate">{info}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-1 mt-4">
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  tone === 'roast' ? 'bg-red-500' : 'bg-neon-pink'
                }`}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  tone === 'roast' ? 'bg-red-400' : 'bg-neon-cyan'
                }`} style={{animationDelay: '0.1s'}}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  tone === 'roast' ? 'bg-red-500' : 'bg-neon-pink'
                }`} style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-4xl sm:text-6xl md:text-8xl animate-float" aria-hidden="true">📸</div>
            <div className="space-y-2 sm:space-y-4" id="upload-instructions">
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-glow">
                Glissez votre photo ici
              </h3>
              <p className="text-sm sm:text-base md:text-xl text-text-gray px-2 sm:px-4">
                ou{' '}
                <span className="text-neon-cyan font-semibold cursor-pointer hover:text-neon-pink transition-colors">
                  cliquez pour sélectionner
                </span>
              </p>
            </div>
            
            <div className="glass-card p-3 sm:p-4 max-w-xs sm:max-w-md mx-auto" id="file-constraints">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-text-muted">
                  <div className="flex items-center space-x-1">
                    <span className="text-neon-pink" aria-hidden="true">✓</span>
                    <span>Formats: JPG, PNG, WebP</span>
                  </div>
                  <div className="w-1 h-1 bg-text-muted rounded-full" aria-hidden="true"></div>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-400" aria-hidden="true">⚡</span>
                    <span>Photos illimitées</span>
                  </div>
                </div>
                <p className="text-xs text-green-400/80">
                  📱 Photos smartphone jusqu'à 50MB • Vercel Pro • Compression intelligente Sharp
                </p>
              </div>
            </div>
            
            <div className="text-xs text-text-muted">
              Powered by{' '}
              <span className="text-neon-pink font-semibold">Intelligence Artificielle</span> ✨
            </div>
            
            {/* Debug info mobile - visible même quand pas d'upload */}
            {debugInfo.length > 0 && (
              <div className="glass-card p-3 mt-4 text-left">
                <h4 className="text-xs font-semibold text-neon-cyan mb-2 flex items-center">
                  📊 Dernières activités
                  <button 
                    onClick={() => setDebugInfo([])} 
                    className="ml-auto text-xs text-text-muted hover:text-white"
                  >
                    ✕
                  </button>
                </h4>
                <div className="space-y-1 text-xs text-text-muted font-mono max-h-32 overflow-y-auto">
                  {debugInfo.map((info, idx) => (
                    <div key={idx} className="break-all text-[10px] sm:text-xs">{info}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-glow-pink rounded-full blur-md opacity-50" aria-hidden="true"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-glow-cyan rounded-full blur-md opacity-30" aria-hidden="true"></div>
      </div>
    </div>
  )
}