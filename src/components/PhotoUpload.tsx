import { useState, useRef, useEffect } from 'react'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage, PhotoType } from '@/types/analysis'
import ContextualTooltip, { RichTooltip } from './ContextualTooltip'
import PhotoTypeSelector from './PhotoTypeSelector'
import AnalysisCounter from './AnalysisCounter'
import { extractExifData } from '@/utils/exifExtractor'
import { ExifData } from '@/types/exif'
import { logger } from '@/lib/logger'
import AdvancedLoadingAnimation from './AdvancedLoadingAnimation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from 'next-auth/react'

// Type pour la fonction de refresh du compteur
declare global {
  interface Window {
    refreshAnalysisCounter?: () => void
  }
}

interface PhotoUploadProps {
  onAnalysisComplete: (result: { photo: any; analysis: PhotoAnalysis }) => void
  tone: AnalysisTone
  language: AnalysisLanguage
  testMode?: boolean // Mode test sans auth
  onUploadStateChange?: (isUploading: boolean) => void
  onAnalysisLimitReached?: () => void // Déclencher le modal starter pack
  photoType?: PhotoType
  onPhotoTypeChange?: (type: PhotoType) => void
}

export default function PhotoUpload({ onAnalysisComplete, tone, language, testMode = false, onUploadStateChange, onAnalysisLimitReached, photoType = 'general', onPhotoTypeChange }: PhotoUploadProps) {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [brightnessWarning, setBrightnessWarning] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [highQualityMode, setHighQualityMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${info}`])
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Vérifier le statut Premium de l'utilisateur
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/subscription/status')
        if (response.ok) {
          const data = await response.json()
          const premium = ['premium', 'annual', 'lifetime'].includes(data.subscriptionStatus)
          setIsPremium(premium)
          logger.debug(`Premium status: ${premium}`)
        }
      } catch (error) {
        logger.error('Failed to check premium status:', error)
      }
    }

    checkPremiumStatus()
  }, [session])

  // SUPPRIMÉ: Fonctions de compression Canvas (plus nécessaires avec Railway)

  // 🎨 Fonction pour calculer la luminosité moyenne d'une image
  const calculateAverageBrightness = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): number => {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let totalBrightness = 0

      // Parcourir les pixels (r, g, b, a) - sauter alpha
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // Formule de luminance relative (perception humaine)
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        totalBrightness += brightness
      }

      const pixelCount = data.length / 4
      const averageBrightness = totalBrightness / pixelCount

      logger.debug(`Average brightness: ${Math.round(averageBrightness * 100)}%`)
      return averageBrightness
    } catch (e) {
      logger.warn('Failed to calculate brightness, using default quality')
      return 0.5 // Luminosité moyenne par défaut
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(t.analyze.invalidFile)
      return
    }

    setIsUploading(true)
    onUploadStateChange?.(true)
    setErrorMessage(null)
    
    const originalSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
    logger.debug(`PhotoUpload: Original file size ${originalSizeMB}MB, type: ${file.type}`)

    // Logs internes uniquement (non visibles)
    logger.debug(`Analysis mode: ${tone}, file size: ${originalSizeMB}MB`)

    // 📸 EXTRACTION EXIF AVANT COMPRESSION (crucial!)
    // Extraire les métadonnées depuis le fichier ORIGINAL avant toute transformation
    let exifData: ExifData | null = null
    let isLikelyAIGenerated = false

    logger.debug(`📸 Extracting EXIF from file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type})`)

    try {
      exifData = await extractExifData(file) // ⚠️ Important: file ORIGINAL, pas processedFile
      if (exifData) {
        logger.debug('✅ EXIF extracted successfully:', {
          camera: exifData.camera,
          lens: exifData.lens,
          iso: exifData.iso,
          aperture: exifData.aperture,
          shutterSpeed: exifData.shutterSpeed,
          allKeys: Object.keys(exifData)
        })
      } else {
        // Pas de métadonnées du tout = suspect
        logger.warn('⚠️ No EXIF metadata found - possible AI-generated image or stripped metadata')
        isLikelyAIGenerated = true
      }
    } catch (exifError) {
      logger.error('⚠️ EXIF extraction failed:', exifError)
      exifData = null
      isLikelyAIGenerated = true
    }

    // 🤖 Détecter si l'image est potentiellement générée par IA
    if (!exifData?.camera && !exifData?.lens && !exifData?.iso) {
      logger.warn('🤖 Suspicious: no camera, lens or ISO data - likely AI-generated or processed image')
      isLikelyAIGenerated = true
    }

    // ✅ RAILWAY: Pas de limite cachée ! Upload direct possible
    let processedFile = file

    // 💎 MODE HAUTE QUALITÉ PREMIUM: pas de compression ou compression douce
    if (highQualityMode && isPremium) {
      logger.debug('🌟 HIGH QUALITY MODE: Premium user - minimal/no compression')

      // Compression douce uniquement pour fichiers > 15MB (cible 10MB)
      if (file.size > 15 * 1024 * 1024) {
        logger.debug(`Gentle compression: ${originalSizeMB}MB > 15MB → target 10MB`)
        // La logique de compression suit, mais avec qualité plus haute
      } else {
        // Pas de compression du tout pour < 15MB
        logger.debug(`No compression: ${originalSizeMB}MB < 15MB - original quality preserved`)
        processedFile = file
      }
    }

    // Compression uniquement pour fichiers TRÈS volumineux (>20MB) OU mode standard
    const shouldCompress = (!highQualityMode || !isPremium) && file.size > 20 * 1024 * 1024
    if (shouldCompress) {
      logger.debug(`Performance optimization: ${originalSizeMB}MB > 20MB`)
      
      try {
        setIsUploading(true)
    onUploadStateChange?.(true)
        logger.debug('Quality optimization starting...')
        
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
              // Compression ADAPTATIVE selon luminosité
              let { width, height } = img
              // 💎 Mode HQ Premium: cible 10MB, sinon 8MB
              const targetSize = (highQualityMode && isPremium) ? 10 * 1024 * 1024 : 8 * 1024 * 1024
              logger.debug(`Target size: ${Math.round(targetSize / 1024 / 1024)}MB ${highQualityMode && isPremium ? '(HQ mode)' : ''}`)

              // Réduire dimensions seulement si nécessaire (très grosse image)
              if (width * height > 4000000) { // >4MP
                const ratio = Math.sqrt(4000000 / (width * height))
                width = Math.round(width * ratio)
                height = Math.round(height * ratio)
                logger.debug(`Resized: ${img.width}x${img.height} → ${width}x${height}`)
              }

              canvas.width = width
              canvas.height = height
              ctx.drawImage(img, 0, 0, width, height)

              // 🌓 Calculer luminosité et adapter qualité
              const averageBrightness = calculateAverageBrightness(canvas, ctx)
              let quality: number

              // 💎 Mode HQ Premium: qualité de base plus élevée
              const qualityBoost = (highQualityMode && isPremium) ? 0.05 : 0

              if (averageBrightness < 0.3) {
                quality = Math.min(0.92 + qualityBoost, 0.98) // Photo très sombre (nuit) → haute qualité
                logger.debug(`Dark photo detected → quality ${Math.round(quality * 100)}%`)
                // ⚠️ Avertir l'utilisateur (sauf en mode HQ)
                if (!highQualityMode || !isPremium) {
                  setBrightnessWarning('📷 Votre photo semble très sombre — la qualité de l\'analyse peut être réduite. Pour une meilleure analyse, essayez d\'augmenter la luminosité.')
                } else {
                  setBrightnessWarning(null)
                }
              } else if (averageBrightness < 0.5) {
                quality = Math.min(0.85 + qualityBoost, 0.95) // Photo moyennement sombre → qualité moyenne-haute
                logger.debug(`Medium brightness → quality ${Math.round(quality * 100)}%`)
                setBrightnessWarning(null)
              } else {
                quality = Math.min(0.75 + qualityBoost, 0.90) // Photo lumineuse → compression standard
                logger.debug(`Bright photo → quality ${Math.round(quality * 100)}%`)
                setBrightnessWarning(null)
              }
              
              // Fonction récursive pour ajuster la qualité
              const compressWithQuality = (q: number) => {
                canvas.toBlob((blob) => {
                  if (blob) {
                    const sizeMB = blob.size / 1024 / 1024
                    logger.debug(`Quality test ${Math.round(q*100)}%: ${Math.round(sizeMB*100)/100}MB`)
                    
                    if (blob.size <= targetSize || q <= 0.1) {
                      // Taille acceptable ou qualité minimum atteinte
                      const compressed = new File([blob], file.name, { type: 'image/jpeg' })
                      const finalSizeMB = Math.round(sizeMB * 100) / 100
                      logger.debug(`Optimized: ${originalSizeMB}MB → ${finalSizeMB}MB (quality ${Math.round(q*100)}%)`)
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
        logger.error('Optimization failed:', error instanceof Error ? error.message : 'Error')
        setErrorMessage(`Impossible d'optimiser cette photo (${originalSizeMB}MB). Essayez de la redimensionner à moins de 20MB.`)
        setIsUploading(false)
    onUploadStateChange?.(false)
        return
      }
    } else {
      logger.debug(`Upload mode: direct, size: ${originalSizeMB}MB`)
    }



    // Déclarer messageInterval en dehors du try pour le scope
    let messageInterval: NodeJS.Timeout | null = null

    try {
      // Upload standard avec fichier compressé si nécessaire
      const finalSizeMB = Math.round(processedFile.size / 1024 / 1024 * 100) / 100
      logger.debug(`Processing file for ${tone} analysis...`)

      // ✅ Les données EXIF ont déjà été extraites AVANT compression (ligne 117)
      // Pas besoin de les réextraire ici

      const formData = new FormData()
      formData.append('photo', processedFile)
      formData.append('tone', tone)
      formData.append('language', language)
      formData.append('photoType', photoType)

      // Ajouter les données EXIF si disponibles (extraites AVANT compression)
      if (exifData) {
        formData.append('exifData', JSON.stringify(exifData))
        logger.debug('📸 EXIF data included in request:', exifData.camera)
      }

      // Ajouter le flag de détection IA
      if (isLikelyAIGenerated) {
        formData.append('isLikelyAIGenerated', 'true')
        logger.debug('🤖 Flagged as potentially AI-generated')
      }

      // URL absolue pour éviter les problèmes DNS mobile
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const apiUrl = testMode ? `${baseUrl}/api/photos/analyze-test` : `${baseUrl}/api/photos/analyze`
      
      logger.debug(`Sending to API: ${apiUrl}`)
      logger.debug(`Starting ${tone} analysis...`)

      // Retry logic pour les erreurs réseau mobiles
      let lastError: Error | null = null
      const maxRetries = 2
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(90000),
            headers: {
              'Cache-Control': 'no-cache',
            }
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            logger.error(`Server error ${response.status}:`, errorData.error || 'Unknown')
            
            // Si erreur de limite atteinte, déclencher le modal starter pack
            if (errorData.error?.includes('limite') || errorData.error?.includes('atteinte')) {
              onAnalysisLimitReached?.()
            }
            
            throw new Error(errorData.error || 'Erreur lors de l\'analyse')
          }

          const result = await response.json()
          logger.debug('Analysis completed successfully')
          
          // Actualiser le compteur d'analyses après succès
          if (window.refreshAnalysisCounter) {
            window.refreshAnalysisCounter()
          }
          
          onAnalysisComplete(result)
          return // Succès - sortir de la boucle retry
          
        } catch (error) {
          lastError = error as Error
          
          // Si c'est une erreur réseau et qu'on peut retry
          if (attempt < maxRetries && (
            error instanceof TypeError ||
            (error instanceof Error && (
              error.message.includes('fetch') ||
              error.message.includes('network') ||
              error.message.includes('NAME_NOT_RESOLVED') ||
              error.message.includes('Failed to fetch')
            ))
          )) {
            logger.warn(`🔄 Network error on attempt ${attempt}/${maxRetries}, retrying...`, {
              error: error.message,
              attempt
            })
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Backoff progressif
            continue
          }
          
          // Propager l'erreur si pas de retry possible
          throw error
        }
      }
      
      // Si on arrive ici, tous les retry ont échoué
      if (lastError) {
        throw lastError
      }

    } catch (error) {
      // Log pour debug uniquement
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur:', error)
      }
      
      // Message d'erreur plus précis
      let errorMessage = t.analyze.analysisError
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          errorMessage = 'Timeout - le fichier est peut-être trop volumineux ou votre connexion trop lente'
        } else if (error.message.includes('Upload interrompu')) {
          errorMessage = 'Upload interrompu - essayez avec un fichier plus petit'
        } else if (error.message.includes('connexion')) {
          errorMessage = t.analyze.networkError
        } else if (error.message) {
          errorMessage = error.message
        }
      }
      
      logger.error('Final error:', errorMessage)
      setErrorMessage(errorMessage)
    } finally {
      setIsUploading(false)
    onUploadStateChange?.(false)
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

  // SUPPRIMÉ: Upload direct Cloudinary (plus nécessaire avec Railway)

  return (
    <div className="w-full max-w-lg sm:max-w-2xl mx-auto space-y-6">
      {/* Compteur d'analyses restantes */}
      <AnalysisCounter 
        onLimitReached={onAnalysisLimitReached}
        showUpgradeButton={true}
        className="mb-4"
      />
      
      {/* Sélecteur de type de photo */}
      {onPhotoTypeChange && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-white">
            <span className="flex items-center space-x-2">
              <span className="text-neon-cyan">📸</span>
              <span>Type de photographie</span>
            </span>
          </label>
          <PhotoTypeSelector
            selectedType={photoType}
            onTypeChange={onPhotoTypeChange}
            disabled={isUploading}
          />
          <p className="text-xs text-text-gray font-medium">
            💡 Sélectionnez le type pour une analyse IA spécialisée et des conseils adaptés
          </p>
        </div>
      )}

      {/* 💎 Mode Haute Qualité Premium */}
      {isPremium && (
        <div className="glass-card p-4 mb-4 border border-neon-pink/30 bg-neon-pink/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💎</span>
              <div>
                <div className="text-text-white font-semibold text-sm">
                  Mode Haute Qualité
                </div>
                <div className="text-text-muted text-xs">
                  Qualité originale préservée - Pas de compression &lt; 15MB
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={highQualityMode}
                onChange={(e) => setHighQualityMode(e.target.checked)}
                className="sr-only peer"
                disabled={isUploading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-pink"></div>
            </label>
          </div>
          {highQualityMode && (
            <div className="mt-3 text-xs text-neon-cyan border-t border-neon-pink/20 pt-3">
              ✨ Mode Premium activé : qualité maximale pour une analyse optimale
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 mb-4">
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

      {brightnessWarning && (
        <div className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg text-yellow-300 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-sm">{brightnessWarning}</div>
            <button
              onClick={() => setBrightnessWarning(null)}
              className="ml-4 px-3 py-1 bg-yellow-600/30 hover:bg-yellow-600/50 rounded text-sm"
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
                tone === 'roast' ? 'text-red-400' : 
                tone === 'learning' ? 'text-green-400' : 'text-neon-cyan'
              }`}>
                <span aria-hidden="true">{
                  tone === 'roast' ? '🔥 ' : 
                  tone === 'learning' ? '📚 ' : '🚀 '
                }</span>
                {tone === 'roast' ? t.analyze.loadingRoast :
                 tone === 'learning' ? t.analyze.loadingLearning : t.analyze.loadingProfessional}
              </p>
              <p className="text-sm sm:text-base text-text-gray">
                {tone === 'roast'
                  ? t.analyze.loadingSubRoast
                  : tone === 'learning'
                  ? t.analyze.loadingSubLearning
                  : t.analyze.loadingSubProfessional
                }
              </p>
              
              {/* Section debug cachée pendant l'analyse - plus visible */}
              
              {/* Animation SPECTACULAIRE agrandie - sans debug */}
              <div className="flex flex-col items-center mt-8 space-y-6">
                {/* Messages thématiques centrés */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-glow">
                    {tone === 'roast' ? t.analyze.loadingTitleRoast :
                     tone === 'learning' ? t.analyze.loadingTitleLearning : t.analyze.loadingTitleProfessional}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {tone === 'roast'
                      ? t.analyze.loadingSubRoast
                      : tone === 'learning'
                      ? t.analyze.loadingSubLearning
                      : t.analyze.loadingSubProfessional
                    }
                  </p>
                </div>

                {/* Animation SPECTACULAIRE selon le tone */}
                <AdvancedLoadingAnimation 
                  mode={tone === 'professional' ? 'general' : tone === 'roast' ? 'roast' : tone === 'learning' ? 'learning' : 'general'} 
                  size="xl"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-4xl sm:text-6xl md:text-8xl animate-float" aria-hidden="true">📸</div>
            <div className="space-y-2 sm:space-y-4" id="upload-instructions">
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-glow text-center px-4">
                {t.analyze.dragDrop}
              </h3>
            </div>
            
            <RichTooltip
              title={t.analyze.uploadSpecs}
              description={t.analyze.uploadSpecsDescription}
              icon="⚙️"
            >
              <div className="glass-card p-3 sm:p-4 max-w-xs sm:max-w-md mx-auto cursor-help" id="file-constraints">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-text-muted">
                    <div className="flex items-center space-x-1">
                      <span className="text-neon-pink" aria-hidden="true">✓</span>
                      <span>{t.analyze.fileFormats}</span>
                    </div>
                    <div className="w-1 h-1 bg-text-muted rounded-full" aria-hidden="true"></div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-400" aria-hidden="true">⚡</span>
                      <span>{t.analyze.unlimitedPhotos}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-400/80">
                    {t.analyze.photosUpTo} • {t.analyze.qualityPreserved} • {t.analyze.railwayPro}
                  </p>
                </div>
              </div>
            </RichTooltip>
            
            <ContextualTooltip content="Analyse GPT-4 Vision avec traitement optimisé">
              <div className="text-xs text-text-muted cursor-help">
                {t.analyze.poweredBy}{' '}
                <span className="text-neon-pink font-semibold">{t.analyze.aiPowered}</span> ✨
              </div>
            </ContextualTooltip>
            
            {/* Debug info - visible même quand pas d'upload */}
            {debugInfo.length > 0 && (
              <div className="glass-card p-3 mt-4 text-left">
                <h4 className="text-xs font-semibold text-neon-cyan mb-2 flex items-center">
                  {t.analyze.recentActivity}
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