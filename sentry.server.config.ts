import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring (plus élevé côté serveur)
  tracesSampleRate: 0.2, // 20% des transactions serveur
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  
  // Server-side specific config
  beforeSend(event) {
    // Filtrer les erreurs serveur non critiques
    if (event.exception) {
      const error = event.exception.values?.[0]?.value;
      
      // Ignorer les timeouts OpenAI (déjà gérés)
      if (error?.includes('OpenAI timeout') || 
          error?.includes('Request timeout')) {
        return null;
      }
      
      // Ignorer les erreurs DB de connexion temporaires
      if (error?.includes('Connection terminated') ||
          error?.includes('Client has already been released')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Tags spécifiques serveur
  initialScope: {
    tags: {
      app: "judgemyjpeg",
      runtime: "node",
      feature: "api"
    }
  }
});