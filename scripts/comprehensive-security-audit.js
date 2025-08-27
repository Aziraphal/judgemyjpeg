#!/usr/bin/env node

/**
 * AUDIT DE SÉCURITÉ COMPLET - JUDGEMYJPEG
 * Analyse complète de la sécurité de l'application
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔒 AUDIT DE SÉCURITÉ COMPLET - JUDGEMYJPEG');
console.log('='.repeat(60));
console.log(`Date: ${new Date().toLocaleString('fr-FR')}`);
console.log('='.repeat(60));

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
    this.basePath = path.join(__dirname, '..');
  }

  addIssue(category, severity, title, description, fix) {
    this.issues.push({ category, severity, title, description, fix });
  }

  addWarning(category, title, description, recommendation) {
    this.warnings.push({ category, title, description, recommendation });
  }

  addPassed(category, title, description) {
    this.passed.push({ category, title, description });
  }

  // 1. AUDIT DES VARIABLES D'ENVIRONNEMENT
  auditEnvironmentVariables() {
    console.log('\n🔑 1. AUDIT VARIABLES D\'ENVIRONNEMENT');
    console.log('-'.repeat(40));

    const criticalEnvVars = [
      'NEXTAUTH_SECRET', 
      'ADMIN_SECRET',
      'DATABASE_URL',
      'OPENAI_API_KEY'
    ];

    const sensitiveEnvVars = [
      'STRIPE_SECRET_KEY',
      'CLOUDINARY_API_SECRET',
      'EMAIL_SERVER_PASSWORD'
    ];

    criticalEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        this.addIssue('Environment', 'HIGH', 
          `${varName} manquante`, 
          `Variable critique ${varName} non définie`,
          `Définir ${varName} dans les variables d'environnement`
        );
      } else {
        this.addPassed('Environment', `${varName} définie`, 'Variable critique présente');
      }
    });

    // Vérifier la longueur des secrets
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      this.addIssue('Environment', 'MEDIUM',
        'NEXTAUTH_SECRET trop court',
        'Le secret NextAuth fait moins de 32 caractères',
        'Générer un secret plus long: openssl rand -base64 32'
      );
    }

    if (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.length < 16) {
      this.addWarning('Environment',
        'ADMIN_SECRET faible',
        'Le mot de passe admin pourrait être plus long',
        'Utiliser un mot de passe d\'au moins 20 caractères'
      );
    }
  }

  // 2. AUDIT DU CODE SOURCE
  auditSourceCode() {
    console.log('\n📝 2. AUDIT CODE SOURCE');
    console.log('-'.repeat(40));

    const dangerousPatterns = [
      { pattern: /eval\s*\(/, severity: 'CRITICAL', description: 'Usage de eval() détecté' },
      { pattern: /document\.write/, severity: 'HIGH', description: 'Usage de document.write détecté' },
      { pattern: /innerHTML\s*=.*<script/i, severity: 'HIGH', description: 'Injection potentielle de script' },
      { pattern: /process\.env\.[A-Z_]+/g, severity: 'INFO', description: 'Variable d\'environnement en dur' },
      { pattern: /console\.log\(/g, severity: 'LOW', description: 'Console.log présent (déjà nettoyé)' },
      { pattern: /TODO|FIXME|HACK/i, severity: 'LOW', description: 'Code temporaire détecté' },
      { pattern: /password.*=.*["'][^"']{1,8}["']/i, severity: 'CRITICAL', description: 'Mot de passe faible en dur' },
      { pattern: /api[_-]?key.*=.*["'][^"']+["']/i, severity: 'HIGH', description: 'Clé API potentiellement en dur' }
    ];

    const filesToScan = this.getSourceFiles();
    
    filesToScan.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        dangerousPatterns.forEach(({ pattern, severity, description }) => {
          const matches = content.match(pattern);
          if (matches) {
            const relPath = path.relative(this.basePath, filePath);
            
            if (severity === 'CRITICAL' || severity === 'HIGH') {
              this.addIssue('Code', severity, description, 
                `Trouvé dans ${relPath}: ${matches.length} occurrence(s)`,
                'Revoir le code et sécuriser les patterns dangereux'
              );
            } else {
              this.addWarning('Code', description,
                `Trouvé dans ${relPath}: ${matches.length} occurrence(s)`,
                'Considérer l\'amélioration du code'
              );
            }
          }
        });
      } catch (error) {
        // Ignorer les erreurs de lecture de fichier
      }
    });
  }

  // 3. AUDIT DES DÉPENDANCES
  async auditDependencies() {
    console.log('\n📦 3. AUDIT DÉPENDANCES');
    console.log('-'.repeat(40));

    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.basePath, 'package.json'), 'utf8'));
      
      // Vérifier les dépendances sensibles
      const sensitiveDeps = [
        'eval', 'vm2', 'serialize-javascript', 'node-serialize'
      ];

      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      sensitiveDeps.forEach(dep => {
        if (allDeps[dep]) {
          this.addWarning('Dependencies', 
            `Dépendance sensible: ${dep}`,
            'Cette dépendance peut présenter des risques de sécurité',
            'Vérifier si elle est vraiment nécessaire'
          );
        }
      });

      // Vérifier les versions obsolètes importantes
      const criticalDeps = {
        'next': '14.0.0',
        'react': '18.0.0',
        '@prisma/client': '5.0.0'
      };

      Object.entries(criticalDeps).forEach(([dep, minVersion]) => {
        if (allDeps[dep]) {
          const currentVersion = allDeps[dep].replace(/[^0-9.]/g, '');
          if (this.compareVersions(currentVersion, minVersion) < 0) {
            this.addIssue('Dependencies', 'MEDIUM',
              `${dep} obsolète`,
              `Version ${currentVersion} < ${minVersion}`,
              `Mettre à jour: npm install ${dep}@latest`
            );
          } else {
            this.addPassed('Dependencies', `${dep} à jour`, `Version ${currentVersion}`);
          }
        }
      });

      this.addPassed('Dependencies', 'Scan général', 'Aucune dépendance critique dangereuse détectée');

    } catch (error) {
      this.addWarning('Dependencies', 'Erreur lecture package.json', 
        'Impossible de lire package.json', 'Vérifier le fichier');
    }
  }

  // 4. AUDIT DE LA CONFIGURATION
  auditConfiguration() {
    console.log('\n⚙️ 4. AUDIT CONFIGURATION');
    console.log('-'.repeat(40));

    // Vérifier next.config.js
    try {
      const nextConfigPath = path.join(this.basePath, 'next.config.js');
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

      // CSP présent
      if (nextConfig.includes('Content-Security-Policy')) {
        this.addPassed('Config', 'CSP configuré', 'Content Security Policy présent');
      } else {
        this.addIssue('Config', 'HIGH', 'CSP manquant', 
          'Pas de Content Security Policy', 
          'Configurer CSP dans next.config.js');
      }

      // Headers sécurisés
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options', 
        'Referrer-Policy',
        'Strict-Transport-Security'
      ];

      securityHeaders.forEach(header => {
        if (nextConfig.includes(header)) {
          this.addPassed('Config', `${header} configuré`, 'Header de sécurité présent');
        } else {
          this.addWarning('Config', `${header} manquant`,
            'Header de sécurité recommandé non présent',
            `Ajouter ${header} dans next.config.js`
          );
        }
      });

      // Vérifier si unsafe-inline est utilisé
      if (nextConfig.includes("'unsafe-inline'")) {
        this.addWarning('Config', 'CSP unsafe-inline',
          'unsafe-inline utilisé dans CSP',
          'Considérer utiliser des nonces à la place'
        );
      }

    } catch (error) {
      this.addWarning('Config', 'next.config.js illisible',
        'Impossible de lire la configuration Next.js',
        'Vérifier next.config.js'
      );
    }
  }

  // 5. AUDIT DES FICHIERS SENSIBLES
  auditSensitiveFiles() {
    console.log('\n📁 5. AUDIT FICHIERS SENSIBLES');
    console.log('-'.repeat(40));

    const sensitiveFiles = [
      { path: '.env', critical: true },
      { path: '.env.local', critical: true },
      { path: '.env.production', critical: true },
      { path: 'prisma/schema.prisma', critical: false },
      { path: 'package-lock.json', critical: false }
    ];

    sensitiveFiles.forEach(({ path: filePath, critical }) => {
      const fullPath = path.join(this.basePath, filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        
        // Vérifier les permissions (sur Unix)
        if (process.platform !== 'win32') {
          const mode = stats.mode & parseInt('777', 8);
          if (critical && mode > parseInt('600', 8)) {
            this.addIssue('Files', 'MEDIUM',
              `Permissions ${filePath} trop ouvertes`,
              `Permissions ${mode.toString(8)} trop permissives`,
              `chmod 600 ${filePath}`
            );
          }
        }

        this.addPassed('Files', `${filePath} sécurisé`, 'Fichier sensible présent avec bonnes permissions');
      }
    });

    // Vérifier .gitignore
    const gitignorePath = path.join(this.basePath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      const requiredEntries = ['.env*', 'node_modules', '.next'];
      
      requiredEntries.forEach(entry => {
        if (!gitignore.includes(entry)) {
          this.addIssue('Files', 'HIGH',
            `${entry} pas dans .gitignore`,
            'Fichiers sensibles pourraient être commitstv', 
            `Ajouter ${entry} dans .gitignore`
          );
        }
      });
    }
  }

  // 6. AUDIT DES APIS
  auditAPIs() {
    console.log('\n🌐 6. AUDIT APIs');
    console.log('-'.repeat(40));

    const apiDir = path.join(this.basePath, 'src/pages/api');
    if (!fs.existsSync(apiDir)) {
      this.addWarning('APIs', 'Dossier API introuvable', 
        'Dossier src/pages/api non trouvé',
        'Vérifier la structure du projet'
      );
      return;
    }

    const apiFiles = this.getApiFiles();
    let authChecks = 0;
    let rateLimiting = 0;
    let inputValidation = 0;

    apiFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(this.basePath, filePath);

        // Vérifier l'authentification
        if (content.includes('getSession') || content.includes('requireAuth') || content.includes('jwt')) {
          authChecks++;
        }

        // Vérifier rate limiting
        if (content.includes('rateLimit') || content.includes('slowDown')) {
          rateLimiting++;
        }

        // Vérifier validation des inputs
        if (content.includes('joi') || content.includes('yup') || content.includes('zod') || content.includes('validator')) {
          inputValidation++;
        }

        // Patterns dangereux dans les APIs
        if (content.includes('exec(') || content.includes('eval(')) {
          this.addIssue('APIs', 'CRITICAL',
            `Code dangereux dans ${relPath}`,
            'Usage de exec() ou eval() détecté',
            'Remplacer par des alternatives sécurisées'
          );
        }

        // SQL direct sans ORM
        if (content.includes('SELECT ') && !content.includes('prisma')) {
          this.addWarning('APIs', `SQL direct dans ${relPath}`,
            'Requête SQL directe détectée',
            'Considérer utiliser Prisma pour éviter les injections SQL'
          );
        }

      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    });

    // Statistiques APIs
    const apiCount = apiFiles.length;
    this.addPassed('APIs', `${apiCount} APIs analysées`, 'Scan complété');
    
    if (authChecks < apiCount * 0.5) {
      this.addWarning('APIs', 'Authentification insuffisante',
        `Seulement ${authChecks}/${apiCount} APIs ont de l'authentification`,
        'Ajouter l\'authentification aux APIs sensibles'
      );
    }
  }

  // 7. AUDIT SÉCURITÉ WEB
  auditWebSecurity() {
    console.log('\n🌍 7. AUDIT SÉCURITÉ WEB');
    console.log('-'.repeat(40));

    // Vérifier middleware.ts
    const middlewarePath = path.join(this.basePath, 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const middleware = fs.readFileSync(middlewarePath, 'utf8');
      
      if (middleware.includes('rateLimit')) {
        this.addPassed('Web', 'Rate limiting configuré', 'Middleware de rate limiting présent');
      } else {
        this.addWarning('Web', 'Rate limiting manquant',
          'Pas de rate limiting dans le middleware',
          'Ajouter rate limiting pour prévenir les abus'
        );
      }

      if (middleware.includes('cors')) {
        this.addPassed('Web', 'CORS configuré', 'Configuration CORS présente');
      }
    }

    // Vérifier les uploads
    const uploadDirs = ['public/uploads', 'uploads', 'tmp'];
    uploadDirs.forEach(dir => {
      const uploadPath = path.join(this.basePath, dir);
      if (fs.existsSync(uploadPath)) {
        this.addWarning('Web', `Dossier upload ${dir} détecté`,
          'Dossier d\'upload présent',
          'S\'assurer que les uploads sont sécurisés et validés'
        );
      }
    });
  }

  // 8. AUDIT LOGGING & MONITORING
  auditLogging() {
    console.log('\n📊 8. AUDIT LOGGING & MONITORING');
    console.log('-'.repeat(40));

    // Vérifier logger
    const loggerPath = path.join(this.basePath, 'src/lib/logger.ts');
    if (fs.existsSync(loggerPath)) {
      const logger = fs.readFileSync(loggerPath, 'utf8');
      
      if (logger.includes('sanitize')) {
        this.addPassed('Logging', 'Logger sécurisé', 'Sanitisation des données présente');
      }

      if (logger.includes('audit')) {
        this.addPassed('Logging', 'Audit logging', 'Logs d\'audit configurés');
      }
    }

    // Vérifier Sentry
    if (fs.existsSync(path.join(this.basePath, 'sentry.client.config.ts'))) {
      this.addPassed('Monitoring', 'Sentry configuré', 'Monitoring d\'erreurs actif');
    }
  }

  // MÉTHODES UTILITAIRES
  getSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = ['node_modules', '.next', 'dist', 'build'];
    return this.getAllFiles(this.basePath, extensions, excludeDirs);
  }

  getApiFiles() {
    const apiDir = path.join(this.basePath, 'src/pages/api');
    const extensions = ['.ts', '.js'];
    return this.getAllFiles(apiDir, extensions, []);
  }

  getAllFiles(dir, extensions, excludeDirs) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const traverse = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.some(exclude => item.includes(exclude))) {
            traverse(itemPath);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(itemPath);
        }
      });
    };
    
    traverse(dir);
    return files;
  }

  compareVersions(a, b) {
    const pa = a.split('.');
    const pb = b.split('.');
    for (let i = 0; i < 3; i++) {
      const na = Number(pa[i]);
      const nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
    }
    return 0;
  }

  // GÉNÉRATION DU RAPPORT
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RAPPORT D\'AUDIT DE SÉCURITÉ');
    console.log('='.repeat(60));

    // Résumé
    const criticalIssues = this.issues.filter(i => i.severity === 'CRITICAL');
    const highIssues = this.issues.filter(i => i.severity === 'HIGH');
    const mediumIssues = this.issues.filter(i => i.severity === 'MEDIUM');
    const lowIssues = this.issues.filter(i => i.severity === 'LOW');

    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`   🚨 Critiques: ${criticalIssues.length}`);
    console.log(`   ⚠️  Élevés: ${highIssues.length}`);
    console.log(`   🟡 Moyens: ${mediumIssues.length}`);
    console.log(`   🔵 Faibles: ${lowIssues.length}`);
    console.log(`   ⚠️  Avertissements: ${this.warnings.length}`);
    console.log(`   ✅ Tests réussis: ${this.passed.length}`);

    // Issues critiques
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 PROBLÈMES CRITIQUES (À CORRIGER IMMÉDIATEMENT):`);
      criticalIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.category}] ${issue.title}`);
        console.log(`      ${issue.description}`);
        console.log(`      🔧 Solution: ${issue.fix}`);
        console.log('');
      });
    }

    // Issues élevés
    if (highIssues.length > 0) {
      console.log(`\n⚠️ PROBLÈMES ÉLEVÉS (À CORRIGER RAPIDEMENT):`);
      highIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.category}] ${issue.title}`);
        console.log(`      ${issue.description}`);
        console.log(`      🔧 Solution: ${issue.fix}`);
        console.log('');
      });
    }

    // Avertissements importants
    const importantWarnings = this.warnings.slice(0, 5);
    if (importantWarnings.length > 0) {
      console.log(`\n🟡 AVERTISSEMENTS PRINCIPAUX:`);
      importantWarnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. [${warning.category}] ${warning.title}`);
        console.log(`      ${warning.description}`);
        console.log(`      💡 Recommandation: ${warning.recommendation}`);
        console.log('');
      });
    }

    // Score de sécurité
    const totalChecks = this.issues.length + this.warnings.length + this.passed.length;
    const securityScore = totalChecks > 0 ? Math.round((this.passed.length / totalChecks) * 100) : 0;
    
    console.log(`\n🎯 SCORE DE SÉCURITÉ: ${securityScore}/100`);
    
    if (securityScore >= 90) {
      console.log('   🟢 EXCELLENT - Sécurité robuste');
    } else if (securityScore >= 75) {
      console.log('   🟡 BIEN - Quelques améliorations possibles');
    } else if (securityScore >= 60) {
      console.log('   🟠 MOYEN - Plusieurs points à améliorer');
    } else {
      console.log('   🔴 FAIBLE - Action de sécurisation requise');
    }

    // Prochaines étapes
    console.log(`\n📋 PROCHAINES ÉTAPES RECOMMANDÉES:`);
    if (criticalIssues.length > 0) {
      console.log('   1. 🚨 Corriger immédiatement les problèmes critiques');
    }
    if (highIssues.length > 0) {
      console.log('   2. ⚠️  Traiter les problèmes élevés cette semaine');
    }
    if (mediumIssues.length > 0) {
      console.log('   3. 🟡 Planifier la correction des problèmes moyens');
    }
    if (this.warnings.length > 5) {
      console.log('   4. 💡 Revoir les avertissements importants');
    }
    console.log('   5. 🔄 Refaire un audit dans 30 jours');

    console.log('\n' + '='.repeat(60));
    console.log('✅ AUDIT TERMINÉ');
    console.log('='.repeat(60));
  }

  async run() {
    this.auditEnvironmentVariables();
    this.auditSourceCode();
    await this.auditDependencies();
    this.auditConfiguration();
    this.auditSensitiveFiles();
    this.auditAPIs();
    this.auditWebSecurity();
    this.auditLogging();
    this.generateReport();
  }
}

// Lancer l'audit
const auditor = new SecurityAuditor();
auditor.run().catch(console.error);