/**
 * Admin Audit Logs API - Phase 2 Security
 * Endpoint for admins to view audit trail and security events
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getSecuritySummary } from '@/lib/audit-trail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple admin authentication (improve in production)
  const adminSecret = req.headers['x-admin-secret']
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const { 
        userId, 
        eventType, 
        riskLevel, 
        limit = 50, 
        page = 1,
        days = 7,
        summary = false
      } = req.query

      // Return security summary if requested
      if (summary === 'true') {
        const securitySummary = await getSecuritySummary(Number(days))
        return res.status(200).json(securitySummary)
      }

      // Build filter conditions
      const where: any = {}
      
      if (userId && typeof userId === 'string') {
        where.userId = userId
      }
      
      if (eventType && typeof eventType === 'string') {
        where.eventType = eventType
      }
      
      if (riskLevel && typeof riskLevel === 'string') {
        where.riskLevel = riskLevel
      }

      // Add time filter
      if (days) {
        const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000)
        where.timestamp = { gte: startDate }
      }

      // Get total count for pagination
      const totalCount = await prisma.auditLog.count({ where })

      // Get paginated results
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        select: {
          id: true,
          userId: true,
          email: true,
          ipAddress: true,
          userAgent: true,
          eventType: true,
          description: true,
          metadata: true,
          riskLevel: true,
          success: true,
          timestamp: true
        }
      })

      // Parse metadata JSON strings
      const logsWithParsedMetadata = logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      }))

      res.status(200).json({
        logs: logsWithParsedMetadata,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      })

    } catch (error) {
      console.error('Error fetching audit logs:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

// Export types for frontend use
export interface AuditLogResponse {
  logs: Array<{
    id: string
    userId?: string
    email?: string
    ipAddress: string
    userAgent?: string
    eventType: string
    description: string
    metadata?: Record<string, any>
    riskLevel: string
    success: boolean
    timestamp: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}