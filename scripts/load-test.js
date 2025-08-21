#!/usr/bin/env node
/**
 * Load Testing Script pour JudgeMyJPEG
 * Tests les endpoints critiques sous charge
 */

const autocannon = require('autocannon')
const fs = require('fs')
const path = require('path')

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3008'
const DURATION = 30 // secondes
const CONNECTIONS = 10 // connexions simultanées

// Tests à exécuter
const tests = [
  {
    name: 'Health Check',
    url: `${BASE_URL}/api/health`,
    connections: 20,
    duration: 30,
    headers: {}
  },
  {
    name: 'Homepage Load',
    url: `${BASE_URL}/`,
    connections: 15,
    duration: 30,
    headers: {}
  },
  {
    name: 'Login Page',
    url: `${BASE_URL}/auth/signin`,
    connections: 10,
    duration: 20,
    headers: {}
  },
  {
    name: 'Pricing Page',
    url: `${BASE_URL}/pricing`,
    connections: 10,
    duration: 20,
    headers: {}
  }
]

async function runLoadTest(test) {
  console.log(`\\n🚀 Load testing: ${test.name}`)
  console.log(`📍 URL: ${test.url}`)
  console.log(`⚡ Connections: ${test.connections}, Duration: ${test.duration}s\\n`)
  
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: test.url,
      connections: test.connections,
      duration: test.duration,
      headers: test.headers,
      timeout: 10, // 10s timeout
    })
    
    let results = ''
    
    instance.on('response', (client, statusCode, resBytes, responseTime) => {
      // Log des réponses lentes
      if (responseTime > 2000) {
        console.log(`⚠️  Slow response: ${responseTime}ms (${statusCode})`)
      }
    })
    
    instance.on('done', (result) => {
      console.log(`✅ Test terminé: ${test.name}`)
      console.log(`📊 RPS: ${result.requests.average}/sec`)
      console.log(`⏱️  Latency avg: ${result.latency.average}ms`)
      console.log(`📈 Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`)
      console.log(`❌ Errors: ${result['2xx'] + result['3xx']}/${result.requests.total} success`)
      
      if (result.errors.length > 0) {
        console.log(`🚨 Errors found: ${result.errors.length}`)
        result.errors.forEach(err => console.log(`   - ${err}`))
      }
      
      resolve({
        test: test.name,
        rps: result.requests.average,
        latency: result.latency.average,
        errors: result.errors.length,
        success: result['2xx'] + result['3xx'],
        total: result.requests.total
      })
    })
    
    instance.on('error', reject)
  })
}

async function main() {
  console.log('🧪 JudgeMyJPEG Load Testing Suite')
  console.log('=====================================')
  console.log(`🎯 Target: ${BASE_URL}`)
  console.log(`⏰ Started: ${new Date().toISOString()}\\n`)
  
  const results = []
  
  try {
    // Test de sanité d'abord
    console.log('🏥 Health check préliminaire...')
    const healthResponse = await fetch(`${BASE_URL}/api/health`)
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`)
    }
    console.log('✅ Application healthy, proceeding with load tests\\n')
    
    // Exécuter les tests séquentiellement
    for (const test of tests) {
      try {
        const result = await runLoadTest(test)
        results.push(result)
        
        // Pause entre les tests
        console.log('⏸️  Pause 5s entre les tests...')
        await new Promise(resolve => setTimeout(resolve, 5000))
        
      } catch (error) {
        console.error(`❌ Test failed: ${test.name}`, error.message)
        results.push({
          test: test.name,
          error: error.message,
          rps: 0,
          latency: 0,
          errors: 1
        })
      }
    }
    
    // Rapport final
    console.log('\\n📋 RAPPORT FINAL')
    console.log('=================')
    
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.test}: FAILED (${result.error})`)
      } else {
        const successRate = ((result.success / result.total) * 100).toFixed(1)
        console.log(`${result.rps > 50 ? '✅' : '⚠️'} ${result.test}: ${result.rps.toFixed(1)} RPS, ${result.latency.toFixed(0)}ms avg, ${successRate}% success`)
      }
    })
    
    // Recommandations
    console.log('\\n💡 RECOMMANDATIONS')
    console.log('===================')
    
    const avgRps = results.filter(r => !r.error).reduce((sum, r) => sum + r.rps, 0) / results.filter(r => !r.error).length
    const avgLatency = results.filter(r => !r.error).reduce((sum, r) => sum + r.latency, 0) / results.filter(r => !r.error).length
    
    if (avgRps < 20) {
      console.log('🔴 RPS faible (<20): Considérer upgrade serveur ou optimisation')
    } else if (avgRps < 50) {
      console.log('🟡 RPS modéré (20-50): Monitoring requis lors du scale')
    } else {
      console.log('🟢 RPS bon (>50): Serveur capable de gérer charge actuelle')
    }
    
    if (avgLatency > 1000) {
      console.log('🔴 Latence élevée (>1s): Optimisation DB ou caching requis')
    } else if (avgLatency > 500) {
      console.log('🟡 Latence modérée (500ms-1s): Surveillance recommandée')
    } else {
      console.log('🟢 Latence acceptable (<500ms): Performance correcte')
    }
    
    // Sauvegarder les résultats
    const reportPath = path.join(__dirname, '..', 'load-test-results.json')
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      results: results,
      summary: {
        avgRps: avgRps,
        avgLatency: avgLatency,
        totalTests: results.length,
        failedTests: results.filter(r => r.error).length
      }
    }, null, 2))
    
    console.log(`\\n📄 Rapport sauvé: ${reportPath}`)
    
  } catch (error) {
    console.error('🚨 Load test suite failed:', error.message)
    process.exit(1)
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log('\\n⏹️  Load test interrompu par l\\'utilisateur')
  process.exit(0)
})

main().catch(console.error)