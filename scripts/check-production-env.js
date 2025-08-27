#!/usr/bin/env node

/**
 * Script pour vérifier les variables d'environnement nécessaires en production
 * Usage: node scripts/check-production-env.js
 */

console.log('🔍 VÉRIFICATION VARIABLES D\'ENVIRONNEMENT PRODUCTION\n');

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET', 
  'NEXTAUTH_URL',
  'ADMIN_SECRET',
  'OPENAI_API_KEY'
];

const optionalEnvVars = [
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'GA_TRACKING_ID',
  'ADMIN_BYPASS_RATE_LIMIT'
];

let allGood = true;

console.log('✅ VARIABLES REQUISES:');
console.log('='.repeat(40));

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    const maskedValue = envVar.includes('SECRET') || envVar.includes('KEY') || envVar.includes('URL')
      ? value.substring(0, 8) + '***'
      : value;
    console.log(`✅ ${envVar}: ${maskedValue}`);
  } else {
    console.log(`❌ ${envVar}: NON DÉFINIE`);
    allGood = false;
  }
});

console.log('\n📋 VARIABLES OPTIONNELLES:');
console.log('='.repeat(40));

optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    const maskedValue = envVar.includes('SECRET') || envVar.includes('KEY')
      ? value.substring(0, 8) + '***'
      : value;
    console.log(`✅ ${envVar}: ${maskedValue}`);
  } else {
    console.log(`⚠️  ${envVar}: non définie (optionnelle)`);
  }
});

console.log('\n🎯 SPÉCIAL ADMIN:');
console.log('='.repeat(40));

if (process.env.ADMIN_SECRET) {
  console.log(`✅ ADMIN_SECRET: ${process.env.ADMIN_SECRET.substring(0, 8)}***`);
  console.log(`💡 Pour se connecter admin: utilisez cette clé sur /admin/login`);
} else {
  console.log(`❌ ADMIN_SECRET: NON DÉFINIE`);
  console.log(`💡 Définissez ADMIN_SECRET pour activer l'admin`);
  console.log(`   Exemple: ADMIN_SECRET="mon-mot-de-passe-ultra-securise"`);
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 TOUTES LES VARIABLES REQUISES SONT DÉFINIES !');
  console.log('🚀 Votre application est prête pour la production.');
} else {
  console.log('❌ CERTAINES VARIABLES MANQUENT !');
  console.log('🔧 Définissez-les sur Railway (plateforme de déploiement):');
  console.log('   Railway: Variables tab dans votre projet');
}

console.log('\n🔑 Pour accéder à l\'admin en production:');
console.log(`   1. Allez sur https://votre-site.com/admin/login`);
console.log(`   2. Entrez la valeur de ADMIN_SECRET`);
console.log(`   3. Accédez au dashboard admin complet\n`);

process.exit(allGood ? 0 : 1);