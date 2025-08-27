/**
 * Device Detection & Geolocation Service
 * Utilitaires pour détecter les appareils et localiser les connexions
 */

import type { NextApiRequest } from 'next'
import { logger } from '@/lib/logger'

export interface DeviceInfo {
  deviceName: string
  browser: string
  os: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export interface LocationInfo {
  ip: string
  country?: string
  region?: string
  city?: string
  location?: string // Format: "City, Region, Country"
}

/**
 * Extrait les informations de l'User-Agent
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Détection du navigateur
  let browser = 'Unknown'
  if (ua.includes('chrome') && !ua.includes('edge') && !ua.includes('opr')) {
    browser = 'Chrome'
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
  } else if (ua.includes('edge')) {
    browser = 'Microsoft Edge'
  } else if (ua.includes('opr') || ua.includes('opera')) {
    browser = 'Opera'
  }

  // Détection de l'OS
  let os = 'Unknown'
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('mac os')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS'
  }

  // Détection du type d'appareil
  const isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')
  const isTablet = ua.includes('tablet') || ua.includes('ipad')
  const isDesktop = !isMobile && !isTablet

  // Nom de l'appareil
  let deviceName = 'Ordinateur'
  if (isMobile) {
    deviceName = 'Téléphone mobile'
  } else if (isTablet) {
    deviceName = 'Tablette'
  }

  // Spécifications plus précises
  if (ua.includes('iphone')) {
    deviceName = 'iPhone'
  } else if (ua.includes('ipad')) {
    deviceName = 'iPad'
  } else if (ua.includes('samsung')) {
    deviceName = 'Samsung'
  } else if (ua.includes('pixel')) {
    deviceName = 'Google Pixel'
  }

  return {
    deviceName,
    browser,
    os,
    isMobile,
    isTablet,
    isDesktop
  }
}

/**
 * Extrait l'adresse IP réelle du client
 */
export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string
  const realIp = req.headers['x-real-ip'] as string
  const cfIp = req.headers['cf-connecting-ip'] as string

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfIp) {
    return cfIp
  }

  return req.socket.remoteAddress || 'unknown'
}

/**
 * Géolocalisation basique de l'IP (simulation)
 * En production, utiliser un service comme ipapi.co ou MaxMind
 */
export async function getLocationFromIP(ip: string): Promise<LocationInfo> {
  // Pour le développement local
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip === 'unknown') {
    return {
      ip: ip,
      country: 'France',
      region: 'Île-de-France',
      city: 'Paris',
      location: 'Paris, Île-de-France, France'
    }
  }

  // Service gratuit ipapi.co (limité à 1000 requests/jour)
  // En production, utiliser un service payant ou MaxMind
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'JudgeMyJPEG/1.0'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      
      return {
        ip,
        country: data.country_name || 'Inconnu',
        region: data.region || 'Inconnu',
        city: data.city || 'Inconnu',
        location: `${data.city || 'Ville inconnue'}, ${data.region || 'Région inconnue'}, ${data.country_name || 'Pays inconnu'}`
      }
    }
  } catch (error) {
    logger.warn('Geolocation API failed:', error)
    clearTimeout(timeoutId)
  }

  // Fallback si l'API échoue
  return {
    ip,
    country: 'Inconnu',
    region: 'Inconnu', 
    city: 'Inconnu',
    location: 'Localisation inconnue'
  }
}

/**
 * Combine device et location info
 */
export async function getFullDeviceContext(req: NextApiRequest): Promise<{
  device: DeviceInfo
  location: LocationInfo
  timestamp: Date
}> {
  const userAgent = req.headers['user-agent'] || 'Unknown'
  const ip = getClientIP(req)

  const [device, location] = await Promise.all([
    Promise.resolve(parseUserAgent(userAgent)),
    getLocationFromIP(ip)
  ])

  return {
    device,
    location,
    timestamp: new Date()
  }
}

/**
 * Génère un fingerprint unique pour un appareil (simple)
 */
export function generateDeviceFingerprint(device: DeviceInfo, ip: string): string {
  const fingerprint = `${device.browser}-${device.os}-${device.deviceName}-${ip}`
  return Buffer.from(fingerprint).toString('base64').slice(0, 16)
}

/**
 * Vérifie si c'est un nouvel appareil pour un utilisateur
 * En production, stocker les fingerprints en base
 */
export async function isNewDevice(
  userId: string, 
  deviceFingerprint: string
): Promise<boolean> {
  // Simulation - en production, vérifier en base de données
  // Rechercher dans une table `user_devices` par exemple
  
  try {
    // Ici on pourrait avoir :
    // const existingDevice = await prisma.userDevice.findFirst({
    //   where: {
    //     userId,
    //     fingerprint: deviceFingerprint
    //   }
    // })
    // return !existingDevice

    // Pour maintenant, simuler la détection (toujours nouvel appareil en dev)
    return true
  } catch (error) {
    logger.error('Device check failed:', error)
    return true // En cas d'erreur, traiter comme nouvel appareil par sécurité
  }
}

/**
 * Enregistre un nouvel appareil (simulation)
 */
export async function registerNewDevice(
  userId: string,
  deviceInfo: DeviceInfo,
  locationInfo: LocationInfo,
  fingerprint: string
): Promise<void> {
  try {
    // En production :
    // await prisma.userDevice.create({
    //   data: {
    //     userId,
    //     fingerprint,
    //     deviceName: deviceInfo.deviceName,
    //     browser: deviceInfo.browser,
    //     os: deviceInfo.os,
    //     lastUsed: new Date(),
    //     firstSeen: new Date(),
    //     lastIP: locationInfo.ip,
    //     lastLocation: locationInfo.location
    //   }
    // })
    
    logger.debug(`New device registered for user ${userId}:`, {
      fingerprint,
      device: deviceInfo.deviceName,
      location: locationInfo.location
    })
  } catch (error) {
    logger.error('Failed to register device:', error)
  }
}