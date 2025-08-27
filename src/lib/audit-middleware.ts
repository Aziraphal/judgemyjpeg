/**
 * Audit Middleware - Automatic audit logging for API endpoints
 * Phase 2 Security Enhancement
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { AuditLogger } from '@/lib/audit-trail'
import { SuspiciousLoginDetector, notifySuspiciousLogin } from '@/lib/suspicious-login-detector'
import { getClientIP, logger } from '@/lib/logger'

export type AuditableEndpoint = {
  path: string
  methods: string[]
  eventType: string
  riskLevel: 'low' | 'medium' | 'high'
  extractMetadata?: (req: NextApiRequest, res: NextApiResponse) => Record<string, any>
}

// Define which endpoints should be audited
const AUDITABLE_ENDPOINTS: AuditableEndpoint[] = [
  {
    path: '/api/photos/analyze',
    methods: ['POST'],
    eventType: 'photo_analysis',
    riskLevel: 'low',
    extractMetadata: (req) => ({
      fileSize: req.headers['content-length'],
      tone: req.body?.tone,
      language: req.body?.language
    })
  },
  {
    path: '/api/stripe/create-checkout',
    methods: ['POST'],
    eventType: 'subscription_upgrade',
    riskLevel: 'medium',
    extractMetadata: (req) => ({
      priceId: req.body?.priceId,
      plan: req.body?.plan
    })
  },
  {
    path: '/api/admin/upgrade-user',
    methods: ['POST'],
    eventType: 'admin_action',
    riskLevel: 'high',
    extractMetadata: (req) => ({
      targetUserId: req.body?.userId,
      action: 'upgrade_user'
    })
  },
  {
    path: '/api/collections',
    methods: ['POST', 'DELETE'],
    eventType: 'collection_created',
    riskLevel: 'low'
  }
]

/**
 * Higher-order function to wrap API handlers with audit logging
 */
export function withAudit<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
  options?: {
    eventType?: string
    riskLevel?: 'low' | 'medium' | 'high'
    extractMetadata?: (req: NextApiRequest, res: NextApiResponse, result?: T) => Record<string, any>
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<T> => {
    const startTime = Date.now()
    let result: T
    let error: Error | null = null

    // Find matching auditable endpoint
    const endpoint = AUDITABLE_ENDPOINTS.find(ep => 
      req.url?.includes(ep.path) && ep.methods.includes(req.method || '')
    )

    if (!endpoint && !options) {
      // No audit configuration found
      return handler(req, res)
    }

    const auditConfig = options || endpoint!
    const auditLogger = new AuditLogger(req)

    try {
      result = await handler(req, res)

      // Log successful operation
      const metadata = {
        ...(auditConfig.extractMetadata ? auditConfig.extractMetadata(req, res, result) : {}),
        duration: Date.now() - startTime,
        method: req.method,
        url: req.url
      }

      // Use the logAuditEvent function directly since auditEvent doesn't exist
      const { logAuditEvent } = await import('@/lib/audit-trail')
      const { getClientIP } = await import('@/lib/logger')
      
      await logAuditEvent({
        userId: (req as any).user?.id,
        email: (req as any).user?.email,
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'],
        eventType: (auditConfig.eventType || 'api_call') as any,
        description: `Successful ${req.method} ${req.url}`,
        metadata,
        riskLevel: auditConfig.riskLevel || 'low',
        success: true
      })

      return result

    } catch (err) {
      error = err as Error

      // Log failed operation
      const { logAuditEvent } = await import('@/lib/audit-trail')
      const { getClientIP } = await import('@/lib/logger')
      
      await logAuditEvent({
        userId: (req as any).user?.id,
        email: (req as any).user?.email,
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'],
        eventType: (auditConfig.eventType || 'api_call') as any,
        description: `Failed ${req.method} ${req.url}: ${error.message}`,
        metadata: {
          error: error.message,
          stack: error.stack,
          duration: Date.now() - startTime,
          method: req.method,
          url: req.url
        },
        riskLevel: 'high', // Failures are always high risk
        success: false
      })

      throw error
    }
  }
}


/**
 * Middleware to detect and log suspicious login attempts
 */
export async function auditLoginAttempt(
  req: NextApiRequest,
  email: string,
  success: boolean,
  reason?: string
): Promise<void> {
  const detector = new SuspiciousLoginDetector(req, email)
  const auditLogger = new AuditLogger(req, undefined, email)

  const loginAttempt = {
    email,
    ipAddress: getClientIP(req),
    userAgent: req.headers['user-agent'],
    timestamp: new Date(),
    success
  }

  if (success) {
    // Analyze successful login for suspicious patterns
    const suspiciousActivities = await detector.analyzeLoginAttempt(loginAttempt)
    
    if (suspiciousActivities.length > 0) {
      // Notify user of suspicious login
      const highRiskActivities = suspiciousActivities.filter(a => a.severity === 'high')
      if (highRiskActivities.length > 0) {
        await notifySuspiciousLogin(email, suspiciousActivities, loginAttempt.ipAddress)
      }
    }

    await auditLogger.loginSuccess(email, {
      suspiciousActivities: suspiciousActivities.length
    })
  } else {
    // Log failed login attempt
    await auditLogger.loginFailed(email, reason || 'Invalid credentials')
  }
}

/**
 * Audit decorator for class methods
 */
export function Audit(eventType: string, riskLevel: 'low' | 'medium' | 'high' = 'low') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      
      try {
        const result = await method.apply(this, args)
        
        // Log successful operation
        // This would need access to the request context
        logger.debug(`[AUDIT] ${eventType}: Success in ${Date.now() - startTime}ms`)
        
        return result
      } catch (error) {
        // Log failed operation
        logger.debug(`[AUDIT] ${eventType}: Failed - ${error}`)
        throw error
      }
    }
  }
}

/**
 * Create audit log entry manually (for custom events)
 */
export async function createAuditLog(data: {
  userId?: string
  email?: string
  ipAddress: string
  userAgent?: string
  eventType: string
  description: string
  metadata?: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  success: boolean
}) {
  const auditLogger = {
    auditEvent: async (eventData: any) => {
      // Direct database call since we don't have request context
      const { prisma } = await import('@/lib/prisma')
      
      await prisma.auditLog.create({
        data: {
          userId: eventData.userId,
          email: eventData.email,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          eventType: eventData.eventType,
          description: eventData.description,
          metadata: eventData.metadata ? JSON.stringify(eventData.metadata) : null,
          riskLevel: eventData.riskLevel,
          success: eventData.success,
          timestamp: new Date()
        }
      })
    }
  }

  await auditLogger.auditEvent(data)
}