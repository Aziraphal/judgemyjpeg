import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de sécurité critiques
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  
  // CSP géré dans next.config.js pour éviter les conflits
  // Le middleware ne doit pas override le CSP de next.config.js

  // Cache headers for static assets
  const url = request.nextUrl.pathname
  if (url === '/favicon.ico') {
    response.headers.set('Cache-Control', 'public, max-age=86400') // 1 day
  }

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}