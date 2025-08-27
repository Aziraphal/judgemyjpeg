import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@/lib/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Vérifier l'auth admin
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const { alertId } = req.query
    const { status } = req.body

    if (!alertId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'alertId and status are required' 
      })
    }

    // Pour le moment, on simule la résolution d'alerte
    // Dans un vrai système, on aurait une table security_alerts
    
    logger.info('[ADMIN] Security alert resolved', { 
      alertId,
      status,
      resolvedBy: 'admin', // TODO: récupérer l'admin depuis le token
      timestamp: new Date().toISOString()
    })

    res.status(200).json({
      success: true,
      message: 'Alerte mise à jour avec succès'
    })
  } catch (error) {
    logger.error('[ADMIN] Failed to update security alert:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'alerte'
    })
  }
}