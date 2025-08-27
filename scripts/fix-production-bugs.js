#!/usr/bin/env node

/**
 * Script pour corriger tous les bugs admin dashboard en production
 * Usage: node scripts/fix-production-bugs.js
 * 
 * Corrige:
 * 1. Middleware dupliqué (src/middleware.ts)
 * 2. Imports logger manquants 
 * 3. Récursion infinie dans logger.ts
 * 4. Script côté client dans _app.tsx
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src');

console.log('🔧 FIXING PRODUCTION BUGS FOR ADMIN DASHBOARD\n');

let fixedCount = 0;
const fixes = [];

// 1. Supprimer le middleware dupliqué dans src/
function removeDuplicateMiddleware() {
  const duplicateMiddlewarePath = path.join(sourceDir, 'middleware.ts');
  if (fs.existsSync(duplicateMiddlewarePath)) {
    fs.unlinkSync(duplicateMiddlewarePath);
    fixes.push('✅ Removed duplicate middleware in src/middleware.ts');
    fixedCount++;
  } else {
    fixes.push('ℹ️  No duplicate middleware found in src/ (already fixed)');
  }
}

// 2. Corriger la récursion dans logger.ts
function fixLoggerRecursion() {
  const loggerPath = path.join(sourceDir, 'lib', 'logger.ts');
  if (!fs.existsSync(loggerPath)) {
    fixes.push('❌ Logger file not found');
    return;
  }

  let content = fs.readFileSync(loggerPath, 'utf8');
  let modified = false;

  // Fix récursion en production
  if (content.includes('logger.debug(JSON.stringify(entry))')) {
    content = content.replace('logger.debug(JSON.stringify(entry))', 'console.log(JSON.stringify(entry))');
    modified = true;
  }

  // Fix récursion en développement  
  if (content.includes('logger.debug(')) {
    content = content.replace(/logger\.debug\(/g, 'console.log(');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(loggerPath, content);
    fixes.push('✅ Fixed logger recursion in logger.ts');
    fixedCount++;
  } else {
    fixes.push('ℹ️  Logger recursion already fixed');
  }
}

// 3. Corriger le script côté client dans _app.tsx
function fixClientSideScript() {
  const appPath = path.join(sourceDir, 'pages', '_app.tsx');
  if (!fs.existsSync(appPath)) {
    fixes.push('❌ _app.tsx file not found');
    return;
  }

  let content = fs.readFileSync(appPath, 'utf8');
  let modified = false;

  // Fix logger côté client dans le script Google Analytics
  if (content.includes('logger.debug(\'Cookie consent updated:\'')) {
    content = content.replace('logger.debug(\'Cookie consent updated:', 'console.log(\'Cookie consent updated:');
    modified = true;
  }

  if (content.includes('logger.warn(\'Error parsing cookie consent:\'')) {
    content = content.replace('logger.warn(\'Error parsing cookie consent:', 'console.warn(\'Error parsing cookie consent:');
    modified = true;
  }

  // Fix process.env dans le script côté client
  if (content.includes('process.env.NODE_ENV') && content.includes('dangerouslySetInnerHTML')) {
    content = content.replace(/process\.env\.NODE_ENV/g, '${process.env.NODE_ENV}');
    modified = true;
  }

  // Vérifier que l'import logger existe
  if (!content.includes('import { logger } from \'@/lib/logger\'')) {
    // Ajouter l'import après les autres imports
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && lines[i].includes('from')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, 'import { logger } from \'@/lib/logger\'');
      content = lines.join('\n');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(appPath, content);
    fixes.push('✅ Fixed client-side script in _app.tsx');
    fixedCount++;
  } else {
    fixes.push('ℹ️  Client-side script already fixed');
  }
}

// 4. Vérifier et nettoyer le middleware racine
function fixRootMiddleware() {
  const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
  if (!fs.existsSync(middlewarePath)) {
    fixes.push('❌ Root middleware.ts not found');
    return;
  }

  let content = fs.readFileSync(middlewarePath, 'utf8');
  let modified = false;

  // Supprimer import logger si présent (incompatible avec middleware)
  if (content.includes('import { logger } from \'@/lib/logger\'')) {
    content = content.replace(/import { logger } from '@\/lib\/logger'\n?/g, '');
    modified = true;
  }

  // Remplacer logger par console dans middleware
  if (content.includes('logger.warn')) {
    content = content.replace(/logger\.warn/g, 'console.warn');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(middlewarePath, content);
    fixes.push('✅ Fixed root middleware.ts');
    fixedCount++;
  } else {
    fixes.push('ℹ️  Root middleware already fixed');
  }
}

// 5. Nettoyer le cache Next.js (si on peut)
function cleanNextCache() {
  const nextDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(nextDir)) {
    try {
      // Essayer de supprimer juste le cache
      const traceFile = path.join(nextDir, 'trace');
      if (fs.existsSync(traceFile)) {
        fs.unlinkSync(traceFile);
        fixes.push('✅ Cleaned Next.js trace cache');
        fixedCount++;
      }
    } catch (error) {
      fixes.push('⚠️  Could not clean Next.js cache (manual cleanup needed)');
    }
  }
}

// 6. Créer un fichier de vérification
function createVerificationFile() {
  const verificationScript = `#!/usr/bin/env node

/**
 * Script de vérification post-déploiement
 * Vérifie que tous les bugs sont corrigés
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING PRODUCTION FIXES\\n');

const checks = [];
let allGood = true;

// Vérifier absence de middleware dupliqué
if (!fs.existsSync('src/middleware.ts')) {
  checks.push('✅ No duplicate middleware in src/');
} else {
  checks.push('❌ Duplicate middleware still exists in src/');
  allGood = false;
}

// Vérifier logger.ts
const loggerContent = fs.readFileSync('src/lib/logger.ts', 'utf8');
if (!loggerContent.includes('logger.debug(')) {
  checks.push('✅ No logger recursion in logger.ts');
} else {
  checks.push('❌ Logger recursion still present');
  allGood = false;
}

// Vérifier _app.tsx
const appContent = fs.readFileSync('src/pages/_app.tsx', 'utf8');
if (!appContent.includes('logger.debug(\\'Cookie consent') && !appContent.includes('logger.warn(\\'Error parsing')) {
  checks.push('✅ Client-side logger calls fixed in _app.tsx');
} else {
  checks.push('❌ Client-side logger calls still present');
  allGood = false;
}

// Vérifier middleware racine
const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
if (!middlewareContent.includes('import { logger }')) {
  checks.push('✅ No logger import in root middleware');
} else {
  checks.push('❌ Logger import still in middleware');
  allGood = false;
}

checks.forEach(check => console.log(check));

console.log('\\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 ALL CHECKS PASSED - PRODUCTION READY!');
  process.exit(0);
} else {
  console.log('❌ SOME ISSUES REMAIN - CHECK ABOVE');
  process.exit(1);
}
`;

  fs.writeFileSync(path.join(__dirname, 'verify-production-fixes.js'), verificationScript);
  fixes.push('✅ Created verification script');
}

// Exécuter toutes les corrections
async function runAllFixes() {
  console.log('🔧 Running all production fixes...\n');
  
  try {
    removeDuplicateMiddleware();
    fixLoggerRecursion();
    fixClientSideScript();
    fixRootMiddleware();
    cleanNextCache();
    createVerificationFile();
    
    console.log('\n📋 FIXES APPLIED:');
    console.log('='.repeat(50));
    fixes.forEach(fix => console.log(fix));
    
    console.log(`\n✅ COMPLETED: ${fixedCount} fixes applied`);
    console.log('\n🚀 NEXT STEPS FOR PRODUCTION:');
    console.log('1. Run: npm run build');
    console.log('2. Test admin dashboard locally');
    console.log('3. Deploy to production');
    console.log('4. Run: node scripts/verify-production-fixes.js');
    console.log('\n💡 TIP: Check /admin/dashboard after deployment');
    
  } catch (error) {
    console.error('❌ ERROR during fixes:', error);
    process.exit(1);
  }
}

runAllFixes();