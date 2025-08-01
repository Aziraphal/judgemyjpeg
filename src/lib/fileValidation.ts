import { File } from 'formidable'

// Signatures de fichiers autorisées (magic numbers)
const ALLOWED_SIGNATURES = {
  jpeg: [[0xFF, 0xD8, 0xFF]],
  png: [[0x89, 0x50, 0x4E, 0x47]],
  webp: [[0x52, 0x49, 0x46, 0x46]], // + vérification WEBP plus loin
  gif: [[0x47, 0x49, 0x46, 0x38]]
}

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
  // Pas de GIF pour éviter les GIF animés malveillants
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_FILE_SIZE = 1024 // 1KB

export interface FileValidationResult {
  isValid: boolean
  error?: string
  mimeType?: string
  size?: number
}

export function validateImageFile(file: File, buffer: Buffer): FileValidationResult {
  // 1. Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Fichier trop petit ou corrompu'
    }
  }

  // 2. Vérifier le MIME type
  if (!file.mimetype || !ALLOWED_MIMES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${ALLOWED_MIMES.join(', ')}`
    }
  }

  // 3. Vérifier la signature binaire (magic numbers)
  const isValidSignature = validateFileSignature(buffer, file.mimetype)
  if (!isValidSignature) {
    return {
      isValid: false,
      error: 'Fichier corrompu ou type de fichier falsifié'
    }
  }

  // 4. Vérifications spécifiques
  const specificValidation = validateSpecificFormat(buffer, file.mimetype)
  if (!specificValidation.isValid) {
    return specificValidation
  }

  return {
    isValid: true,
    mimeType: file.mimetype,
    size: file.size
  }
}

function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const firstBytes = Array.from(buffer.slice(0, 12))
  
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return ALLOWED_SIGNATURES.jpeg.some(sig => 
        sig.every((byte, index) => firstBytes[index] === byte)
      )
    
    case 'image/png':
      return ALLOWED_SIGNATURES.png.some(sig => 
        sig.every((byte, index) => firstBytes[index] === byte)
      )
    
    case 'image/webp':
      // WebP: RIFF + taille + WEBP
      return firstBytes[0] === 0x52 && firstBytes[1] === 0x49 && 
             firstBytes[2] === 0x46 && firstBytes[3] === 0x46 &&
             firstBytes[8] === 0x57 && firstBytes[9] === 0x45 &&
             firstBytes[10] === 0x42 && firstBytes[11] === 0x50
    
    default:
      return false
  }
}

function validateSpecificFormat(buffer: Buffer, mimeType: string): FileValidationResult {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return validateJpeg(buffer)
    
    case 'image/png':
      return validatePng(buffer)
    
    case 'image/webp':
      return validateWebp(buffer)
    
    default:
      return { isValid: false, error: 'Format non supporté' }
  }
}

function validateJpeg(buffer: Buffer): FileValidationResult {
  // Vérifier que le JPEG se termine correctement
  const end = buffer.slice(-2)
  if (end[0] !== 0xFF || end[1] !== 0xD9) {
    return { isValid: false, error: 'Fichier JPEG corrompu (fin manquante)' }
  }
  
  // Vérifier qu'il n'y a pas de données suspectes après la fin
  const lastFFD9 = buffer.lastIndexOf(Buffer.from([0xFF, 0xD9]))
  if (lastFFD9 !== buffer.length - 2) {
    return { isValid: false, error: 'Données suspectes détectées après la fin du JPEG' }
  }
  
  return { isValid: true }
}

function validatePng(buffer: Buffer): FileValidationResult {
  // Vérifier la signature PNG complète
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  const fileSignature = Array.from(buffer.slice(0, 8))
  
  if (!pngSignature.every((byte, index) => fileSignature[index] === byte)) {
    return { isValid: false, error: 'Signature PNG invalide' }
  }
  
  // Vérifier que le PNG se termine par IEND
  const end = buffer.slice(-8)
  const iendSignature = [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]
  const endSignature = Array.from(end)
  
  if (!iendSignature.every((byte, index) => endSignature[index] === byte)) {
    return { isValid: false, error: 'Fichier PNG corrompu (IEND manquant)' }
  }
  
  return { isValid: true }
}

function validateWebp(buffer: Buffer): FileValidationResult {
  // Vérifications basiques WebP déjà faites dans validateFileSignature
  // Ici on pourrait ajouter des vérifications plus poussées si nécessaire
  
  return { isValid: true }
}