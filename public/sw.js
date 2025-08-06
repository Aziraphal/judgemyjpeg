/**
 * Service Worker - JudgeMyJPEG PWA
 * Gestion avancée du cache et fonctionnalités offline
 */

const CACHE_VERSION = 'v1.2.0'
const STATIC_CACHE = `judgemyjpeg-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `judgemyjpeg-dynamic-${CACHE_VERSION}`
const API_CACHE = `judgemyjpeg-api-${CACHE_VERSION}`
const IMAGE_CACHE = `judgemyjpeg-images-${CACHE_VERSION}`

// Assets critiques à mettre en cache immédiatement
const CRITICAL_ASSETS = [
  '/',
  '/analyze',
  '/dashboard', 
  '/manifest.json',
  '/_next/static/css/app.css',
  '/_next/static/chunks/webpack.js',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Routes à pre-cache
const STATIC_ROUTES = [
  '/',
  '/analyze',
  '/dashboard',
  '/gallery',
  '/pricing',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies'
]

// APIs à mettre en cache avec stratégies spécifiques
const CACHEABLE_APIS = [
  '/api/photos/recent',
  '/api/user/stats',
  '/api/gallery/top',
  '/api/user/collections'
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...')
  
  event.waitUntil(
    Promise.all([
      // Cache des assets critiques
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Cache des assets critiques')
        return cache.addAll(CRITICAL_ASSETS.map(url => new Request(url, {
          cache: 'no-cache'
        })))
      }),
      
      // Pre-cache des routes importantes
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('[SW] Pre-cache des routes')
        return Promise.all(
          STATIC_ROUTES.map(route => 
            fetch(route).then(response => {
              if (response.ok) {
                return cache.put(route, response.clone())
              }
            }).catch(() => {
              console.log(`[SW] Impossible de pre-cache ${route}`)
            })
          )
        )
      })
    ]).then(() => {
      console.log('[SW] Installation terminée')
      return self.skipWaiting()
    })
  )
})

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...')
  
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Suppression ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Claim immediate control
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation terminée')
    })
  )
})

// Interception des requêtes - Stratégies de cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return
  
  // Stratégie par type de ressource
  if (request.method === 'GET') {
    
    // 1. Assets statiques - Cache First
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE))
    }
    
    // 2. Pages HTML - Network First avec fallback
    else if (isPageRequest(request)) {
      event.respondWith(networkFirstWithFallback(request, DYNAMIC_CACHE))
    }
    
    // 3. APIs de lecture - Stale While Revalidate  
    else if (isCacheableAPI(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request, API_CACHE))
    }
    
    // 4. Images utilisateur - Cache with Network Fallback
    else if (isImageRequest(url.pathname)) {
      event.respondWith(cacheWithNetworkFallback(request, IMAGE_CACHE))
    }
    
    // 5. APIs sensibles (auth, paiement) - Network Only
    else if (isSensitiveAPI(url.pathname)) {
      event.respondWith(networkOnly(request))
    }
    
    // 6. Autres requêtes - Network First
    else {
      event.respondWith(networkFirstBasic(request, DYNAMIC_CACHE))
    }
  }
  
  // POST/PUT/DELETE - toujours Network Only avec retry
  else {
    event.respondWith(networkOnlyWithRetry(request))
  }
})

// === STRATÉGIES DE CACHE ===

// Cache First - Pour assets statiques
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
    
  } catch (error) {
    console.error('[SW] Cache First error:', error)
    return new Response('Asset non disponible offline', { status: 503 })
  }
}

// Network First avec fallback offline
async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request, { 
      timeout: 3000 
    })
    
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
      return response
    }
    
    throw new Error('Response not ok')
    
  } catch (error) {
    console.log('[SW] Network failed, using cache for:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback offline page
    if (request.mode === 'navigate') {
      return getOfflinePage()
    }
    
    return new Response('Non disponible offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Stale While Revalidate - Pour APIs
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Fetch en arrière-plan pour revalider
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => cachedResponse)
  
  // Retourner cache immédiatement si disponible
  return cachedResponse || fetchPromise
}

// Cache with Network Fallback - Pour images
async function cacheWithNetworkFallback(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      // Limite de taille cache images (50MB)
      await cleanImageCache(cache, 50 * 1024 * 1024)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return getImageFallback()
  }
}

// Network Only - Pour APIs sensibles
async function networkOnly(request) {
  return fetch(request)
}

// Network Only avec retry
async function networkOnlyWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(request)
      if (response.ok || i === maxRetries - 1) {
        return response
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      // Attendre avant retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}

// Network First basique
async function networkFirstBasic(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Non disponible', { status: 503 })
  }
}

// === UTILITAIRES ===

function isStaticAsset(pathname) {
  return pathname.startsWith('/_next/static/') || 
         pathname.startsWith('/static/') ||
         pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/)
}

function isPageRequest(request) {
  return request.mode === 'navigate' || 
         request.headers.get('accept')?.includes('text/html')
}

function isCacheableAPI(pathname) {
  return CACHEABLE_APIS.some(api => pathname.startsWith(api))
}

function isImageRequest(pathname) {
  return pathname.includes('/uploads/') || 
         pathname.includes('/cloudinary/') ||
         pathname.match(/\.(jpg|jpeg|png|webp|gif)$/)
}

function isSensitiveAPI(pathname) {
  return pathname.includes('/auth/') ||
         pathname.includes('/payment/') || 
         pathname.includes('/admin/') ||
         pathname.includes('/api/stripe/')
}

// Page offline de fallback
async function getOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>JudgeMyJPEG - Hors ligne</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: system-ui, sans-serif; 
          background: linear-gradient(135deg, #000000 0%, #1a0033 50%, #0f1419 100%);
          color: white; min-height: 100vh; 
          display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 20px;
        }
        .container { max-width: 400px; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { font-size: 2rem; margin-bottom: 1rem; color: #FF006E; }
        p { margin-bottom: 1.5rem; opacity: 0.8; line-height: 1.6; }
        .btn { 
          background: linear-gradient(45deg, #FF006E, #00F5FF);
          color: white; padding: 12px 24px; border: none;
          border-radius: 25px; font-weight: bold; cursor: pointer;
          text-decoration: none; display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>Mode Hors Ligne</h1>
        <p>
          Vous êtes actuellement hors ligne, mais JudgeMyJPEG reste accessible ! 
          Vous pouvez naviguer dans vos analyses précédentes et préparer de nouvelles photos.
        </p>
        <a href="/" class="btn">Retour à l'accueil</a>
      </div>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  })
}

// Image fallback pour images non disponibles
function getImageFallback() {
  return new Response(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#FF006E"><rect width="100%" height="100%" fill="#1a0033"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="#FF006E" text-anchor="middle" dy="0.3em">📷 Image non disponible hors ligne</text></svg>',
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400'
      }
    }
  )
}

// Nettoyage du cache images par taille
async function cleanImageCache(cache, maxSize) {
  const requests = await cache.keys()
  let totalSize = 0
  
  // Calculer taille approximative
  for (const request of requests) {
    const response = await cache.match(request)
    if (response) {
      const size = response.headers.get('content-length')
      if (size) totalSize += parseInt(size)
    }
  }
  
  // Supprimer les plus anciens si dépassement
  if (totalSize > maxSize) {
    const sortedRequests = requests.sort((a, b) => {
      return new Date(a.headers.get('date') || 0) - new Date(b.headers.get('date') || 0)
    })
    
    const toDelete = Math.floor(requests.length * 0.3) // Supprimer 30%
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(sortedRequests[i])
    }
  }
}

// Background Sync pour actions en attente
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'photo-analysis-queue') {
    event.waitUntil(processPhotoAnalysisQueue())
  }
})

// Traitement de la queue d'analyse hors ligne
async function processPhotoAnalysisQueue() {
  try {
    // Récupérer la queue depuis IndexedDB
    const queue = await getAnalysisQueue()
    
    for (const analysis of queue) {
      try {
        const response = await fetch('/api/photos/analyze', {
          method: 'POST',
          body: analysis.formData
        })
        
        if (response.ok) {
          await removeFromQueue(analysis.id)
          
          // Notifier l'utilisateur du succès
          self.registration.showNotification('Analyse terminée !', {
            body: 'Votre photo a été analysée avec succès',
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            tag: 'analysis-complete',
            data: { analysisId: analysis.id }
          })
        }
      } catch (error) {
        console.error('[SW] Erreur traitement queue:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Erreur background sync:', error)
  }
}

// Gestion des notifications push (futur)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png', 
      tag: data.tag || 'general',
      data: data.data || {},
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Actions sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const { data } = event.notification
  
  event.waitUntil(
    clients.openWindow(data.url || '/')
  )
})

console.log('[SW] Service Worker JudgeMyJPEG v' + CACHE_VERSION + ' chargé')