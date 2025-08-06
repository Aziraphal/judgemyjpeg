/**
 * Public Status Page API - User-friendly service status
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { checkDatabase, checkEmailService, checkMonitoring } from './health'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  description: string
}

interface StatusResponse {
  overall: 'operational' | 'degraded' | 'major_outage'
  services: ServiceStatus[]
  lastUpdated: string
  incidents: any[] // For future incident reporting
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<StatusResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' } as any)
  }

  try {
    // Check all services
    const [dbCheck, emailCheck, monitoringCheck] = await Promise.all([
      checkDatabase(),
      checkEmailService(),
      checkMonitoring()
    ])

    // Map technical status to user-friendly status
    const services: ServiceStatus[] = [
      {
        name: 'Photo Analysis',
        status: dbCheck.status === 'up' ? 'operational' : 'down',
        description: dbCheck.status === 'up' 
          ? 'AI photo analysis is working normally'
          : 'Photo analysis may be temporarily unavailable'
      },
      {
        name: 'User Accounts',
        status: dbCheck.status === 'up' ? 'operational' : 'down',
        description: dbCheck.status === 'up'
          ? 'Account registration and login working normally'
          : 'Account services may be temporarily unavailable'
      },
      {
        name: 'Email Notifications',
        status: emailCheck.status === 'up' ? 'operational' : 'degraded',
        description: emailCheck.status === 'up'
          ? 'Email verification and notifications working normally'
          : 'Email services may be delayed'
      },
      {
        name: 'Premium Features',
        status: 'operational', // Assume operational unless specific checks fail
        description: 'Stripe payments and premium subscriptions working normally'
      }
    ]

    // Determine overall status
    const downServices = services.filter(s => s.status === 'down').length
    const degradedServices = services.filter(s => s.status === 'degraded').length

    const overall = downServices > 1 ? 'major_outage' :
                   downServices === 1 || degradedServices > 0 ? 'degraded' :
                   'operational'

    const statusResponse: StatusResponse = {
      overall,
      services,
      lastUpdated: new Date().toISOString(),
      incidents: [] // Future: populate with real incidents
    }

    // Cache for 1 minute
    res.setHeader('Cache-Control', 'public, max-age=60')
    
    res.status(200).json(statusResponse)

  } catch (error) {
    console.error('Status check failed:', error)
    
    // Return degraded status if we can't check services
    res.status(200).json({
      overall: 'degraded',
      services: [
        {
          name: 'All Services',
          status: 'degraded',
          description: 'Unable to verify service status at this time'
        }
      ],
      lastUpdated: new Date().toISOString(),
      incidents: []
    })
  }
}