/**
 * Script pour initialiser l'index Pinecone
 * À exécuter une seule fois : npx tsx scripts/init-pinecone.ts
 */

import { Pinecone } from '@pinecone-database/pinecone'
import * as dotenv from 'dotenv'

// Charger .env.local
dotenv.config({ path: '.env.local' })

async function initPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY

  if (!apiKey) {
    console.error('❌ PINECONE_API_KEY manquant dans .env.local')
    console.log('\n📝 Pour obtenir une clé API Pinecone (gratuite) :')
    console.log('1. Va sur https://www.pinecone.io/')
    console.log('2. Sign up (gratuit)')
    console.log('3. Crée un projet')
    console.log('4. Copie ta clé API')
    console.log('5. Ajoute dans .env.local : PINECONE_API_KEY=ta-clé-ici')
    process.exit(1)
  }

  try {
    console.log('🚀 Initialisation Pinecone...')

    const pinecone = new Pinecone({
      apiKey: apiKey,
    })

    const indexName = 'photo-analyses'

    // Vérifier si l'index existe déjà
    const existingIndexes = await pinecone.listIndexes()
    const indexExists = existingIndexes.indexes?.some(idx => idx.name === indexName)

    if (indexExists) {
      console.log(`✅ Index "${indexName}" existe déjà`)
      console.log('📊 Statistiques de l\'index :')

      const index = pinecone.index(indexName)
      const stats = await index.describeIndexStats()

      console.log(`   - Vecteurs stockés : ${stats.totalRecordCount || 0}`)
      console.log(`   - Dimensions : ${stats.dimension || 'N/A'}`)

    } else {
      console.log(`📦 Création de l'index "${indexName}"...`)

      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // text-embedding-3-small dimensions
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      })

      console.log('✅ Index créé avec succès !')
      console.log('⏳ L\'index peut prendre 1-2 minutes pour être complètement prêt')
    }

    console.log('\n🎉 Configuration Pinecone terminée !')
    console.log('\n📝 Prochaines étapes :')
    console.log('1. Attends 1-2 minutes si index créé')
    console.log('2. Lance ton app : npm run dev')
    console.log('3. Analyse quelques photos')
    console.log('4. Le RAG s\'activera automatiquement après 3-4 analyses')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error)

    if (error instanceof Error) {
      if (error.message.includes('ALREADY_EXISTS')) {
        console.log('✅ L\'index existe déjà, tout est OK !')
      } else if (error.message.includes('INVALID_ARGUMENT')) {
        console.log('⚠️  Configuration invalide. Vérifie ton apiKey et ta région.')
      } else {
        console.log('💡 Erreur :', error.message)
      }
    }

    process.exit(1)
  }
}

// Exécuter
initPineconeIndex()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur fatale:', error)
    process.exit(1)
  })
