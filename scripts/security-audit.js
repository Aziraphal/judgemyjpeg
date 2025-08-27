#!/usr/bin/env node

/**
 * Script d'audit sécurité suite à l'alerte MetaMask
 * Usage: node scripts/security-audit.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 AUDIT DE SÉCURITÉ - ALERTE METAMASK\n');

const suspiciousPatterns = [
  'metamask',
  'web3',
  'ethereum', 
  'crypto',
  'bitcoin',
  'wallet',
  'inpage.js',
  'inject',
  'eval\\(',
  'document.write',
  'innerHTML.*script',
  'script.*src.*unknown'
];

const filesToCheck = [
  'src/pages/_app.tsx',
  'src/pages/_document.tsx', 
  'src/pages/analyze.tsx',
  'src/pages/index.tsx',
  'public/sw.js',
  'next.config.js'
];

let foundSuspicious = false;

console.log('🔍 RECHERCHE DE PATTERNS SUSPECTS...\n');

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    suspiciousPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(content)) {
        console.log(`🚨 SUSPECT: ${filePath} contient "${pattern}"`);
        foundSuspicious = true;
        
        // Montrer le contexte
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            console.log(`   Ligne ${index + 1}: ${line.trim()}`);
          }
        });
        console.log('');
      }
    });
  }
});

// Vérifier les scripts externes
console.log('🌐 VÉRIFICATION SCRIPTS EXTERNES...\n');

const pagesPath = path.join(__dirname, '..', 'src/pages');
const findExternalScripts = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findExternalScripts(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Rechercher les scripts externes
      const scriptMatches = content.match(/<script[^>]*src=["']([^"']+)["']/gi);
      if (scriptMatches) {
        scriptMatches.forEach(match => {
          console.log(`📄 ${file}: ${match}`);
          if (!match.includes('googleapis.com') && 
              !match.includes('googletagmanager.com') &&
              !match.includes('vercel.com')) {
            console.log(`⚠️  Script externe non vérifié détecté!`);
            foundSuspicious = true;
          }
        });
      }
    }
  });
};

findExternalScripts(pagesPath);

console.log('\n🎯 RECOMMANDATIONS IMMÉDIATES:\n');

if (foundSuspicious) {
  console.log('❌ PATTERNS SUSPECTS DÉTECTÉS !');
  console.log('🚨 Actions à faire:');
  console.log('   1. Vérifier tous les scripts externes');
  console.log('   2. Scanner les dépendances: npm audit');
  console.log('   3. Vérifier CSP headers');
  console.log('   4. Examiner le code suspect trouvé');
} else {
  console.log('✅ Aucun pattern suspect dans le code source');
  console.log('💡 L\'injection vient probablement de:');
  console.log('   1. Extension browser utilisateur');
  console.log('   2. CDN compromis (Google, Cloudflare, etc.)');
  console.log('   3. Publicité malveillante');
  console.log('   4. Service tiers compromis');
}

console.log('\n🔧 ACTIONS DE PROTECTION:');
console.log('   1. Ajouter Content Security Policy strict');
console.log('   2. Surveiller Sentry pour plus d\'erreurs');
console.log('   3. Vérifier les logs d\'accès pour activité suspecte');
console.log('   4. Considérer temporairement désactiver scripts externes');

console.log('\n📊 MONITORING:');
console.log('   - Surveiller dashboard Sentry');
console.log('   - Vérifier si d\'autres utilisateurs affectés');
console.log('   - Analyser géolocalisation des erreurs');

process.exit(foundSuspicious ? 1 : 0);