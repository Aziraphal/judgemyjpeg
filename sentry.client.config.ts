import * as Sentry from "@sentry/nextjs";

// Configuration seulement si DSN présent
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Performance Monitoring optimisé
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0, // 10% en prod seulement
    
    // Session Replay pour debug UX
    replaysSessionSampleRate: 0.01, // 1% des sessions normales
    replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreurs
    
    // Environment & Release
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    
    // Filtrage intelligent des erreurs
    beforeSend(event) {
      // En développement, logguer mais ne pas envoyer
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry event (dev):', event);
        return null;
      }
      
      if (event.exception) {
        const error = event.exception.values?.[0]?.value;
        
        // Ignorer les erreurs réseau temporaires
        if (error?.includes('Network Error') || 
            error?.includes('Failed to fetch') ||
            error?.includes('Load failed')) {
          return null;
        }
        
        // Ignorer les erreurs de chunk loading (refresh résout)
        if (error?.includes('ChunkLoadError') ||
            error?.includes('Loading chunk')) {
          return null;
        }
        
        // Ignorer les erreurs d'extension navigateur
        if (error?.includes('Extension context invalidated') ||
            error?.includes('chrome-extension://')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Tags et contexte par défaut
    initialScope: {
      tags: {
        app: "judgemyjpeg",
        component: "client",
        version: process.env.NEXT_PUBLIC_APP_VERSION || "dev"
      },
      contexts: {
        app: {
          name: "JudgeMyJPEG",
          version: process.env.NEXT_PUBLIC_APP_VERSION || "dev"
        }
      }
    },
    
    // Intégrations optimisées  
    integrations: []
  });
} else {
  console.warn('⚠️ Sentry DSN manquant - monitoring désactivé');
}