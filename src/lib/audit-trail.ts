/**
 * Audit Trail System - Phase 2 Security
 * Track critical user actions for security and compliance
 */

import { prisma } from '@/lib/prisma'
import { logger, getClientIP } from '@/lib/logger'
import type { NextApiRequest } from 'next'

export type AuditEventType = 
  // Authentication Events
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'account_locked'
  | 'password_changed'
  | 'password_change_failed'
  | 'email_verified'
  | 'registration'
  | '2fa_setup_initiated'
  | '2fa_enabled'
  | '2fa_enable_failed'
  | '2fa_disabled'
  | '2fa_backup_codes_regenerated'
  | '2fa_login_success'
  | '2fa_login_failed'
  
  // Account Events
  | 'subscription_upgrade'
  | 'subscription_cancel'
  | 'profile_update'
  | 'email_change'
  
  // Photo Events
  | 'photo_upload'
  | 'photo_analysis'
  | 'photo_delete'
  | 'collection_created'
  | 'collection_deleted'
  
  // Security Events
  | 'suspicious_login'
  | 'multiple_failed_logins'
  | 'file_upload_rejected'
  | 'rate_limit_exceeded'
  | 'session_created'
  | 'session_invalidated'
  | 'sessions_bulk_invalidated'
  | 'suspicious_session_blocked'
  
  // Admin Events
  | 'admin_login'
  | 'admin_login_success'
  | 'admin_login_failed'
  | 'admin_login_blocked'
  | 'admin_config_error'
  | 'admin_auth_error'
  | 'admin_sessions_viewed'
  | 'admin_session_invalidated'
  | 'admin_bulk_session_invalidation'
  | 'admin_bulk_session_suspicious'
  | 'admin_bulk_session_clear_suspicious'
  | 'admin_sessions_error'
  | 'admin_bulk_sessions_error'
  | 'user_upgraded_by_admin'
  | 'admin_action'

export interface AuditEventData {
  userId?: string
  email?: string
  ipAddress: string
  userAgent?: string
  eventType: AuditEventType
  description: string
  metadata?: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  success: boolean
}

/**
 * Log audit event to database and security logs
 */
export async function logAuditEvent(eventData: AuditEventData): Promise<void> {
  try {
    // Log to database for persistent audit trail
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

    // Log to application logs for immediate monitoring
    const logLevel = eventData.riskLevel === 'critical' || eventData.riskLevel === 'high' ? 'error' : 'info'
    
    logger[logLevel](`[AUDIT] ${eventData.eventType}: ${eventData.description}`, {
      eventType: eventData.eventType,
      riskLevel: eventData.riskLevel,
      success: eventData.success,
      metadata: eventData.metadata
    }, eventData.userId, eventData.ipAddress)

    // Alert for critical events
    if (eventData.riskLevel === 'critical') {
      await alertCriticalEvent(eventData)
    }

  } catch (error) {
    logger.error('Failed to log audit event', error, eventData.userId, eventData.ipAddress)
  }
}

/**
 * Extract audit context from request
 */
export function extractAuditContext(req: NextApiRequest, userId?: string): Partial<AuditEventData> {
  return {
    userId,
    ipAddress: getClientIP(req),
    userAgent: req.headers['user-agent']
  }
}

/**
 * Quick audit logging for common events
 */
export class AuditLogger {
  private baseContext: Partial<AuditEventData>

  constructor(req: NextApiRequest, userId?: string, email?: string) {
    this.baseContext = {
      ...extractAuditContext(req, userId),
      email
    }
  }

  private createEventData(overrides: Partial<AuditEventData>): AuditEventData {
    return {
      userId: this.baseContext.userId,
      email: this.baseContext.email,
      ipAddress: this.baseContext.ipAddress || 'unknown',
      userAgent: this.baseContext.userAgent,
      riskLevel: 'low',
      success: true,
      ...overrides
    } as AuditEventData
  }

  async loginSuccess(email: string, metadata?: Record<string, any>) {
    await logAuditEvent(this.createEventData({
      email,
      eventType: 'login_success',
      description: `Successful login for ${email}`,
      metadata,
      riskLevel: 'low',
      success: true
    }))
  }

  async loginFailed(email: string, reason: string, attemptCount?: number) {
    await logAuditEvent(this.createEventData({
      email,
      eventType: 'login_failed',
      description: `Failed login attempt for ${email}: ${reason}`,
      metadata: { reason, attemptCount },
      riskLevel: attemptCount && attemptCount >= 3 ? 'high' : 'medium',
      success: false
    }))
  }

  async suspiciousLogin(email: string, reason: string, metadata?: Record<string, any>) {
    await logAuditEvent(this.createEventData({
      email,
      eventType: 'suspicious_login',
      description: `Suspicious login detected for ${email}: ${reason}`,
      metadata,
      riskLevel: 'high',
      success: false
    }))
  }

  async passwordChanged(userId: string) {
    await logAuditEvent(this.createEventData({
      userId,
      eventType: 'password_changed',
      description: 'User changed password',
      riskLevel: 'medium',
      success: true
    }))
  }

  async subscriptionUpgrade(userId: string, plan: string, amount: number) {
    await logAuditEvent(this.createEventData({
      userId,
      eventType: 'subscription_upgrade',
      description: `Subscription upgraded to ${plan}`,
      metadata: { plan, amount },
      riskLevel: 'low',
      success: true
    }))
  }

  async photoAnalysis(userId: string, filename: string, score: number) {
    await logAuditEvent(this.createEventData({
      userId,
      eventType: 'photo_analysis',
      description: `Photo analyzed: ${filename}`,
      metadata: { filename, score },
      riskLevel: 'low',
      success: true
    }))
  }

  async fileUploadRejected(userId: string, filename: string, reason: string) {
    await logAuditEvent(this.createEventData({
      userId,
      eventType: 'file_upload_rejected',
      description: `File upload rejected: ${filename}`,
      metadata: { filename, reason },
      riskLevel: 'high',
      success: false
    }))
  }

  async rateLimitExceeded(endpoint: string, limit: number) {
    await logAuditEvent(this.createEventData({
      eventType: 'rate_limit_exceeded',
      description: `Rate limit exceeded for ${endpoint}`,
      metadata: { endpoint, limit },
      riskLevel: 'medium',
      success: false
    }))
  }

  async adminAction(adminUserId: string, action: string, targetUserId?: string) {
    await logAuditEvent(this.createEventData({
      userId: adminUserId,
      eventType: 'admin_action',
      description: `Admin action: ${action}`,
      metadata: { action, targetUserId },
      riskLevel: 'high',
      success: true
    }))
  }

  // Generic security event logger for 2FA and other security events
  async logSecurity(eventType: AuditEventType, data: Partial<AuditEventData>) {
    await logAuditEvent(this.createEventData({
      eventType,
      riskLevel: 'medium',
      success: true,
      ...data
    }))
  }
}

/**
 * Alert for critical security events
 */
async function alertCriticalEvent(eventData: AuditEventData): Promise<void> {
  try {
    // For now, just log critically
    // In production, you'd send to monitoring systems (Slack, email, etc.)
    logger.error(`🚨 CRITICAL SECURITY EVENT: ${eventData.eventType}`, {
      description: eventData.description,
      userId: eventData.userId,
      email: eventData.email,
      ipAddress: eventData.ipAddress,
      metadata: eventData.metadata
    })
    
    // Future: Send to monitoring/alerting systems
    // await sendSlackAlert(eventData)
    // await sendEmailAlert(eventData)
    
  } catch (error) {
    logger.error('Failed to send critical event alert', error)
  }
}

/**
 * Get audit logs for a user (for compliance/debugging)
 */
export async function getUserAuditLogs(
  userId: string, 
  options: {
    limit?: number
    eventTypes?: AuditEventType[]
    startDate?: Date
    endDate?: Date
  } = {}
) {
  const { limit = 100, eventTypes, startDate, endDate } = options

  return await prisma.auditLog.findMany({
    where: {
      userId,
      ...(eventTypes && { eventType: { in: eventTypes } }),
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } })
    },
    orderBy: { timestamp: 'desc' },
    take: limit
  })
}

/**
 * Get security summary for admin dashboard
 */
export async function getSecuritySummary(days: number = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [
    totalEvents,
    criticalEvents,
    failedLogins,
    suspiciousActivity,
    recentEvents
  ] = await Promise.all([
    prisma.auditLog.count({
      where: { timestamp: { gte: startDate } }
    }),
    prisma.auditLog.count({
      where: { 
        timestamp: { gte: startDate },
        riskLevel: 'critical'
      }
    }),
    prisma.auditLog.count({
      where: { 
        timestamp: { gte: startDate },
        eventType: 'login_failed'
      }
    }),
    prisma.auditLog.count({
      where: { 
        timestamp: { gte: startDate },
        eventType: { in: ['suspicious_login', 'multiple_failed_logins'] }
      }
    }),
    prisma.auditLog.findMany({
      where: { timestamp: { gte: startDate } },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        eventType: true,
        description: true,
        riskLevel: true,
        timestamp: true,
        ipAddress: true,
        email: true
      }
    })
  ])

  return {
    totalEvents,
    criticalEvents,
    failedLogins,
    suspiciousActivity,
    recentEvents,
    period: `${days} days`
  }
}