/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Désactiver ESLint pendant le build pour les tests de performance
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  
  // En-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com;
              connect-src 'self' https://api.stripe.com https://generativelanguage.googleapis.com;
              frame-src https://js.stripe.com;
              font-src 'self' data:;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig