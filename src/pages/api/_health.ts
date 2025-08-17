import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test connexion DB
    await prisma.$queryRaw`SELECT 1`
    
    // Test variables critiques
    const checks = {
      database: true,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      nextauth: !!process.env.NEXTAUTH_SECRET,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV
    }

    res.status(200).json({
      status: 'healthy',
      checks,
      message: 'All systems operational'
    })

  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}