#!/usr/bin/env node

/**
 * Script pour supprimer les références Vercel (maintenant que Railway est la seule plateforme)
 * Usage: node scripts/remove-vercel-refs.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 NETTOYAGE RÉFÉRENCES VERCEL\n');

const filesToClean = [
  'PRODUCTION_DEPLOYMENT_GUIDE.md',
  'deploy-production.bat',
  'README.md',
  'docs/SCALING_PLAN.md'
];

let cleanedCount = 0;

filesToClean.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalLength = content.length;
      
      // Remplacements pour supprimer les références Vercel
      content = content.replace(/Railway\/Vercel/g, 'Railway');
      content = content.replace(/Vercel\/Railway/g, 'Railway');
      content = content.replace(/\bVercel\b/g, 'Railway');
      content = content.replace(/vercel\.com/g, 'railway.app');
      content = content.replace(/Railway railway\.app/g, 'Railway');
      
      // Supprimer les lignes spécifiques à Vercel
      content = content.replace(/.*Vercel:.*\n/g, '');
      content = content.replace(/.*Settings > Environment Variables.*\n/g, '');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath}: références Vercel supprimées`);
        cleanedCount++;
      } else {
        console.log(`ℹ️  ${filePath}: aucune référence Vercel trouvée`);
      }
    } catch (error) {
      console.log(`❌ ${filePath}: erreur lors du nettoyage`);
    }
  } else {
    console.log(`⚠️  ${filePath}: fichier non trouvé`);
  }
});

// Supprimer le fichier vercel.json s'il existe
const vercelJson = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(vercelJson)) {
  fs.unlinkSync(vercelJson);
  console.log('✅ vercel.json: supprimé');
  cleanedCount++;
}

console.log(`\n🎯 Résultat: ${cleanedCount} fichiers nettoyés`);
console.log('🚀 Railway est maintenant la seule plateforme de déploiement mentionnée');