#!/usr/bin/env node

/**
 * Script de vérification post-déploiement
 * Vérifie que tous les bugs sont corrigés
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING PRODUCTION FIXES\n');

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
if (!appContent.includes('logger.debug(\'Cookie consent') && !appContent.includes('logger.warn(\'Error parsing')) {
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

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 ALL CHECKS PASSED - PRODUCTION READY!');
  process.exit(0);
} else {
  console.log('❌ SOME ISSUES REMAIN - CHECK ABOVE');
  process.exit(1);
}
