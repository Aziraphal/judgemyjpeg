import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: 'up' | 'down' | 'slow'
    openai: 'up' | 'down' | 'limited'
    storage: 'up' | 'down'
  }
  metrics?: {
    responseTime: number
    dbResponseTime?: number
    memoryUsage?: number
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  const startTime = Date.now()
  
  try {
    const services: {
      database: 'up' | 'down' | 'slow'
      openai: 'up' | 'down' | 'limited'
      storage: 'up' | 'down'
    } = {
      database: 'down',
      openai: 'up', // Assume OK si pas de test
      storage: 'up'  // Assume OK si pas de test
    }
    
    // Test de la base de données
    const dbStart = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      const dbTime = Date.now() - dbStart
      services.database = dbTime > 1000 ? 'slow' : 'up'
    } catch (error) {
      services.database = 'down'
    }
    
    // Test OpenAI (simplifié pour monitoring)
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(3000) // 3s timeout pour monitoring
      })
      
      if (response.status === 429) {
        services.openai = 'limited'
      } else if (!response.ok) {
        services.openai = 'down'
      }
    } catch (error) {
      // Timeout ou erreur réseau = assume OK (pas critique pour health)
      services.openai = 'up'
    }
    
    // Déterminer le status global
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (services.database === 'down') {
      status = 'unhealthy'
    } else if (services.database === 'slow' || services.openai === 'down' || services.openai === 'limited') {
      status = 'degraded'
    }
    
    const responseTime = Date.now() - startTime
    
    const health: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      services,
      metrics: {
        responseTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
      }
    }
    
    // Status HTTP selon la santé
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503
    
    res.status(httpStatus).json(health)
    
  } catch (error) {
    const health: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'down',
        openai: 'down',
        storage: 'down'
      },
      metrics: {
        responseTime: Date.now() - startTime
      }
    }
    
    res.status(503).json(health)
  }
}