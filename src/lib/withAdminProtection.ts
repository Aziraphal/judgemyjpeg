/**
 * HOC pour protéger les pages admin
 * Protection centralisée avec redirection automatique
 */

import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export function withAdminProtection(
  getServerSidePropsFunc?: GetServerSideProps
): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    try {
      const session = await getServerSession(context.req, context.res, authOptions)
      
      // Vérifier la session
      if (!session?.user?.email) {
        logger.security('Unauthorized admin page access attempt - no session', {
          page: context.resolvedUrl,
          userAgent: context.req.headers['user-agent'],
          ip: context.req.headers['x-forwarded-for'] || context.req.socket.remoteAddress
        })
        
        return {
          redirect: {
            destination: '/admin/login?error=not_authenticated',
            permanent: false
          }
        }
      }

      // Vérifier les permissions admin dans la base
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true,
          isAdmin: true, 
          role: true,
          name: true 
        }
      })

      if (!user) {
        logger.security('Admin access attempt - user not found in database', {
          sessionEmail: session.user.email,
          page: context.resolvedUrl
        })
        
        return {
          redirect: {
            destination: '/admin/login?error=user_not_found',
            permanent: false
          }
        }
      }

      if (!user.isAdmin && user.role !== 'admin') {
        logger.security('Admin access DENIED - insufficient permissions', {
          userId: user.id,
          email: session.user.email,
          isAdmin: user.isAdmin,
          role: user.role,
          page: context.resolvedUrl,
          userAgent: context.req.headers['user-agent'],
          ip: context.req.headers['x-forwarded-for'] || context.req.socket.remoteAddress
        }, user.id)
        
        return {
          redirect: {
            destination: '/admin/login?error=access_denied',
            permanent: false
          }
        }
      }

      // Log accès admin légitime
      logger.security('Admin access GRANTED', {
        userId: user.id,
        email: session.user.email,
        name: user.name,
        page: context.resolvedUrl
      }, user.id)

      // Si tout est OK, exécuter la fonction getServerSideProps personnalisée
      if (getServerSidePropsFunc) {
        const result = await getServerSidePropsFunc(context)
        
        // Ajouter les infos admin aux props si c'est un objet avec props
        if (result && 'props' in result) {
          return {
            ...result,
            props: {
              ...result.props,
              adminUser: {
                id: user.id,
                email: session.user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                role: user.role
              }
            }
          }
        }
        
        return result
      }

      // Retour par défaut avec infos admin
      return {
        props: {
          adminUser: {
            id: user.id,
            email: session.user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            role: user.role
          }
        }
      }
      
    } catch (error) {
      logger.error('Admin protection error', error)
      
      return {
        redirect: {
          destination: '/admin/login?error=server_error',
          permanent: false
        }
      }
    }
  }
}

export default withAdminProtection