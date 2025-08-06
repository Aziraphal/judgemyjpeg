/**
 * Test Email Endpoint - Verify Resend configuration
 * DELETE THIS FILE AFTER TESTING
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { sendVerificationEmail } from '@/lib/email-service'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple admin auth
  const adminSecret = req.headers['x-admin-secret']
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }

    // Test verification email
    await sendVerificationEmail(
      email, 
      'https://judgemyjpeg.fr/auth/verify?token=test-token-123'
    )

    res.status(200).json({ 
      success: true, 
      message: `Test email sent to ${email}` 
    })

  } catch (error) {
    console.error('Test email failed:', error)
    res.status(500).json({ 
      error: 'Email sending failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Usage:
// curl -X POST https://judgemyjpeg.fr/api/test-email \
//   -H "Content-Type: application/json" \
//   -H "x-admin-secret: YOUR_ADMIN_SECRET" \
//   -d '{"email":"test@example.com"}'