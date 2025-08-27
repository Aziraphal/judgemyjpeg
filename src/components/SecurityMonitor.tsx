/**
 * Composant de monitoring sécurité côté client
 * Détecte les injections et scripts malveillants
 */

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function SecurityMonitor() {
  useEffect(() => {
    // Détecter les extensions crypto/MetaMask
    const detectCryptoInjections = () => {
      const suspiciousGlobals = [
        'ethereum',
        'web3', 
        'metamask',
        'coinbase',
        'tronweb',
        'binance'
      ]
      
      suspiciousGlobals.forEach(global => {
        if (typeof window !== 'undefined' && (window as any)[global]) {
          logger.warn('Crypto injection detected', {
            type: global,
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }
      })
    }

    // Détecter les scripts injectés
    const detectScriptInjections = () => {
      const scripts = document.querySelectorAll('script')
      scripts.forEach((script, index) => {
        if (script.src && !script.src.includes(window.location.hostname)) {
          const suspiciousDomains = [
            'metamask',
            'crypto', 
            'web3',
            'ethereum',
            'binance',
            'coinbase'
          ]
          
          if (suspiciousDomains.some(domain => script.src.toLowerCase().includes(domain))) {
            logger.warn('Suspicious script detected', {
              src: script.src,
              index,
              userAgent: navigator.userAgent
            })
          }
        }
      })
    }

    // Surveillance des modifications DOM
    const observeDOM = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === 'SCRIPT') {
                const script = node as HTMLScriptElement
                if (script.src && script.src.toLowerCase().includes('metamask')) {
                  logger.warn('MetaMask script injection blocked', {
                    src: script.src,
                    userAgent: navigator.userAgent
                  })
                  script.remove()
                }
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      return () => observer.disconnect()
    }

    // Exécuter les vérifications
    detectCryptoInjections()
    detectScriptInjections()
    const cleanupObserver = observeDOM()

    return cleanupObserver
  }, [])

  return null // Composant invisible
}