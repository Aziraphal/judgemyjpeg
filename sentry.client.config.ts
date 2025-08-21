import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% des transactions
  
  // Session Replay
  replaysSessionSampleRate: 0.01, // 1% des sessions
  replaysOnErrorSampleRate: 1.0, // 100% des erreurs
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  
  // Filtrage des erreurs
  beforeSend(event) {
    // Ignorer les erreurs non critiques
    if (event.exception) {
      const error = event.exception.values?.[0]?.value;
      
      // Ignorer les erreurs réseau courantes
      if (error?.includes('Network Error') || 
          error?.includes('Failed to fetch') ||
          error?.includes('Load failed')) {
        return null;
      }
      
      // Ignorer les erreurs de navigation
      if (error?.includes('ChunkLoadError') ||
          error?.includes('Loading chunk')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Tags par défaut
  initialScope: {
    tags: {
      app: "judgemyjpeg",
      feature: "main"
    }
  }
});