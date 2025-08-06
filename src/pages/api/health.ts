/**
 * Health Check Endpoint - Production Monitoring
 * Checks all critical services status
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: {
      status: 'up' | 'down'
      responseTime?: number
      error?: string
    }
    email: {
      status: 'up' | 'down'
      provider: string
    }
    monitoring: {
      status: 'up' | 'down'
      sentry: boolean
      analytics: boolean
    }
  }
  version: string
  uptime: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthStatus>) {
  const startTime = Date.now()
  
  // Check database connection
  const dbCheck = await checkDatabase()
  
  // Check email service
  const emailCheck = await checkEmailService()
  
  // Check monitoring services
  const monitoringCheck = checkMonitoring()
  
  const responseTime = Date.now() - startTime
  
  // Determine overall status
  const allServicesUp = dbCheck.status === 'up' && 
                       emailCheck.status === 'up' && 
                       monitoringCheck.status === 'up'
  
  const someServicesDown = dbCheck.status === 'down' || 
                          emailCheck.status === 'down'
  
  const overallStatus: HealthStatus['status'] = 
    allServicesUp ? 'healthy' : 
    someServicesDown ? 'unhealthy' : 
    'degraded'

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: dbCheck,
      email: emailCheck,
      monitoring: monitoringCheck
    },
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  }

  // Set appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503

  res.status(statusCode).json(healthStatus)
}

async function checkDatabase() {
  const startTime = Date.now()
  
  try {
    // Simple connectivity test
    await prisma.$queryRaw`SELECT 1`
    
    // Check if we can read from main tables
    const userCount = await prisma.user.count()
    const photoCount = await prisma.photo.count()
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'up' as const,
      responseTime,
      metadata: {
        users: userCount,
        photos: photoCount
      }
    }
  } catch (error) {
    return {
      status: 'down' as const,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

async function checkEmailService() {
  try {
    // Check if Resend API key is configured
    const hasResendKey = !!process.env.RESEND_API_KEY
    
    if (!hasResendKey) {
      return {
        status: 'down' as const,
        provider: 'resend',
        error: 'RESEND_API_KEY not configured'
      }
    }

    // In production, you might want to do a real API test
    // For now, just check configuration
    return {
      status: 'up' as const,
      provider: 'resend'
    }
  } catch (error) {
    return {
      status: 'down' as const,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Email service error'
    }
  }
}

function checkMonitoring() {
  const sentryConfigured = !!process.env.NEXT_PUBLIC_SENTRY_DSN
  const analyticsEnabled = true // Vercel Analytics is always enabled
  
  return {
    status: (sentryConfigured && analyticsEnabled) ? 'up' as const : 'down' as const,
    sentry: sentryConfigured,
    analytics: analyticsEnabled
  }
}

// Export the health check function for use in other parts of the app
export { checkDatabase, checkEmailService, checkMonitoring }