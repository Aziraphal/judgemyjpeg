import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { logger, getClientIP } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    email: string
    name?: string
    isAdmin?: boolean
    role?: string
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

      // Récupérer les données utilisateur complètes avec les permissions
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          isAdmin: true, 
          role: true,
          emailVerified: true
        }
      })

      if (!user) {
        logger.security('User session found but user deleted from database', {
          sessionEmail: session.user.email,
          endpoint: req.url
        })
        return res.status(401).json({ error: 'Utilisateur non trouvé' })
      }

      // 🔒 VÉRIFICATION EMAIL OBLIGATOIRE (sauf pour admins)
      if (!user.emailVerified && !user.isAdmin) {
        const ip = getClientIP(req)
        logger.warn('🚨 ACCÈS BLOQUÉ - Email non vérifié', {
          userId: user.id,
          email: user.email,
          endpoint: req.url
        }, user.id, ip)
        
        return res.status(403).json({ 
          error: 'Email non vérifié', 
          message: 'Vérifiez votre boite email pour activer votre compte',
          requireEmailVerification: true
        })
      }

      // Ajouter l'utilisateur à la requête
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        id: user.id,
        email: user.email!,
        name: user.name || undefined,
        isAdmin: user.isAdmin,
        role: user.role
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
    // Vérification stricte des permissions admin
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      const ip = getClientIP(req)
      logger.security('ADMIN ACCESS DENIED - Unauthorized admin endpoint access', {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
        isAdmin: req.user.isAdmin,
        endpoint: req.url,
        method: req.method,
        userAgent: req.headers['user-agent']
      }, req.user.id, ip)
      
      return res.status(403).json({ 
        error: 'Accès interdit - Privilèges administrateur requis' 
      })
    }

    // Log accès admin légitime pour audit
    logger.security('ADMIN ACCESS GRANTED', {
      userId: req.user.id,
      email: req.user.email,
      endpoint: req.url,
      method: req.method
    }, req.user.id)
    
    return handler(req, res)
  })
}