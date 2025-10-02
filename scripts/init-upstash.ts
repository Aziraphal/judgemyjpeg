/**
 * Script pour configurer Upstash Redis
 * À exécuter une fois : npx tsx scripts/init-upstash.ts
 */

import * as dotenv from 'dotenv'

// Charger .env.local
dotenv.config({ path: '.env.local' })

async function initUpstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.error('❌ UPSTASH_REDIS_REST_URL ou UPSTASH_REDIS_REST_TOKEN manquant dans .env.local')
    console.log('\n📝 Pour obtenir un Redis Upstash (gratuit) :')
    console.log('1. Va sur https://upstash.com/')
    console.log('2. Sign up (gratuit, 10,000 commandes/jour)')
    console.log('3. Create Database → Choisir région (eu-west-1 pour Europe)')
    console.log('4. Copie REST URL et REST TOKEN')
    console.log('5. Ajoute dans .env.local :')
    console.log('   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io')
    console.log('   UPSTASH_REDIS_REST_TOKEN=xxx')
    process.exit(1)
  }

  try {
    console.log('🚀 Test connexion Upstash Redis...')

    // Test avec fetch (REST API)
    const response = await fetch(`${url}/ping`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (data.result === 'PONG') {
      console.log('✅ Connexion Upstash Redis réussie !')
      console.log('📊 Configuration :')
      console.log(`   - URL: ${url}`)
      console.log(`   - Status: Connected`)

      // Test SET/GET
      console.log('\n🧪 Test SET/GET...')

      const setResponse = await fetch(`${url}/set/test/hello-upstash`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const setData = await setResponse.json()
      console.log(`   - SET test: ${setData.result}`)

      const getResponse = await fetch(`${url}/get/test`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const getData = await getResponse.json()
      console.log(`   - GET test: ${getData.result}`)

      // Cleanup
      await fetch(`${url}/del/test`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('\n🎉 Upstash Redis configuré et testé avec succès !')
      console.log('\n📝 Prochaines étapes :')
      console.log('1. Le cache Redis est maintenant actif')
      console.log('2. Les analyses seront cachées automatiquement')
      console.log('3. Les embeddings RAG seront cachés (7 jours)')
      console.log('4. Performance améliorée de ~500ms par analyse (cache hit)')

    } else {
      console.error('❌ Réponse inattendue:', data)
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Erreur lors de la connexion :', error)

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        console.log('⚠️  Problème réseau. Vérifie ton URL Upstash.')
      } else if (error.message.includes('401')) {
        console.log('⚠️  Token invalide. Vérifie ton UPSTASH_REDIS_REST_TOKEN.')
      } else {
        console.log('💡 Erreur :', error.message)
      }
    }

    process.exit(1)
  }
}

// Exécuter
initUpstash()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur fatale:', error)
    process.exit(1)
  })
