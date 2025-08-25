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
  
  // CSP (Content Security Policy) - Balanced for Observatory + Next.js
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com;
    connect-src 'self' https://api.stripe.com https://generativelanguage.googleapis.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com;
    frame-src https://js.stripe.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', csp)

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