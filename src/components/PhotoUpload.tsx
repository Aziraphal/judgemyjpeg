import { useState, useRef } from 'react'
import { PhotoAnalysis, AnalysisTone, AnalysisLanguage, PhotoType } from '@/types/analysis'
import ContextualTooltip, { RichTooltip } from './ContextualTooltip'
import PhotoTypeSelector from './PhotoTypeSelector'
import AnalysisCounter from './AnalysisCounter'
import { extractExifData } from '@/utils/exifExtractor'
import { ExifData } from '@/types/exif'
import { logger } from '@/lib/logger'
import AdvancedLoadingAnimation from './AdvancedLoadingAnimation'

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
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${info}`])
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  // SUPPRIMÉ: Fonctions de compression Canvas (plus nécessaires avec Railway)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP)')
      return
    }

    setIsUploading(true)
    onUploadStateChange?.(true)
    setErrorMessage(null)
    
    const originalSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
    logger.debug(`PhotoUpload: Original file size ${originalSizeMB}MB, type: ${file.type}`)
    
    // Logs internes uniquement (non visibles)
    logger.debug(`Analysis mode: ${tone}, file size: ${originalSizeMB}MB`)
    
    // ✅ RAILWAY: Pas de limite cachée ! Upload direct possible
    let processedFile = file
    
    // Compression uniquement pour fichiers TRÈS volumineux (>20MB) pour optimiser les performances
    if (file.size > 20 * 1024 * 1024) { // 20MB seuil - optimisation performance seulement
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
              // Compression INTELLIGENTE: garder qualité max sous 4.4MB
              let { width, height } = img
              let quality = 0.9 // Commencer avec haute qualité
              const targetSize = 4.4 * 1024 * 1024 // 4.4MB cible
              
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
      
      // Extraire les données EXIF pour le mode Expert
      let exifData: ExifData | null = null
      if (tone === 'expert') {
        try {
          exifData = await extractExifData(processedFile)
        } catch (exifError) {
          logger.warn('⚠️ EXIF extraction failed:', exifError)
        }
      }
      
      const formData = new FormData()
      formData.append('photo', processedFile)
      formData.append('tone', tone)
      formData.append('language', language)
      formData.append('photoType', photoType)
      
      // Ajouter les données EXIF si disponibles
      if (exifData) {
        formData.append('exifData', JSON.stringify(exifData))
      }

      // Utiliser l'API de test si en mode test
      const apiUrl = testMode ? '/api/photos/analyze-test' : '/api/photos/analyze'
      logger.debug(`Sending to API: ${apiUrl}`)
      
      // Les messages progressifs sont maintenant intégrés dans l'interface
      logger.debug(`Starting ${tone} analysis...`)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(90000),
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

    } catch (error) {
      // Log pour debug uniquement
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur:', error)
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

      {errorMessage && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300">
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
                tone === 'roast' ? 'text-red-400' : 
                tone === 'expert' ? 'text-yellow-400' : 'text-neon-cyan'
              }`}>
                <span aria-hidden="true">{
                  tone === 'roast' ? '🔥 ' : 
                  tone === 'expert' ? '🎯 ' : '🚀 '
                }</span>
                {tone === 'roast' ? 'Analyse critique en cours...' : 
                 tone === 'expert' ? 'Analyse experte en cours...' : 'Analyse IA en cours...'}
              </p>
              <p className="text-sm sm:text-base text-text-gray">
                {tone === 'roast' 
                  ? 'L\'IA prépare une critique sans concession'
                  : tone === 'expert'
                  ? 'Analyse de niveau maître en cours...' 
                  : 'GPT-4 Vision analyse votre photo avec précision'
                }
              </p>
              
              {/* Section debug cachée pendant l'analyse - plus visible */}
              
              {/* Animation SPECTACULAIRE agrandie - sans debug */}
              <div className="flex flex-col items-center mt-8 space-y-6">
                {/* Messages thématiques centrés */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-glow">
                    {tone === 'roast' ? '🔥 Préparation du châtiment' : 
                     tone === 'expert' ? '🎯 Expertise en cours' : '⚡ Analyse en cours'}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {tone === 'roast' 
                      ? "L'IA prépare une critique sans concession..." 
                      : tone === 'expert'
                      ? "Analyse photographique de niveau professionnel..."
                      : "L'IA examine chaque détail de votre photo..."
                    }
                  </p>
                </div>

                {/* Animation SPECTACULAIRE selon le tone */}
                <AdvancedLoadingAnimation 
                  mode={tone === 'professional' ? 'expert' : tone === 'roast' ? 'roast' : tone === 'expert' ? 'expert' : 'general'} 
                  size="xl"
                />
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
            
            <RichTooltip
              title="Spécifications techniques"
              description="Formats optimisés pour l'analyse IA : JPEG pour rapidité, PNG pour qualité, WebP pour compression avancée"
              icon="⚙️"
            >
              <div className="glass-card p-3 sm:p-4 max-w-xs sm:max-w-md mx-auto cursor-help" id="file-constraints">
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
                    📱 Photos jusqu'à 20MB • Qualité originale préservée • Railway Pro
                  </p>
                </div>
              </div>
            </RichTooltip>
            
            <ContextualTooltip content="Analyse GPT-4 Vision avec traitement optimisé">
              <div className="text-xs text-text-muted cursor-help">
                Powered by{' '}
                <span className="text-neon-pink font-semibold">Intelligence Artificielle</span> ✨
              </div>
            </ContextualTooltip>
            
            {/* Debug info - visible même quand pas d'upload */}
            {debugInfo.length > 0 && (
              <div className="glass-card p-3 mt-4 text-left">
                <h4 className="text-xs font-semibold text-neon-cyan mb-2 flex items-center">
                  Activité récente
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