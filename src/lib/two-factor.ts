/**
 * Two-Factor Authentication Service
 * Handles TOTP generation, verification, and backup codes
 */

import { authenticator } from '@otplib/preset-default'
import QRCode from 'qrcode'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Configuration TOTP
authenticator.options = {
  window: 1, // Permet ±30 secondes de tolérance
  step: 30,  // Intervalle de 30 secondes
}

/**
 * Génère un secret TOTP pour un utilisateur
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret()
}

/**
 * Génère une URL otpauth pour QR code
 */
export function generateOTPAuthURL(
  userEmail: string,
  secret: string,
  issuer: string = 'JudgeMyJPEG'
): string {
  return authenticator.keyuri(userEmail, issuer, secret)
}

/**
 * Génère un QR code en base64 pour l'authentification
 */
export async function generateQRCode(otpAuthURL: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpAuthURL, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    })
    return qrCodeDataURL
  } catch (error) {
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Vérifie un code TOTP
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    return false
  }
}

/**
 * Génère des codes de récupération
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Format: XXXX-XXXX (8 caractères alphanumériques)
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    const formatted = `${code.substring(0, 4)}-${code.substring(4, 8)}`
    codes.push(formatted)
  }
  
  return codes
}

/**
 * Hash les codes de récupération
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const hashedCodes = await Promise.all(
    codes.map(code => bcrypt.hash(code, 12))
  )
  return hashedCodes
}

/**
 * Vérifie un code de récupération
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ isValid: boolean; codeIndex: number }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i])
    if (isValid) {
      return { isValid: true, codeIndex: i }
    }
  }
  return { isValid: false, codeIndex: -1 }
}

/**
 * Crypte le secret TOTP pour stockage sécurisé
 */
export function encryptSecret(secret: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32'
  const keyBuffer = crypto.createHash('sha256').update(key).digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv)
  
  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Décrypte le secret TOTP
 */
export function decryptSecret(encryptedSecret: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32'
  const keyBuffer = crypto.createHash('sha256').update(key).digest()
  const [ivHex, encrypted] = encryptedSecret.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Setup complet 2FA pour un utilisateur
 */
export interface Setup2FAResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  manualEntryKey: string
}

export async function setup2FA(userId: string, userEmail: string): Promise<Setup2FAResult> {
  // Générer secret et codes
  const secret = generateTOTPSecret()
  const backupCodes = generateBackupCodes()
  const hashedBackupCodes = await hashBackupCodes(backupCodes)
  
  // Crypter le secret pour stockage
  const encryptedSecret = encryptSecret(secret)
  
  // Générer QR code
  const otpAuthURL = generateOTPAuthURL(userEmail, secret)
  const qrCodeUrl = await generateQRCode(otpAuthURL)
  
  // Sauvegarder en base (mais pas encore activé)
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encryptedSecret,
      backupCodes: hashedBackupCodes,
      // twoFactorEnabled reste false jusqu'à vérification
    }
  })
  
  return {
    secret,
    qrCodeUrl,
    backupCodes,
    manualEntryKey: secret.replace(/(.{4})/g, '$1 ').trim() // Format lisible
  }
}

/**
 * Active 2FA après vérification du premier code
 */
export async function enable2FA(userId: string, verificationCode: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true }
  })
  
  if (!user?.twoFactorSecret) {
    return false
  }
  
  // Décrypter le secret et vérifier le code
  const secret = decryptSecret(user.twoFactorSecret)
  const isValid = verifyTOTP(verificationCode, secret)
  
  if (isValid) {
    // Activer 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorVerified: new Date()
      }
    })
    return true
  }
  
  return false
}

/**
 * Désactive 2FA
 */
export async function disable2FA(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
      twoFactorVerified: null
    }
  })
}

/**
 * Vérifie 2FA lors de la connexion (TOTP ou backup code)
 */
export async function verify2FALogin(
  userId: string, 
  code: string
): Promise<{ success: boolean; usedBackupCode?: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      twoFactorSecret: true, 
      twoFactorEnabled: true,
      backupCodes: true 
    }
  })
  
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false }
  }
  
  // Essayer TOTP d'abord
  const secret = decryptSecret(user.twoFactorSecret)
  const isTOTPValid = verifyTOTP(code, secret)
  
  if (isTOTPValid) {
    return { success: true }
  }
  
  // Essayer codes de récupération
  const backupResult = await verifyBackupCode(code, user.backupCodes)
  
  if (backupResult.isValid) {
    // Supprimer le code utilisé
    const updatedCodes = user.backupCodes.filter((_, index) => index !== backupResult.codeIndex)
    
    await prisma.user.update({
      where: { id: userId },
      data: { backupCodes: updatedCodes }
    })
    
    return { success: true, usedBackupCode: true }
  }
  
  return { success: false }
}

/**
 * Régénère les codes de récupération
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  const newCodes = generateBackupCodes()
  const hashedCodes = await hashBackupCodes(newCodes)
  
  await prisma.user.update({
    where: { id: userId },
    data: { backupCodes: hashedCodes }
  })
  
  return newCodes
}

/**
 * Vérifie si l'utilisateur a 2FA activé
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true }
  })
  
  return user?.twoFactorEnabled || false
}

/**
 * Stats 2FA pour l'utilisateur
 */
export async function get2FAStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      twoFactorEnabled: true,
      twoFactorVerified: true,
      backupCodes: true
    }
  })
  
  return {
    enabled: user?.twoFactorEnabled || false,
    verifiedAt: user?.twoFactorVerified,
    backupCodesRemaining: user?.backupCodes?.length || 0
  }
}