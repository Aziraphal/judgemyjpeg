import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@/lib/logger'

interface LocationResponse {
  country: string
  countryCode: string
  city?: string
  region?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Priorité : Headers Cloudflare (si site derrière CF)
    const cfCountry = req.headers['cf-ipcountry'] as string
    const cfCity = req.headers['cf-ipcity'] as string
    const cfRegion = req.headers['cf-region'] as string

    if (cfCountry && cfCountry !== 'XX') {
      logger.info('Location detected via Cloudflare:', { cfCountry, cfCity, cfRegion })
      
      // Mapper les codes pays vers noms complets
      const countryNames: Record<string, string> = {
        'FR': 'France', 'US': 'United States', 'GB': 'United Kingdom',
        'DE': 'Germany', 'ES': 'Spain', 'IT': 'Italy', 'PT': 'Portugal',
        'BE': 'Belgium', 'NL': 'Netherlands', 'CH': 'Switzerland',
        'CA': 'Canada', 'AU': 'Australia', 'BR': 'Brazil', 'MX': 'Mexico'
      }

      return res.json({
        country: countryNames[cfCountry] || cfCountry,
        countryCode: cfCountry,
        city: cfCity || undefined,
        region: cfRegion || undefined
      } as LocationResponse)
    }

    // 2. Fallback : Géolocalisation IP via ip-api.com (server-side)
    const clientIP = req.headers['x-forwarded-for']?.toString().split(',')[0] 
      || req.headers['x-real-ip']?.toString()
      || req.socket.remoteAddress
      || '8.8.8.8' // Fallback for development

    logger.debug('Trying IP geolocation for:', clientIP)

    const response = await fetch(`https://ip-api.com/json/${clientIP}?fields=status,country,countryCode,regionName,city`)
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.status === 'success') {
        return res.json({
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          region: data.regionName
        } as LocationResponse)
      }
    }

    // 3. Fallback ultime : France par défaut
    logger.warn('Location detection failed, using France fallback')
    return res.json({
      country: 'France',
      countryCode: 'FR'
    } as LocationResponse)

  } catch (error) {
    logger.error('Location detection error:', error)
    
    // Fallback France en cas d'erreur
    return res.json({
      country: 'France', 
      countryCode: 'FR'
    } as LocationResponse)
  }
}