import { useState, useRef } from 'react'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage } from '@/services/openai'

interface PhotoUploadProps {
  onAnalysisComplete: (result: { photo: any; analysis: PhotoAnalysis }) => void
  tone: AnalysisTone
  language: AnalysisLanguage
  testMode?: boolean // Mode test sans auth
}

export default function PhotoUpload({ onAnalysisComplete, tone, language, testMode = false }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${info}`])
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  // SUPPRIMÉ: Fonctions de compression Canvas (plus nécessaires avec Vercel Pro 50MB)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP)')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    
    const originalSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
    console.log(`PhotoUpload: Original file size ${originalSizeMB}MB, type: ${file.type}`)
    addDebugInfo(`📁 Fichier détecté: ${originalSizeMB}MB, ${file.type}`)
    
    // RÉALITÉ VERCEL: IMPOSSIBLE >4MB - Compression OBLIGATOIRE même si instable
    let processedFile = file
    
    if (file.size > 4 * 1024 * 1024) { // 4MB seuil - limite Vercel réelle
      addDebugInfo(`⚡ Compression nécessaire: ${originalSizeMB}MB > 4MB`)
      
      try {
        setIsUploading(true)
        addDebugInfo(`🔧 Optimisation qualité préservée...`)
        
        // Compression SIMPLE et BRUTALE - pas d'alternatives
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas non disponible')
        
        const img = new Image()
        const compressionPromise = new Promise<File>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout 10s')), 10000)
          
          img.onload = () => {
            clearTimeout(timeout)
            try {
              // Compression INTELLIGENTE: garder qualité max sous 4.4MB
              let { width, height } = img
              let quality = 0.9 // Commencer avec haute qualité
              const targetSize = 4.4 * 1024 * 1024 // 4.4MB cible
              
              // Réduire dimensions seulement si nécessaire (très grosse image)
              if (width * height > 4000000) { // >4MP
                const ratio = Math.sqrt(4000000 / (width * height))
                width = Math.round(width * ratio)
                height = Math.round(height * ratio)
                addDebugInfo(`🔧 Redimensionné: ${img.width}x${img.height} → ${width}x${height}`)
              }
              
              canvas.width = width
              canvas.height = height
              ctx.drawImage(img, 0, 0, width, height)
              
              // Fonction récursive pour ajuster la qualité
              const compressWithQuality = (q: number) => {
                canvas.toBlob((blob) => {
                  if (blob) {
                    const sizeMB = blob.size / 1024 / 1024
                    addDebugInfo(`🧪 Test qualité ${Math.round(q*100)}%: ${Math.round(sizeMB*100)/100}MB`)
                    
                    if (blob.size <= targetSize || q <= 0.1) {
                      // Taille acceptable ou qualité minimum atteinte
                      const compressed = new File([blob], file.name, { type: 'image/jpeg' })
                      const finalSizeMB = Math.round(sizeMB * 100) / 100
                      addDebugInfo(`✅ Optimisé: ${originalSizeMB}MB → ${finalSizeMB}MB (qualité ${Math.round(q*100)}%)`)
                      resolve(compressed)
                    } else {
                      // Trop gros, réduire qualité
                      compressWithQuality(q - 0.1)
                    }
                  } else {
                    reject(new Error('Échec blob'))
                  }
                }, 'image/jpeg', q)
              }
              
              compressWithQuality(quality)
            } catch (e) {
              reject(e)
            }
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Image corrompue'))
          }
          
          // Fix CORS + validation image
          try {
            const reader = new FileReader()
            reader.onload = (e) => {
              if (e.target?.result) {
                img.src = e.target.result as string
              } else {
                reject(new Error('Lecture fichier échouée'))
              }
            }
            reader.onerror = () => reject(new Error('FileReader erreur'))
            reader.readAsDataURL(file)
          } catch (readerError) {
            reject(new Error('Impossible de lire le fichier'))
          }
        })
        
        processedFile = await compressionPromise
        
      } catch (error) {
        addDebugInfo(`❌ Compression échouée: ${error instanceof Error ? error.message : 'Erreur'}`)
        setErrorMessage(`Impossible d'optimiser cette photo (${originalSizeMB}MB). Essayez de la redimensionner à moins de 4MB ou utilisez un format différent.`)
        setIsUploading(false)
        return
      }
    } else {
      addDebugInfo(`✅ Taille OK: ${originalSizeMB}MB ≤ 4MB`)
    }



    try {
      // Upload standard avec fichier compressé si nécessaire
      const finalSizeMB = Math.round(processedFile.size / 1024 / 1024 * 100) / 100
      addDebugInfo(`📤 Upload final: ${finalSizeMB}MB`)
      
      const formData = new FormData()
      formData.append('photo', processedFile)
      formData.append('tone', tone)
      formData.append('language', language)

      // Utiliser l'API de test si en mode test
      const apiUrl = testMode ? '/api/photos/analyze-test' : '/api/photos/analyze'
      addDebugInfo(`🔗 API utilisée: ${apiUrl}`)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(90000),
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
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={clearError}
              className="ml-4 px-3 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-sm"
            >
              ✕
            </button>
          </div>
        </div>
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
                {tone === 'roast' ? 'Analyse critique en cours...' : 'Analyse IA en cours...'}
              </p>
              <p className="text-sm sm:text-base text-text-gray">
                {tone === 'roast' 
                  ? 'L\'IA prépare une critique sans concession' 
                  : 'GPT-4 Vision analyse votre photo avec précision'
                }
              </p>
              
              {/* Debug info mobile - visible pendant le traitement */}
              {debugInfo.length > 0 && (
                <div className="glass-card p-3 mt-4 text-left">
                  <h4 className="text-xs font-semibold text-neon-cyan mb-2">📊 Traitement</h4>
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
                  📱 Photos jusqu'à 10MB • Compression automatique si nécessaire
                </p>
              </div>
            </div>
            
            <div className="text-xs text-text-muted">
              Powered by{' '}
              <span className="text-neon-pink font-semibold">Intelligence Artificielle</span> ✨
            </div>
            
            {/* Debug info - visible même quand pas d'upload */}
            {debugInfo.length > 0 && (
              <div className="glass-card p-3 mt-4 text-left">
                <h4 className="text-xs font-semibold text-neon-cyan mb-2 flex items-center">
                  📊 Activité récente
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