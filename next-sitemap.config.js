/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.judgemyjpeg.fr',
  generateRobotsTxt: true,
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
    ],
    additionalSitemaps: [
      'https://www.judgemyjpeg.fr/sitemap.xml'
    ]
  },
  changefreq: 'daily',
  priority: 1.0,
  transform: async (config, path) => {
    // Pages principales avec priorité élevée
    const highPriority = ['/', '/analyze', '/pricing', '/faq', '/contact']
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: highPriority.includes(path) ? 1.0 : 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  }
}