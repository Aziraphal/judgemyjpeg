/**
 * RAG (Retrieval-Augmented Generation) Service
 * Améliore les analyses photo en utilisant des exemples similaires passés
 */

import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import { PhotoAnalysis } from '@/types/analysis'
import { logger } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Lazy init Pinecone (pour éviter erreur si pas de clé)
let pinecone: Pinecone | null = null
let pineconeIndex: any = null

function initPinecone() {
  if (!process.env.PINECONE_API_KEY) {
    logger.warn('Pinecone not configured - RAG disabled')
    return false
  }

  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })

    // Index name: photo-analyses
    pineconeIndex = pinecone.index('photo-analyses')
    logger.info('Pinecone initialized successfully')
  }

  return true
}

/**
 * Génère un embedding pour une image
 */
export async function generateImageEmbedding(imageBase64: string): Promise<number[]> {
  try {
    // OpenAI ne fait pas d'embeddings d'images directement
    // On utilise une approche hybride : description text → embedding

    // 1. Générer une description concise de l'image
    const descriptionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Décris cette photo en 2-3 phrases courtes : sujet principal, composition, lumière, couleurs dominantes, émotion. Sois concis et précis."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    })

    const description = descriptionResponse.choices[0]?.message?.content || ''

    // 2. Générer embedding de cette description
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small", // 1536 dimensions, $0.02/1M tokens
      input: description,
    })

    return embeddingResponse.data[0].embedding

  } catch (error) {
    logger.error('Error generating image embedding:', error)
    throw error
  }
}

/**
 * Recherche les analyses similaires dans Pinecone
 */
export async function findSimilarAnalyses(
  imageEmbedding: number[],
  topK: number = 3
): Promise<SimilarAnalysis[]> {
  if (!initPinecone() || !pineconeIndex) {
    logger.warn('Pinecone not available - skipping RAG')
    return []
  }

  try {
    const queryResponse = await pineconeIndex.query({
      vector: imageEmbedding,
      topK,
      includeMetadata: true,
    })

    const results: SimilarAnalysis[] = queryResponse.matches?.map((match: any) => ({
      score: match.score,
      analysis: match.metadata.analysis as PhotoAnalysis,
      photoType: match.metadata.photoType,
    })) || []

    logger.info(`Found ${results.length} similar analyses via RAG`)
    return results

  } catch (error) {
    logger.error('Error querying Pinecone:', error)
    return []
  }
}

/**
 * Stocke une analyse dans Pinecone pour futures recherches
 */
export async function storeAnalysis(
  photoId: string,
  imageEmbedding: number[],
  analysis: PhotoAnalysis,
  photoType: string
): Promise<void> {
  if (!initPinecone() || !pineconeIndex) {
    return // Silently skip if Pinecone not configured
  }

  try {
    await pineconeIndex.upsert([
      {
        id: photoId,
        values: imageEmbedding,
        metadata: {
          analysis: JSON.parse(JSON.stringify(analysis)), // Deep clone
          photoType,
          score: analysis.score,
          timestamp: new Date().toISOString(),
        },
      },
    ])

    logger.debug(`Stored analysis ${photoId} in Pinecone`)

  } catch (error) {
    logger.error('Error storing analysis in Pinecone:', error)
    // Don't throw - this is optional enhancement
  }
}

/**
 * Enrichit le prompt avec des exemples similaires (RAG)
 */
export function enrichPromptWithExamples(
  basePrompt: string,
  similarAnalyses: SimilarAnalysis[]
): string {
  if (similarAnalyses.length === 0) {
    return basePrompt
  }

  const examplesSection = `

📚 EXEMPLES D'ANALYSES DE RÉFÉRENCE (photos similaires) :

${similarAnalyses.map((similar, index) => `
EXEMPLE ${index + 1} (similarité: ${Math.round(similar.score * 100)}%) :
- Score donné : ${similar.analysis.score}/100
- Type : ${similar.photoType}
- Analyse technique :
  * Composition : ${similar.analysis.partialScores?.composition || 'N/A'}/15
  * Lumière : ${similar.analysis.partialScores?.lighting || 'N/A'}/15
  * Netteté : ${similar.analysis.partialScores?.focus || 'N/A'}/15
  * Exposition : ${similar.analysis.partialScores?.exposure || 'N/A'}/15
- Suggestions données : ${similar.analysis.suggestions?.slice(0, 2).join(' | ') || 'N/A'}
`).join('\n')}

🎯 UTILISE CES EXEMPLES POUR :
- Maintenir une COHÉRENCE de notation (si photo similaire = 75/100, ne note pas 95/100 pour qualité équivalente)
- T'inspirer du STYLE et du NIVEAU DE DÉTAIL des analyses passées
- Adapter le TON à ce qui a bien fonctionné avant
- MAIS reste ORIGINAL et analyse CETTE photo spécifiquement

`

  return basePrompt + examplesSection
}

export interface SimilarAnalysis {
  score: number // Similarité (0-1)
  analysis: PhotoAnalysis
  photoType: string
}
