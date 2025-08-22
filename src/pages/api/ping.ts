import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Ultra-lightweight health check pour UptimeRobot
 * Répond en <100ms sans tests DB/OpenAI
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Headers pour monitoring
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('X-Health-Check', 'ping')
  
  // Réponse ultra-rapide
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}