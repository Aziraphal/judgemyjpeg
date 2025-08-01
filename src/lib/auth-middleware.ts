import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { logger, getClientIP } from '@/lib/logger'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    email: string
    name?: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session?.user?.email) {
        const ip = getClientIP(req)
        logger.security('Unauthorized API access attempt', {
          endpoint: req.url,
          method: req.method,
          userAgent: req.headers['user-agent']
        }, undefined, ip)
        
        return res.status(401).json({ error: 'Non authentifié' })
      }

      // Ajouter l'utilisateur à la requête
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: session.user.id as string,
        email: session.user.email as string,
        name: session.user.name || undefined
      }

      return handler(authenticatedReq, res)
    } catch (error) {
      logger.error('Authentication middleware error', error)
      return res.status(500).json({ error: 'Erreur d\'authentification' })
    }
  }
}

// Middleware pour les admins uniquement
export function withAdminAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Ici, tu peux ajouter la logique pour vérifier si l'utilisateur est admin
    // Par exemple, vérifier un rôle dans la base de données
    
    return handler(req, res)
  })
}