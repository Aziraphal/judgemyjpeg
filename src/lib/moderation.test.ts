// Tests basiques pour le système de modération
import { moderateText, validateImageDimensions } from './moderation'
import { logger } from '@/lib/logger'

async function runTests() {
  logger.debug('🧪 Tests système de modération\n')

  // Test 1: Contenu safe
  logger.debug('Test 1: Contenu safe')
  const safeResult = await moderateText('vacances-plage-2024.jpg')
  logger.debug('✓ Résultat:', safeResult.flagged ? '🚨 BLOQUÉ' : '✅ AUTORISÉ')
  
  // Test 2: Mot-clé interdit
  logger.debug('\nTest 2: Mot-clé suspect')
  const suspectResult = await moderateText('photo-nue-plage.jpg')
  logger.debug('✓ Résultat:', suspectResult.flagged ? '🚨 BLOQUÉ' : '✅ AUTORISÉ')
  if (suspectResult.flagged) {
    logger.debug('  Raison:', suspectResult.reason)
  }

  // Test 3: Violence
  logger.debug('\nTest 3: Contenu violent')
  const violentResult = await moderateText('scene-torture-guerre.jpg')
  logger.debug('✓ Résultat:', violentResult.flagged ? '🚨 BLOQUÉ' : '✅ AUTORISÉ')
  if (violentResult.flagged) {
    logger.debug('  Raison:', violentResult.reason)
  }

  // Test 4: Dimensions valides
  logger.debug('\nTest 4: Dimensions image')
  logger.debug('✓ 1920x1080:', validateImageDimensions(1920, 1080) ? '✅ VALIDE' : '❌ INVALIDE')
  logger.debug('✓ 50x50:', validateImageDimensions(50, 50) ? '✅ VALIDE' : '❌ INVALIDE')
  logger.debug('✓ 3000x100:', validateImageDimensions(3000, 100) ? '✅ VALIDE' : '❌ INVALIDE')

  logger.debug('\n✅ Tests terminés')
}

// Exporter pour usage en développement
export { runTests }

// Auto-run si exécuté directement
if (require.main === module) {
  runTests().catch(console.error)
}