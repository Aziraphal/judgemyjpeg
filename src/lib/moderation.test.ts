// Tests basiques pour le système de modération
import { moderateText, validateImageDimensions } from './moderation'

async function runTests() {
  console.log('🧪 Tests système de modération\n')

  // Test 1: Contenu safe
  console.log('Test 1: Contenu safe')
  const safeResult = await moderateText('vacances-plage-2024.jpg')
  console.log('✓ Résultat:', safeResult.flagged ? '🚨 BLOQUÉ' : '✅ AUTORISÉ')
  
  // Test 2: Mot-clé interdit
  console.log('\nTest 2: Mot-clé suspect')
  const suspectResult = await moderateText('photo-nue-plage.jpg')
  console.log('✓ Résultat:', suspectResult.flagged ? '🚨 BLOQUÉ' : '✅ AUTORISÉ')
  if (suspectResult.flagged) {
    console.log('  Raison:', suspectResult.reason)
  }

  // Test 3: Violence
  console.log('\nTest 3: Contenu violent')
  const violentResult = await moderateText('scene-torture-guerre.jpg')
  console.log('✓ Résultat:', violentResult.flagged ? '🚨 BLOQUÉ' : '✅ AUTORISÉ')
  if (violentResult.flagged) {
    console.log('  Raison:', violentResult.reason)
  }

  // Test 4: Dimensions valides
  console.log('\nTest 4: Dimensions image')
  console.log('✓ 1920x1080:', validateImageDimensions(1920, 1080) ? '✅ VALIDE' : '❌ INVALIDE')
  console.log('✓ 50x50:', validateImageDimensions(50, 50) ? '✅ VALIDE' : '❌ INVALIDE')
  console.log('✓ 3000x100:', validateImageDimensions(3000, 100) ? '✅ VALIDE' : '❌ INVALIDE')

  console.log('\n✅ Tests terminés')
}

// Exporter pour usage en développement
export { runTests }

// Auto-run si exécuté directement
if (require.main === module) {
  runTests().catch(console.error)
}