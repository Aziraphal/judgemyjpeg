import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter (production: utiliser Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  // Rate limiting uniquement sur les APIs sensibles
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
  const now = Date.now()
  const timeWindow = 60 * 1000 // 1 minute
  
  // Limites par endpoint
  const limits = {
    '/api/photos/analyze': 5, // 5 analyses/minute
    '/api/auth/register': 3,  // 3 inscriptions/minute
    default: 30               // 30 requêtes/minute pour le reste
  }

  const endpoint = request.nextUrl.pathname
  const maxRequests = limits[endpoint as keyof typeof limits] || limits.default

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 0, resetTime: now + timeWindow })
  }

  const user = rateLimit.get(ip)!

  // Reset si fenêtre expirée
  if (now > user.resetTime) {
    user.count = 0
    user.resetTime = now + timeWindow
  }

  // Vérifier limite
  if (user.count >= maxRequests) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Trop de requêtes. Réessayez dans une minute.',
        retryAfter: Math.ceil((user.resetTime - now) / 1000)
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((user.resetTime - now) / 1000).toString()
        }
      }
    )
  }

  user.count++
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/photos/:path*',
    '/api/auth/:path*',
    '/api/admin/:path*'
  ]
}