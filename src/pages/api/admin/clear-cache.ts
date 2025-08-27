/**
 * Admin Cache Clear API
 * Endpoint pour nettoyer le cache de rate limiting admin
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { clearRateLimitCache } from './auth'
import { logger } from '@/lib/logger'

interface ClearCacheResponse {
  success: boolean
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClearCacheResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { adminSecret } = req.body

    // Vérifier la clé secrète
    const expectedSecret = process.env.ADMIN_SECRET
    if (!expectedSecret || adminSecret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: 'Clé d\'administration invalide'
      })
    }

    // Nettoyer le cache
    clearRateLimitCache()

    res.status(200).json({
      success: true,
      message: 'Cache de rate limiting nettoyé avec succès'
    })

  } catch (error) {
    logger.error('Clear cache error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage du cache'
    })
  }
}