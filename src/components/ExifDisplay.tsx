import { ExifData } from '@/types/exif'
import { useState } from 'react'

interface ExifDisplayProps {
  exifData: ExifData
  className?: string
}

export default function ExifDisplay({ exifData, className = '' }: ExifDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string): string => {
    try {
      // Format EXIF: "2024:10:09 14:23:45" → "2024-10-09 14:23:45"
      const isoDateStr = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
      const date = new Date(isoDateStr)

      if (isNaN(date.getTime())) {
        return dateStr // Si toujours invalide, retourner original
      }

      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  // Données essentielles à afficher en priorité
  const essentialData = [
    { label: '📷 Appareil', value: exifData.camera },
    { label: '🔍 Objectif', value: exifData.lens },
    { label: '📊 ISO', value: exifData.iso?.toString() },
    { label: '⚪ Ouverture', value: exifData.aperture },
    { label: '⚡ Vitesse', value: exifData.shutterSpeed },
    { label: '📏 Focale', value: exifData.focalLength }
  ].filter(item => item.value)

  // Données supplémentaires (masquées par défaut)
  const additionalData = [
    { label: '🎛️ Mode exposition', value: exifData.exposureMode },
    { label: '☀️ Balance blancs', value: exifData.whiteBalance },
    { label: '💡 Flash', value: exifData.flashMode },
    { label: '📐 Dimensions', value: exifData.dimensions ? `${exifData.dimensions.width}×${exifData.dimensions.height}` : undefined },
    { label: '💾 Taille fichier', value: exifData.fileSize ? formatFileSize(exifData.fileSize) : undefined },
    { label: '🎨 Espace couleur', value: exifData.colorSpace },
    { label: '📅 Date prise', value: exifData.dateTime ? formatDate(exifData.dateTime) : undefined },
    { label: '💻 Logiciel', value: exifData.software }
  ].filter(item => item.value)

  const hasGPS = exifData.gps && (exifData.gps.latitude || exifData.gps.longitude)

  if (essentialData.length === 0) {
    return (
      <div className={`p-4 bg-cosmic-glass/30 border border-cosmic-glassborder rounded-lg ${className}`}>
        <div className="text-center text-text-muted">
          <span className="text-2xl mb-2 block">📷</span>
          <p className="text-sm">Aucune donnée EXIF détectée dans cette image</p>
          <p className="text-xs mt-1 opacity-70">
            Les images traitées ou compressées peuvent perdre leurs métadonnées
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-cosmic-glass border border-cosmic-glassborder rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-cosmic-glassborder">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-white flex items-center">
            <span className="mr-2">📊</span>
            Données EXIF
          </h3>
          <div className="text-xs text-text-muted bg-neon-cyan/10 px-2 py-1 rounded">
            Mode Expert
          </div>
        </div>
      </div>

      {/* Données essentielles */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {essentialData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-cosmic-glass/50 rounded-lg">
              <span className="text-text-gray text-sm font-medium">{item.label}</span>
              <span className="text-text-white text-sm font-mono bg-cosmic-glass px-2 py-1 rounded">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* GPS si disponible */}
        {hasGPS && (
          <div className="mb-4 p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
            <h4 className="text-sm font-semibold text-neon-cyan mb-2 flex items-center">
              <span className="mr-2">📍</span>
              Géolocalisation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {exifData.gps?.latitude && (
                <div>
                  <span className="text-text-muted">Latitude:</span>
                  <span className="text-text-white font-mono ml-2">
                    {exifData.gps.latitude.toFixed(6)}°
                  </span>
                </div>
              )}
              {exifData.gps?.longitude && (
                <div>
                  <span className="text-text-muted">Longitude:</span>
                  <span className="text-text-white font-mono ml-2">
                    {exifData.gps.longitude.toFixed(6)}°
                  </span>
                </div>
              )}
              {exifData.gps?.altitude && (
                <div>
                  <span className="text-text-muted">Altitude:</span>
                  <span className="text-text-white font-mono ml-2">
                    {Math.round(exifData.gps.altitude)}m
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton pour afficher plus de détails */}
        {additionalData.length > 0 && (
          <div className="border-t border-cosmic-glassborder pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center py-2 text-sm text-neon-cyan hover:text-neon-pink transition-colors"
            >
              <span className="mr-2">
                {isExpanded ? '👆 Masquer les détails' : '👇 Afficher plus de détails'}
              </span>
              <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        )}

        {/* Données supplémentaires (collapsibles) */}
        {isExpanded && additionalData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-cosmic-glassborder">
            <h4 className="text-sm font-semibold text-text-white mb-3 flex items-center">
              <span className="mr-2">🔧</span>
              Paramètres avancés
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {additionalData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-cosmic-glass/30 rounded">
                  <span className="text-text-muted text-xs">{item.label}</span>
                  <span className="text-text-white text-xs font-mono max-w-[60%] text-right truncate">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer informatif */}
      <div className="px-4 py-2 bg-cosmic-glass/20 border-t border-cosmic-glassborder">
        <p className="text-xs text-text-muted text-center">
          💡 Ces données techniques enrichissent l'analyse IA Expert
        </p>
      </div>
    </div>
  )
}

// Composant compact pour afficher les données EXIF essentielles en inline
export function ExifBadge({ exifData }: { exifData: ExifData }) {
  const essentials = [
    exifData.camera,
    exifData.iso && `ISO ${exifData.iso}`,
    exifData.aperture,
    exifData.shutterSpeed,
    exifData.focalLength
  ].filter(Boolean)

  if (essentials.length === 0) return null

  return (
    <div className="inline-flex items-center space-x-2 text-xs text-text-muted">
      <span className="text-neon-cyan">📊</span>
      <span>{essentials.join(' • ')}</span>
    </div>
  )
}

// Composant pour afficher uniquement le triangle d'exposition
export function ExposureTriangle({ exifData }: { exifData: ExifData }) {
  const hasExposure = exifData.iso || exifData.aperture || exifData.shutterSpeed

  if (!hasExposure) return null

  return (
    <div className="flex items-center space-x-4 p-3 bg-cosmic-glass/30 rounded-lg border border-cosmic-glassborder">
      <div className="text-neon-cyan font-semibold text-sm">Triangle d'exposition</div>
      <div className="flex items-center space-x-3 text-sm">
        {exifData.iso && (
          <span className="bg-cosmic-glass px-2 py-1 rounded text-text-white font-mono">
            ISO {exifData.iso}
          </span>
        )}
        {exifData.aperture && (
          <span className="bg-cosmic-glass px-2 py-1 rounded text-text-white font-mono">
            {exifData.aperture}
          </span>
        )}
        {exifData.shutterSpeed && (
          <span className="bg-cosmic-glass px-2 py-1 rounded text-text-white font-mono">
            {exifData.shutterSpeed}
          </span>
        )}
      </div>
    </div>
  )
}