#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script pour remplacer les console.log par logger approprié
 * Usage: node scripts/clean-console-logs.js
 */

const sourceDir = path.join(__dirname, '..', 'src');

// Patterns de remplacement
const replacements = [
  {
    // console.log → logger.debug
    pattern: /console\.log\(/g,
    replacement: 'logger.debug('
  },
  {
    // console.error → logger.error
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    // console.warn → logger.warn
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  },
  {
    // console.info → logger.info
    pattern: /console\.info\(/g,
    replacement: 'logger.info('
  }
];

// Import à ajouter si pas présent
const loggerImport = "import { logger } from '@/lib/logger'";

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let hasConsoleUsage = false;

  // Vérifier si le fichier utilise console.*
  for (const { pattern } of replacements) {
    if (pattern.test(content)) {
      hasConsoleUsage = true;
      break;
    }
  }

  if (!hasConsoleUsage) {
    return false; // Pas de modifications nécessaires
  }

  // Appliquer les remplacements
  for (const { pattern, replacement } of replacements) {
    modified = modified.replace(pattern, replacement);
  }

  // Ajouter l'import logger si nécessaire et pas présent
  if (!modified.includes("import { logger }") && !modified.includes("from '@/lib/logger'")) {
    // Trouver la dernière ligne d'import
    const lines = modified.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && lines[i].includes('from')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, loggerImport);
      modified = lines.join('\n');
    }
  }

  // Sauvegarder uniquement si modifié
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return true;
  }
  
  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processedCount += walkDirectory(fullPath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      try {
        if (processFile(fullPath)) {
          console.log(`✓ Processed: ${path.relative(sourceDir, fullPath)}`);
          processedCount++;
        }
      } catch (error) {
        console.error(`✗ Error processing ${fullPath}:`, error.message);
      }
    }
  }
  
  return processedCount;
}

console.log('🧹 Cleaning console.log statements...\n');

const startTime = Date.now();
const processedCount = walkDirectory(sourceDir);
const duration = Date.now() - startTime;

console.log(`\n✅ Done! Processed ${processedCount} files in ${duration}ms`);
console.log('📋 Next steps:');
console.log('  1. Review changes: git diff');
console.log('  2. Test: npm run dev');
console.log('  3. Lint check: npm run lint');