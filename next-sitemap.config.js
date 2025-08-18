/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.judgemyjpeg.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // Génère un seul fichier sitemap.xml au lieu d'un index
  additionalPaths: async (config) => [
    // URLs françaises SEO-friendly
    { loc: '/analyser-photo', priority: 1.0, changefreq: 'daily' },
    { loc: '/tarifs', priority: 1.0, changefreq: 'daily' },
    { loc: '/analyse-lot', priority: 1.0, changefreq: 'daily' },
    { loc: '/collections-photos', priority: 1.0, changefreq: 'daily' },
    { loc: '/toutes-mes-photos', priority: 0.8, changefreq: 'daily' },
    { loc: '/tableau-bord', priority: 0.7, changefreq: 'daily' },
    // Pages partenariats & ressources
    { loc: '/ressources', priority: 0.9, changefreq: 'weekly' },
    { loc: '/partenariats', priority: 0.8, changefreq: 'weekly' }
  ],
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*', 
    '/auth/*',
    '/success',
    '/success-simple',
    '/test-upload',
    '/status',
    '/offline'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/auth/',
          '/success',
          '/test-upload',
          '/status',
          '/offline'
        ]
      }
    ]
  },
  changefreq: 'daily',
  priority: 1.0,
  transform: async (config, path) => {
    // Pages principales avec priorité élevée (français + anglais)
    const highPriority = [
      '/', '/analyze', '/pricing', '/faq', '/contact', '/blog',
      '/analyser-photo', '/tarifs', '/analyse-lot', '/collections-photos'
    ]
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: highPriority.includes(path) ? 1.0 : 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  }
}