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
  const [isCompressing, setIsCompressing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${info}`])
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { announceToScreenReader } = useAccessibility()
  const { isOnline, queueAnalysis } = usePWA()

  // Fonction de compression avec paramètres configurables
  const compressImageWithSettings = (file: File, maxDimension: number, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.warn('Canvas context not available')
        reject(new Error('Canvas non supporté'))
        return
      }
      const img = new Image()
      
      img.onload = () => {
        try {
          // Calcul des dimensions
          let { width, height } = img
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width
              width = maxDimension
            } else {
              width = (width * maxDimension) / height
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Dessiner avec gestion d'erreur
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name || 'photo.jpg', { 
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                reject(new Error('Échec création blob'))
              }
            },
            'image/jpeg',
            quality
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Erreur chargement image'))
      img.src = URL.createObjectURL(file)
      
      // Timeout de sécurité pour mobile
      setTimeout(() => {
        reject(new Error('Timeout compression'))
      }, 10000)
    })
  }

  // Fonction de compression automatique (legacy)
  const compressImage = (file: File, maxSizeKB: number = 4500, quality: number = 0.8, attempt: number = 1): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Sécurité : max 5 tentatives
      if (attempt > 5) {
        console.warn('Compression: Max attempts reached, using current file')
        resolve(file)
        return
      }
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.warn('Canvas context not available, using original file')
        resolve(file)
        return
      }
      const img = new Image()
      
      img.onload = () => {
        // Calcul des dimensions optimales (mobile-friendly)
        let { width, height } = img
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const maxDimension = isMobile ? 1536 : 2048 // Plus conservateur sur mobile
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convertir en blob avec qualité ajustable
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Si encore trop gros, réduire la qualité
              if (blob.size > maxSizeKB * 1024 && quality > 0.3) {
                // Recursive compression avec qualité réduite
                const newFile = new File([blob], file.name || 'photo.jpg', { type: 'image/jpeg' })
                compressImage(newFile, maxSizeKB, quality - 0.1, attempt + 1).then(resolve).catch(reject)
              } else {
                const compressedFile = new File([blob], file.name || 'photo.jpg', { 
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              }
            } else {
              reject(new Error('Erreur lors de la compression'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Erreur de chargement de l\'image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP)')
      announceToScreenReader('Erreur : Format de fichier non supporté')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setCompressionInfo(null)
    
    // Compression automatique si nécessaire
    let processedFile = file
    const originalSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
    console.log(`PhotoUpload: Original file size ${originalSizeMB}MB, type: ${file.type}`)
    addDebugInfo(`📁 Fichier détecté: ${originalSizeMB}MB, ${file.type}`)
    
    // Upload direct vers Cloudinary si >4MB (contourne limite Vercel Functions 4.5MB)
    if (file.size > 4 * 1024 * 1024) {
      try {
        setIsCompressing(true)
        announceToScreenReader('Compression automatique de l\'image en cours...')
        
        // Tentative compression progressive
        let compressionAttempts = [
          { maxDimension: 1536, quality: 0.8 },  // Première tentative
          { maxDimension: 1200, quality: 0.7 },  // Plus petit si échoue
          { maxDimension: 800, quality: 0.6 },   // Encore plus petit
        ]
        
        let compressed = false
        for (let i = 0; i < compressionAttempts.length && !compressed; i++) {
          try {
            const attempt = compressionAttempts[i]
            console.log(`PhotoUpload: Tentative ${i+1} - ${attempt.maxDimension}px, qualité ${attempt.quality}`)
            addDebugInfo(`⚡ Tentative ${i+1}: ${attempt.maxDimension}px, Q${attempt.quality}`)
            
            processedFile = await compressImageWithSettings(file, attempt.maxDimension, attempt.quality)
            compressed = true
            
            const compressedSizeMB = Math.round(processedFile.size / 1024 / 1024 * 100) / 100
            const compressionRate = Math.round((1 - processedFile.size / file.size) * 100)
            
            console.log(`PhotoUpload: Succès - compressé à ${compressedSizeMB}MB (-${compressionRate}%)`)
            addDebugInfo(`✅ Succès: ${compressedSizeMB}MB (-${compressionRate}%)`)
            
            const compressionMessage = `✨ Image compressée : ${originalSizeMB}MB → ${compressedSizeMB}MB (-${compressionRate}%)`
            setCompressionInfo(compressionMessage)
            announceToScreenReader(`Image compressée avec succès de ${originalSizeMB}MB à ${compressedSizeMB}MB`)
            
          } catch (attemptError) {
            console.warn(`PhotoUpload: Tentative ${i+1} échouée:`, attemptError)
            addDebugInfo(`❌ Échec tentative ${i+1}: ${attemptError instanceof Error ? attemptError.message : 'Erreur inconnue'}`)
            if (i === compressionAttempts.length - 1) {
              // Dernière tentative échouée, on rejette le fichier
              throw attemptError
            }
          }
        }
        
        setIsCompressing(false)
      } catch (error) {
        setIsCompressing(false)
        console.error('PhotoUpload: Toutes les tentatives de compression ont échoué:', error)
        addDebugInfo(`🚫 Compression échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
        addDebugInfo(`🔄 Fallback: Upload direct du fichier original`)
        // On garde le fichier original pour l'upload direct
        processedFile = file
      }
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
      const finalSizeMB = Math.round(processedFile.size / 1024 / 1024 * 100) / 100
      
      let photoUrl: string
      
      // Si le fichier est encore >4MB, essayer upload direct puis fallback serveur
      if (processedFile.size > 4 * 1024 * 1024) {
        addDebugInfo(`🔄 Upload direct Cloudinary: ${finalSizeMB}MB (>4MB)`)
        
        try {
          photoUrl = await uploadDirectToCloudinary(processedFile)
        } catch (cloudinaryError) {
          addDebugInfo(`🔄 Fallback: Upload via serveur malgré limite`)
          
          // Fallback: essayer via serveur malgré la limite
          const formData = new FormData()
          formData.append('photo', processedFile)
          formData.append('tone', tone)
          formData.append('language', language)

          const response = await fetch('/api/photos/analyze', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(120000), // 2 minutes
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            addDebugInfo(`❌ Fallback serveur erreur ${response.status}: ${errorData.error || 'Inconnu'}`)
            throw new Error(errorData.error || 'Erreur lors de l\'analyse')
          }

          const result = await response.json()
          addDebugInfo(`✅ Fallback serveur réussi`)
          announceToScreenReader('Analyse de la photo terminée avec succès')
          onAnalysisComplete(result)
          return
        }
      } else {
        addDebugInfo(`📤 Upload via serveur: ${finalSizeMB}MB (<4MB)`)
        
        const formData = new FormData()
        formData.append('photo', processedFile)
        formData.append('tone', tone)
        formData.append('language', language)

        const response = await fetch('/api/photos/analyze', {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(60000),
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          addDebugInfo(`❌ Serveur erreur ${response.status}: ${errorData.error || 'Inconnu'}`)
          throw new Error(errorData.error || 'Erreur lors de l\'analyse')
        }

        const result = await response.json()
        addDebugInfo(`✅ Analyse terminée avec succès`)
        announceToScreenReader('Analyse de la photo terminée avec succès')
        onAnalysisComplete(result)
        return
      }
      
      // Analyse avec URL Cloudinary
      const response = await fetch('/api/photos/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photoUrl,
          tone, 
          language 
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        addDebugInfo(`❌ Analyse URL erreur ${response.status}: ${errorData.error || 'Inconnu'}`)
        throw new Error(errorData.error || 'Erreur lors de l\'analyse')
      }

      const result = await response.json()
      addDebugInfo(`✅ Analyse URL terminée avec succès`)
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

  // Upload direct vers Cloudinary (contourne la limite Vercel 4.5MB)
  const uploadDirectToCloudinary = async (file: File): Promise<string> => {
    try {
      addDebugInfo(`🔧 Demande config Cloudinary...`)
      
      // Obtenir les paramètres d'upload depuis notre API
      const configResponse = await fetch('/api/cloudinary/upload-config', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      })
      
      if (!configResponse.ok) {
        const errorText = await configResponse.text()
        addDebugInfo(`❌ Config API erreur ${configResponse.status}: ${errorText}`)
        throw new Error(`Config API erreur ${configResponse.status}: ${errorText}`)
      }
      
      const config = await configResponse.json()
      addDebugInfo(`✅ Config reçue: ${config.cloudName}`)
      
      const { signature, timestamp, cloudName, apiKey, folder, transformation } = config
      
      // Créer formData pour Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', apiKey)
      formData.append('folder', folder)
      formData.append('transformation', transformation)
      
      addDebugInfo(`🌐 Upload vers Cloudinary...`)
      
      // Upload direct vers Cloudinary
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.text()
        addDebugInfo(`❌ Upload Cloudinary ${uploadResponse.status}: ${error}`)
        throw new Error(`Upload Cloudinary échoué: ${error}`)
      }
      
      const result = await uploadResponse.json()
      addDebugInfo(`✅ Upload réussi: ${result.secure_url.slice(0, 50)}...`)
      
      return result.secure_url
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
      addDebugInfo(`🚫 Échec upload Cloudinary: ${errorMsg}`)
      throw error
    }
  }

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
                <span aria-hidden="true">{isCompressing ? '⚡ ' : tone === 'roast' ? '🔥 ' : ''}</span>
                {isCompressing 
                  ? 'Compression automatique...' 
                  : tone === 'roast' ? 'Préparation du massacre...' : 'Analyse en cours...'
                }
              </p>
              <p className="text-sm sm:text-base text-text-gray">
                {isCompressing 
                  ? 'Optimisation de votre image pour une analyse parfaite'
                  : tone === 'roast' 
                  ? 'L\'IA se prépare à détruire votre photo' 
                  : 'L\'IA avancée analyse votre photo avec précision'
                }
              </p>
              {compressionInfo && (
                <p className="text-xs sm:text-sm text-green-400 font-medium mt-2">
                  {compressionInfo}
                </p>
              )}
              
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
                  📱 Photos smartphone jusqu'à 25MB • Upload direct si &gt;4MB
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