import * as Sentry from "@sentry/nextjs";

// Configuration serveur seulement si DSN présent
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Performance Monitoring serveur optimisé
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0, // 20% en prod
    
    // Environment & Release
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    
    // Filtrage intelligent serveur
    beforeSend(event) {
      // En développement, logguer localement
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry server event (dev):', event?.exception?.values?.[0]?.value || event);
        return null;
      }
      
      if (event.exception) {
        const error = event.exception.values?.[0]?.value;
        
        // Ignorer les timeouts API externes (gérés gracieusement)
        if (error?.includes('OpenAI timeout') || 
            error?.includes('Request timeout') ||
            error?.includes('fetch timeout')) {
          return null;
        }
        
        // Ignorer les erreurs DB temporaires (reconnexion auto)
        if (error?.includes('Connection terminated') ||
            error?.includes('Client has already been released') ||
            error?.includes('Connection lost')) {
          return null;
        }
        
        // Ignorer les erreurs de rate limiting (comportement normal)
        if (error?.includes('Rate limit') ||
            error?.includes('429')) {
          return null;
        }
        
        // Ignorer les erreurs d'auth expirées (comportement normal)
        if (error?.includes('Token expired') ||
            error?.includes('Unauthorized')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Tags et contexte serveur
    initialScope: {
      tags: {
        app: "judgemyjpeg",
        component: "server",
        runtime: "node",
        version: process.env.NEXT_PUBLIC_APP_VERSION || "dev"
      },
      contexts: {
        app: {
          name: "JudgeMyJPEG Server",
          version: process.env.NEXT_PUBLIC_APP_VERSION || "dev"
        },
        runtime: {
          name: "node",
          version: process.version
        }
      }
    }
  });
} else {
  console.warn('⚠️ Sentry server DSN manquant - monitoring serveur désactivé');
}