/**
 * Suspicious Login Detection System - Phase 2 Security
 * Detect and alert on potentially malicious login attempts
 */

import geoip from 'geoip-lite'
import { AuditLogger } from '@/lib/audit-trail'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { NextApiRequest } from 'next'

export interface LoginAttempt {
  email: string
  ipAddress: string
  userAgent?: string
  timestamp: Date
  success: boolean
  location?: {
    country?: string
    region?: string
    city?: string
    timezone?: string
  }
}

export interface SuspiciousActivity {
  type: 'new_location' | 'unusual_time' | 'rapid_attempts' | 'new_device' | 'tor_vpn'
  severity: 'low' | 'medium' | 'high'
  description: string
  metadata?: Record<string, any>
}

/**
 * Detect suspicious login patterns
 */
export class SuspiciousLoginDetector {
  private auditLogger: AuditLogger

  constructor(req: NextApiRequest, email?: string) {
    this.auditLogger = new AuditLogger(req, undefined, email)
  }

  /**
   * Analyze login attempt for suspicious patterns
   */
  async analyzeLoginAttempt(attempt: LoginAttempt): Promise<SuspiciousActivity[]> {
    const suspiciousActivities: SuspiciousActivity[] = []

    try {
      // Get user's login history
      const recentLogins = await this.getRecentLogins(attempt.email, 30) // 30 days
      
      // 1. Check for new geographical location
      const locationSuspicion = await this.checkNewLocation(attempt, recentLogins)
      if (locationSuspicion) suspiciousActivities.push(locationSuspicion)

      // 2. Check for unusual login time
      const timeSuspicion = this.checkUnusualTime(attempt, recentLogins)
      if (timeSuspicion) suspiciousActivities.push(timeSuspicion)

      // 3. Check for rapid failed attempts
      const rapidAttemptsSuspicion = await this.checkRapidFailedAttempts(attempt.email, attempt.ipAddress)
      if (rapidAttemptsSuspicion) suspiciousActivities.push(rapidAttemptsSuspicion)

      // 4. Check for new device/browser
      const deviceSuspicion = this.checkNewDevice(attempt, recentLogins)
      if (deviceSuspicion) suspiciousActivities.push(deviceSuspicion)

      // 5. Check for known malicious IPs (Tor, VPN, etc.)
      const ipSuspicion = this.checkSuspiciousIP(attempt.ipAddress)
      if (ipSuspicion) suspiciousActivities.push(ipSuspicion)

      // Log all suspicious activities
      for (const activity of suspiciousActivities) {
        await this.auditLogger.suspiciousLogin(
          attempt.email, 
          activity.description,
          {
            type: activity.type,
            severity: activity.severity,
            location: attempt.location,
            userAgent: attempt.userAgent,
            ...activity.metadata
          }
        )
      }

    } catch (error) {
      logger.error('Error analyzing login attempt', error, undefined, attempt.ipAddress)
    }

    return suspiciousActivities
  }

  /**
   * Check if login is from a new geographical location
   */
  private async checkNewLocation(attempt: LoginAttempt, recentLogins: any[]): Promise<SuspiciousActivity | null> {
    const currentLocation = geoip.lookup(attempt.ipAddress)
    if (!currentLocation) return null

    attempt.location = {
      country: currentLocation.country,
      region: currentLocation.region,
      city: currentLocation.city,
      timezone: currentLocation.timezone
    }

    // Check if user has logged in from this country before
    const knownCountries = new Set(
      recentLogins
        .map(login => login.metadata?.location?.country)
        .filter(Boolean)
    )

    if (knownCountries.size > 0 && !knownCountries.has(currentLocation.country)) {
      return {
        type: 'new_location',
        severity: 'high',
        description: `Login from new country: ${currentLocation.country}`,
        metadata: {
          newLocation: attempt.location,
          knownCountries: Array.from(knownCountries)
        }
      }
    }

    // Check for significant distance change (different city)
    const recentLocations = recentLogins
      .map(login => login.metadata?.location)
      .filter(Boolean)
      .slice(0, 5) // Last 5 locations

    if (recentLocations.length > 0) {
      const isDifferentCity = !recentLocations.some(loc => 
        loc.city === currentLocation.city && loc.country === currentLocation.country
      )

      if (isDifferentCity) {
        return {
          type: 'new_location',
          severity: 'medium',
          description: `Login from new city: ${currentLocation.city}, ${currentLocation.country}`,
          metadata: {
            newLocation: attempt.location,
            recentLocations
          }
        }
      }
    }

    return null
  }

  /**
   * Check for unusual login time based on user's pattern
   */
  private checkUnusualTime(attempt: LoginAttempt, recentLogins: any[]): SuspiciousActivity | null {
    if (recentLogins.length < 5) return null // Need enough data

    const attemptHour = attempt.timestamp.getHours()
    const recentHours = recentLogins
      .filter(login => login.success)
      .map(login => new Date(login.timestamp).getHours())

    if (recentHours.length === 0) return null

    // Calculate user's typical login hours
    const hourCounts = recentHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const totalLogins = recentHours.length
    const currentHourFrequency = (hourCounts[attemptHour] || 0) / totalLogins

    // If user has never logged in at this hour and it's unusual (middle of night)
    if (currentHourFrequency === 0 && (attemptHour < 6 || attemptHour > 23)) {
      return {
        type: 'unusual_time',
        severity: 'medium',
        description: `Login at unusual hour: ${attemptHour}:00`,
        metadata: {
          hour: attemptHour,
          typicalHours: Object.keys(hourCounts).map(Number),
          frequency: currentHourFrequency
        }
      }
    }

    return null
  }

  /**
   * Check for rapid failed login attempts
   */
  private async checkRapidFailedAttempts(email: string, ipAddress: string): Promise<SuspiciousActivity | null> {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000)
    
    const recentFailures = await prisma.auditLog.count({
      where: {
        email,
        eventType: 'login_failed',
        timestamp: { gte: last5Minutes }
      }
    })

    if (recentFailures >= 3) {
      return {
        type: 'rapid_attempts',
        severity: 'high',
        description: `${recentFailures} failed login attempts in 5 minutes`,
        metadata: {
          failureCount: recentFailures,
          timeWindow: '5 minutes',
          ipAddress
        }
      }
    }

    return null
  }

  /**
   * Check for new device/browser based on User-Agent
   */
  private checkNewDevice(attempt: LoginAttempt, recentLogins: any[]): SuspiciousActivity | null {
    if (!attempt.userAgent || recentLogins.length === 0) return null

    const knownUserAgents = new Set(
      recentLogins
        .filter(login => login.success)
        .map(login => login.userAgent)
        .filter(Boolean)
    )

    // Simple check: if exact User-Agent never seen before
    if (!knownUserAgents.has(attempt.userAgent)) {
      // Extract basic info from User-Agent
      const isNewBrowser = !Array.from(knownUserAgents).some(ua => 
        this.extractBrowserInfo(ua).browser === this.extractBrowserInfo(attempt.userAgent || '').browser
      )

      if (isNewBrowser) {
        return {
          type: 'new_device',
          severity: 'medium',
          description: 'Login from new browser/device',
          metadata: {
            newUserAgent: attempt.userAgent,
            browserInfo: this.extractBrowserInfo(attempt.userAgent)
          }
        }
      }
    }

    return null
  }

  /**
   * Check for suspicious IP addresses (basic implementation)
   */
  private checkSuspiciousIP(ipAddress: string): SuspiciousActivity | null {
    // Known suspicious patterns (basic implementation)
    const suspiciousPatterns = [
      /^127\./, // Localhost (shouldn't happen in production)
      /^10\./, // Private networks (if not expected)
      /^192\.168\./, // Private networks (if not expected)
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(ipAddress)) {
        return {
          type: 'tor_vpn',
          severity: 'low',
          description: 'Login from suspicious IP range',
          metadata: { ipAddress, pattern: pattern.source }
        }
      }
    }

    // In production, integrate with threat intelligence APIs
    // to check against known malicious IPs, Tor exit nodes, etc.

    return null
  }

  /**
   * Get recent login attempts for analysis
   */
  private async getRecentLogins(email: string, days: number) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return await prisma.auditLog.findMany({
      where: {
        email,
        eventType: { in: ['login_success', 'login_failed'] },
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'desc' },
      take: 50, // Limit for performance
      select: {
        eventType: true,
        success: true,
        timestamp: true,
        ipAddress: true,
        userAgent: true,
        metadata: true
      }
    })
  }

  /**
   * Extract basic browser info from User-Agent
   */
  private extractBrowserInfo(userAgent: string): { browser: string; os: string } {
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown'

    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'Mac' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown'

    return { browser, os }
  }
}

/**
 * Send notification for suspicious login
 */
export async function notifySuspiciousLogin(
  email: string, 
  activities: SuspiciousActivity[], 
  ipAddress: string,
  location?: any
): Promise<void> {
  try {
    const highSeverityActivities = activities.filter(a => a.severity === 'high')
    
    if (highSeverityActivities.length > 0) {
      logger.warn(`🚨 Suspicious login detected for ${email}`, {
        activities: activities.map(a => ({ type: a.type, severity: a.severity, description: a.description })),
        ipAddress,
        location
      })

      // Send email notification to user
      const { sendSuspiciousLoginEmail } = await import('@/lib/email-service')
      await sendSuspiciousLoginEmail(email, activities, ipAddress, location)
    }

  } catch (error) {
    logger.error('Failed to send suspicious login notification', error)
  }
}

/**
 * Future: Email notification template for suspicious logins
 */
async function sendSuspiciousLoginEmail(
  email: string,
  activities: SuspiciousActivity[],
  ipAddress: string,
  location?: any
): Promise<void> {
  // Implementation would go here
  // Use same email system as verification emails
  logger.debug('TODO: Send suspicious login email to', email)
}