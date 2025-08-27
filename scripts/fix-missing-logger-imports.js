#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script pour ajouter les imports logger manquants
 */

const sourceDir = path.join(__dirname, '..', 'src');
const loggerImport = "import { logger } from '@/lib/logger'";

function fixMissingImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si le fichier utilise logger mais n'a pas l'import
  const usesLogger = /\blogger\.(debug|info|warn|error)/g.test(content);
  const hasImport = content.includes("import { logger }") || content.includes("from '@/lib/logger'");
  
  if (usesLogger && !hasImport) {
    console.log(`✓ Adding logger import to: ${path.relative(sourceDir, filePath)}`);
    
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    // Trouver la dernière ligne d'import
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && lines[i].includes('from')) {
        lastImportIndex = i;
      } else if (lines[i].trim().startsWith('/**') || lines[i].trim().startsWith('*')) {
        // Ignorer les commentaires de début de fichier
        continue;
      } else if (lines[i].trim() === '') {
        // Ligne vide, continuer
        continue;
      } else if (!lines[i].trim().startsWith('import') && lastImportIndex === -1) {
        // Premier code non-import, insérer ici
        lines.splice(i, 0, loggerImport, '');
        break;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, loggerImport);
    }
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  
  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += walkDirectory(fullPath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      try {
        if (fixMissingImports(fullPath)) {
          fixedCount++;
        }
      } catch (error) {
        console.error(`✗ Error processing ${fullPath}:`, error.message);
      }
    }
  }
  
  return fixedCount;
}

console.log('🔧 Fixing missing logger imports...\n');

const startTime = Date.now();
const fixedCount = walkDirectory(sourceDir);
const duration = Date.now() - startTime;

console.log(`\n✅ Fixed ${fixedCount} files in ${duration}ms`);