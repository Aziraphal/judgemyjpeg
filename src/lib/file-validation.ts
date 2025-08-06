/**
 * Validation sécurisée des fichiers uploadés
 * Phase 1 - Magic Bytes + Type Validation
 */

import { Buffer } from 'buffer'

// Magic bytes pour les formats d'image supportés
const IMAGE_SIGNATURES: Record<string, { 
  signature: number[], 
  extension: string,
  mimeType: string 
}> = {
  // JPEG
  'jpeg1': { signature: [0xFF, 0xD8, 0xFF, 0xE0], extension: 'jpg', mimeType: 'image/jpeg' },
  'jpeg2': { signature: [0xFF, 0xD8, 0xFF, 0xE1], extension: 'jpg', mimeType: 'image/jpeg' },
  'jpeg3': { signature: [0xFF, 0xD8, 0xFF, 0xE2], extension: 'jpg', mimeType: 'image/jpeg' },
  'jpeg4': { signature: [0xFF, 0xD8, 0xFF, 0xE3], extension: 'jpg', mimeType: 'image/jpeg' },
  'jpeg5': { signature: [0xFF, 0xD8, 0xFF, 0xE8], extension: 'jpg', mimeType: 'image/jpeg' },
  'jpeg6': { signature: [0xFF, 0xD8, 0xFF, 0xDB], extension: 'jpg', mimeType: 'image/jpeg' },
  
  // PNG
  'png': { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], extension: 'png', mimeType: 'image/png' },
  
  // WebP
  'webp': { signature: [0x52, 0x49, 0x46, 0x46], extension: 'webp', mimeType: 'image/webp' }, // + "WEBP" à l'offset 8
  
  // GIF
  'gif87a': { signature: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], extension: 'gif', mimeType: 'image/gif' },
  'gif89a': { signature: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], extension: 'gif', mimeType: 'image/gif' },
  
  // BMP
  'bmp': { signature: [0x42, 0x4D], extension: 'bmp', mimeType: 'image/bmp' },
  
  // TIFF
  'tiff1': { signature: [0x49, 0x49, 0x2A, 0x00], extension: 'tiff', mimeType: 'image/tiff' },
  'tiff2': { signature: [0x4D, 0x4D, 0x00, 0x2A], extension: 'tiff', mimeType: 'image/tiff' },
}

// Signatures de fichiers malveillants à détecter
const MALICIOUS_SIGNATURES: Record<string, number[]> = {
  'exe': [0x4D, 0x5A], // MZ - Windows Executable
  'elf': [0x7F, 0x45, 0x4C, 0x46], // ELF - Linux Executable
  'pdf': [0x25, 0x50, 0x44, 0x46], // PDF (peut contenir du JS malveillant)
  'zip': [0x50, 0x4B, 0x03, 0x04], // ZIP (peut cacher des executables)
  'rar': [0x52, 0x61, 0x72, 0x21], // RAR
  'script1': [0x23, 0x21], // Shebang (#!) - Scripts Unix
  'html': [0x3C, 0x68, 0x74, 0x6D, 0x6C], // HTML
  'xml': [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // XML
}

export interface FileValidationResult {
  isValid: boolean
  detectedType?: string
  detectedMimeType?: string
  errors: string[]
  warnings: string[]
  isSuspicious: boolean
}

/**
 * Valide un fichier basé sur ses magic bytes
 */
export function validateFileBuffer(buffer: Buffer, filename: string): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let detectedType: string | undefined
  let detectedMimeType: string | undefined
  let isSuspicious = false

  // 1. Vérification taille minimum
  if (buffer.length < 8) {
    errors.push('Fichier trop petit ou corrompu')
    return { isValid: false, errors, warnings, isSuspicious }
  }

  // 2. Extraction des premiers bytes
  const header = Array.from(buffer.subarray(0, 16))

  // 3. Détection de signatures malveillantes
  for (const [type, signature] of Object.entries(MALICIOUS_SIGNATURES)) {
    if (header.slice(0, signature.length).every((byte, i) => byte === signature[i])) {
      errors.push(`Fichier suspect détecté: ${type.toUpperCase()}`)
      isSuspicious = true
      return { isValid: false, errors, warnings, isSuspicious }
    }
  }

  // 4. Détection du type d'image réel
  let matchFound = false
  
  for (const [key, { signature, extension, mimeType }] of Object.entries(IMAGE_SIGNATURES)) {
    // Vérification signature standard
    if (header.slice(0, signature.length).every((byte, i) => byte === signature[i])) {
      // Vérification spéciale pour WebP
      if (key === 'webp') {
        const webpCheck = Array.from(buffer.subarray(8, 12))
        if (webpCheck.every((byte, i) => byte === [0x57, 0x45, 0x42, 0x50][i])) {
          detectedType = extension
          detectedMimeType = mimeType
          matchFound = true
          break
        }
      } else {
        detectedType = extension
        detectedMimeType = mimeType
        matchFound = true
        break
      }
    }
  }

  if (!matchFound) {
    errors.push('Format d\'image non supporté ou fichier corrompu')
    isSuspicious = true
    return { isValid: false, errors, warnings, isSuspicious }
  }

  // 5. Vérification cohérence extension/type détecté
  const fileExtension = filename.toLowerCase().split('.').pop()
  if (fileExtension && !isExtensionCompatible(fileExtension, detectedType!)) {
    warnings.push(`Extension ${fileExtension} ne correspond pas au type détecté ${detectedType}`)
  }

  // 6. Vérifications supplémentaires pour JPEG
  if (detectedType === 'jpg') {
    const hasValidJpegEnd = checkJpegEndMarker(buffer)
    if (!hasValidJpegEnd) {
      warnings.push('Structure JPEG potentiellement corrompue')
    }
  }

  // 7. Vérification PNG
  if (detectedType === 'png') {
    const hasValidPngStructure = checkPngStructure(buffer)
    if (!hasValidPngStructure) {
      warnings.push('Structure PNG potentiellement corrompue')
    }
  }

  return {
    isValid: true,
    detectedType,
    detectedMimeType,
    errors,
    warnings,
    isSuspicious: warnings.length > 2 // Suspect si trop d'avertissements
  }
}

/**
 * Vérifie si l'extension de fichier est compatible avec le type détecté
 */
function isExtensionCompatible(extension: string, detectedType: string): boolean {
  const compatibilityMap: Record<string, string[]> = {
    'jpg': ['jpg', 'jpeg', 'jpe'],
    'png': ['png'],
    'webp': ['webp'],
    'gif': ['gif'],
    'bmp': ['bmp'],
    'tiff': ['tiff', 'tif']
  }
  
  return compatibilityMap[detectedType]?.includes(extension) || false
}

/**
 * Vérifie la présence du marqueur de fin JPEG (FFD9)
 */
function checkJpegEndMarker(buffer: Buffer): boolean {
  if (buffer.length < 2) return false
  const lastBytes = buffer.subarray(-2)
  return lastBytes[0] === 0xFF && lastBytes[1] === 0xD9
}

/**
 * Vérifie la structure basique PNG (CRC, chunks)
 */
function checkPngStructure(buffer: Buffer): boolean {
  if (buffer.length < 24) return false
  
  // Vérifier la présence du chunk IHDR après la signature
  const ihdrCheck = Array.from(buffer.subarray(12, 16))
  return ihdrCheck.every((byte, i) => byte === [0x49, 0x48, 0x44, 0x52][i]) // "IHDR"
}

/**
 * Validation supplémentaire pour les uploads
 */
export interface UploadValidationOptions {
  maxSize: number // en bytes
  allowedTypes: string[]
  strictMode: boolean // Mode strict = reject sur warnings
}

export function validateUpload(
  buffer: Buffer, 
  filename: string, 
  options: UploadValidationOptions
): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Vérification taille
  if (buffer.length > options.maxSize) {
    errors.push(`Fichier trop volumineux: ${Math.round(buffer.length / 1024 / 1024 * 100) / 100}MB > ${Math.round(options.maxSize / 1024 / 1024)}MB`)
  }

  // 2. Validation magic bytes
  const fileValidation = validateFileBuffer(buffer, filename)
  
  // 3. Vérification type autorisé
  if (fileValidation.detectedType && !options.allowedTypes.includes(fileValidation.detectedType)) {
    errors.push(`Type de fichier non autorisé: ${fileValidation.detectedType}`)
  }

  // 4. Mode strict: rejeter si warnings
  if (options.strictMode && fileValidation.warnings.length > 0) {
    errors.push('Fichier suspect en mode strict')
  }

  return {
    isValid: errors.length === 0 && fileValidation.isValid,
    detectedType: fileValidation.detectedType,
    detectedMimeType: fileValidation.detectedMimeType,
    errors: [...errors, ...fileValidation.errors],
    warnings: [...warnings, ...fileValidation.warnings],
    isSuspicious: fileValidation.isSuspicious || errors.length > 0
  }
}