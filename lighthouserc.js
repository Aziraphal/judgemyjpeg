module.exports = {
  ci: {
    collect: {
      // URLs à tester
      url: [
        'https://www.judgemyjpeg.fr',
        'https://www.judgemyjpeg.fr/analyze',
        'https://www.judgemyjpeg.fr/pricing',
        'https://www.judgemyjpeg.fr/blog'
      ],
      // Configuration du serveur Chrome
      settings: {
        chromeFlags: '--no-sandbox --headless',
      },
      numberOfRuns: 3, // Moyenne sur 3 tests
    },
    assert: {
      // Seuils minimums pour échouer le build
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
      },
    },
    upload: {
      // Configuration optionnelle pour LHCI Server
      target: 'temporary-public-storage',
    },
  },
};