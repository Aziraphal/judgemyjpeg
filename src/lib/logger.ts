interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  meta?: any
  userId?: string
  ip?: string
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private sanitize(data: any): any {
    if (typeof data === 'string') {
      // Masquer les mots de passe, tokens, clés API
      return data.replace(/(password|token|key|secret|auth)([=:]\s*)[^\s,}]+/gi, '$1$2[REDACTED]')
    }
    
    if (data && typeof data === 'object') {
      const sanitized = { ...data }
      
      // Champs sensibles à masquer
      const sensitiveFields = [
        'password', 'token', 'secret', 'key', 'auth', 
        'authorization', 'cookie', 'session', 'csrf'
      ]
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]'
        }
      }
      
      return sanitized
    }
    
    return data
  }

  private formatError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? '[REDACTED]' : error.stack
      }
    }
    return this.sanitize(error)
  }

  private log(level: LogEntry['level'], message: string, meta?: any, userId?: string, ip?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta: this.sanitize(meta) }),
      ...(userId && { userId }),
      ...(ip && { ip })
    }

    if (this.isProduction) {
      // En production, utiliser un service de logging externe
      // (Datadog, Sentry, CloudWatch, etc.)
      console.log(JSON.stringify(entry))
    } else {
      // En développement, logs plus lisibles
      const colors = {
        info: '\x1b[36m',    // cyan
        warn: '\x1b[33m',    // yellow
        error: '\x1b[31m',   // red
        debug: '\x1b[90m'    // gray
      }
      
      console.log(
        `${colors[level]}[${entry.timestamp}] ${level.toUpperCase()}\x1b[0m: ${message}`,
        meta ? this.sanitize(meta) : ''
      )
    }
  }

  info(message: string, meta?: any, userId?: string, ip?: string) {
    this.log('info', message, meta, userId, ip)
  }

  warn(message: string, meta?: any, userId?: string, ip?: string) {
    // Filtrer les warnings crypto browser extensions
    if (message.includes('Crypto injection detected') || 
        (meta && (meta.type === 'ethereum' || meta.type === 'web3'))) {
      return // Ignore les warnings crypto
    }
    this.log('warn', message, meta, userId, ip)
  }

  error(message: string, error?: any, userId?: string, ip?: string) {
    this.log('error', message, this.formatError(error), userId, ip)
  }

  debug(message: string, meta?: any, userId?: string, ip?: string) {
    if (!this.isProduction) {
      this.log('debug', message, meta, userId, ip)
    }
  }

  // Méthode spéciale pour les événements de sécurité
  security(event: string, details: any, userId?: string, ip?: string) {
    this.log('warn', `SECURITY: ${event}`, this.sanitize(details), userId, ip)
  }
}

export const logger = new Logger()

// Helper pour extraire l'IP des requêtes Next.js
export function getClientIP(req: any): string {
  return req.ip || 
         req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         'unknown'
}