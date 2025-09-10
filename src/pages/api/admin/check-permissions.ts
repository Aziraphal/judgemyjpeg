/**
 * API pour vérifier les permissions admin d'un utilisateur connecté
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'

interface AdminCheckResponse {
  isAdmin: boolean
  user?: {
    id: string
    email: string
    name?: string
    role: string
  }
}

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse<AdminCheckResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ isAdmin: false })
  }

  try {
    // L'utilisateur est déjà vérifié par withAuth et ses permissions sont dans req.user
    const isAdmin = req.user.isAdmin || req.user.role === 'admin'

    if (isAdmin) {
      return res.status(200).json({
        isAdmin: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role || 'admin'
        }
      })
    } else {
      return res.status(403).json({ isAdmin: false })
    }

  } catch (error) {
    return res.status(500).json({ isAdmin: false })
  }
})