/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.judgemyjpeg.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // Génère un seul fichier sitemap.xml au lieu d'un index
  
  // Pages statiques principales (URLs finales ANGLAISES)
  additionalPaths: async (config) => [
    // Pages principales - priorité maximale
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/analyze', priority: 1.0, changefreq: 'daily' },
    { loc: '/pricing', priority: 1.0, changefreq: 'daily' },
    { loc: '/glossaire', priority: 1.0, changefreq: 'weekly' }, // ← NOUVEAU !
    { loc: '/faq', priority: 1.0, changefreq: 'weekly' },
    { loc: '/contact', priority: 1.0, changefreq: 'monthly' },
    { loc: '/blog', priority: 1.0, changefreq: 'weekly' },
    
    // Pages secondaires - priorité élevée
    { loc: '/batch', priority: 0.9, changefreq: 'weekly' },
    { loc: '/collections', priority: 0.8, changefreq: 'weekly' },
    { loc: '/gallery', priority: 0.8, changefreq: 'daily' },
    { loc: '/dashboard', priority: 0.7, changefreq: 'weekly' },
    { loc: '/insights', priority: 0.7, changefreq: 'weekly' },
    { loc: '/settings', priority: 0.6, changefreq: 'monthly' },
    
    // Pages importantes
    { loc: '/ressources', priority: 0.9, changefreq: 'weekly' },
    { loc: '/partenariats', priority: 0.8, changefreq: 'weekly' },
    
    // Pages légales
    { loc: '/legal/terms', priority: 0.5, changefreq: 'monthly' },
    { loc: '/legal/privacy', priority: 0.5, changefreq: 'monthly' },
    { loc: '/legal/cookies', priority: 0.5, changefreq: 'monthly' },
    { loc: '/legal/mentions', priority: 0.5, changefreq: 'monthly' },
    
    // Articles de blog statiques
    { loc: '/blog/comment-juger-bonne-photo-guide-2025', priority: 0.8, changefreq: 'monthly' },
    { loc: '/blog/erreurs-photo-ia-detecte-instantanement', priority: 0.8, changefreq: 'monthly' },
    { loc: '/blog/pourquoi-utiliser-ia-evaluer-photos-jpeg', priority: 0.8, changefreq: 'monthly' }
  ],
  exclude: [
    '/admin*',
    '/api/*', 
    '/auth/*',
    '/success*',
    '/test-upload*',
    '/status*',
    '/offline*',
    '/_next/*',
    '/_app',
    '/_document',
    '/500',
    // Pages françaises qui redirigent (éviter doublons)
    '/analyser-photo',
    '/tarifs', 
    '/analyse-lot',
    '/collections-photos',
    '/toutes-mes-photos',
    '/tableau-bord',
    '/all-photos',
    // Pages désactivées
    '/lightroom-plugin*',
    '*.disabled*',
    '/sentry-example-page'
  ],
  robotsTxtOptions: {
    policies: [
      // AI Crawlers - Explicit permissions for LLMs
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin*', '/api/*', '/auth/*']
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/'
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin*', '/api/*']
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin*', '/api/*']
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin*', '/api/*']
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/admin*']
      },
      {
        userAgent: 'Amazonbot',
        allow: '/'
      },
      {
        userAgent: 'cohere-ai',
        allow: '/'
      },
      // Traditional Search Engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin*', '/api/*', '/auth/*']
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin*', '/api/*']
      },
      // All other bots
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin*',
          '/api/*',
          '/auth/*',
          '/*success*',
          '/test-upload*',
          '/status*',
          '/offline*',
          '/_next/*',
          '/node_modules/*',
          '*.disabled*'
        ]
      }
    ],
    additionalSitemaps: [
      'https://www.judgemyjpeg.fr/sitemap.xml',
      'https://www.judgemyjpeg.fr/ai.txt'
    ]
  },
  changefreq: 'daily',
  priority: 1.0,
  transform: async (config, path) => {
    // Pages principales avec priorité élevée (URLS ANGLAISES SEULEMENT)
    const highPriority = [
      '/', '/analyze', '/pricing', '/faq', '/contact', '/blog', '/glossaire'
    ]
    
    // Pages importantes
    const mediumPriority = [
      '/batch', '/collections', '/gallery', '/dashboard', '/insights'
    ]
    
    return {
      loc: path,
      changefreq: highPriority.includes(path) ? 'daily' : mediumPriority.includes(path) ? 'weekly' : 'monthly',
      priority: highPriority.includes(path) ? 1.0 : mediumPriority.includes(path) ? 0.8 : 0.5,
      lastmod: new Date().toISOString(),
    }
  }
}