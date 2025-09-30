#!/usr/bin/env node

/**
 * Script d'administration pour accorder un accès premium gratuit à vie
 *
 * Usage:
 *   node grant-premium.js <email> <raison> [granted_by]
 *
 * Exemples:
 *   node grant-premium.js user@example.com "Testeur beta" "admin"
 *   node grant-premium.js user@example.com "Contributeur open-source"
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantPremium(email, reason, grantedBy = 'admin') {
  try {
    console.log('\n🔍 Recherche de l\'utilisateur...');

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        manualPremiumAccess: true,
        stripeCustomerId: true
      }
    });

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 Utilisateur trouvé:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nom: ${user.name || 'N/A'}`);
    console.log(`   Statut actuel: ${user.subscriptionStatus}`);
    console.log(`   Premium manuel actuel: ${user.manualPremiumAccess ? 'OUI' : 'NON'}`);
    console.log(`   Stripe Customer: ${user.stripeCustomerId || 'N/A'}`);

    if (user.manualPremiumAccess) {
      console.log('\n⚠️  Cet utilisateur a DÉJÀ un accès premium manuel.');
      console.log('   Voulez-vous continuer pour mettre à jour la raison ? (Ctrl+C pour annuler)');

      // Attendre 3 secondes pour permettre l'annulation
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n✅ Accord de l'accès premium gratuit à vie...`);
    console.log(`   Raison: ${reason}`);
    console.log(`   Accordé par: ${grantedBy}`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        manualPremiumAccess: true,
        manualPremiumReason: reason,
        manualPremiumGrantedAt: new Date(),
        manualPremiumGrantedBy: grantedBy
      }
    });

    console.log('\n🎉 Succès ! Accès premium accordé.');
    console.log('\n📊 Détails:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Premium manuel: OUI ✓`);
    console.log(`   Raison: ${reason}`);
    console.log(`   Accordé par: ${grantedBy}`);
    console.log(`   Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log('\n💡 Note: Cet accès premium est PERMANENT et ne sera PAS affecté par les webhooks Stripe.');
    console.log('   L\'utilisateur bénéficie maintenant d\'analyses illimitées à vie.');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function revokePremium(email) {
  try {
    console.log('\n🔍 Recherche de l\'utilisateur...');

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        manualPremiumAccess: true,
        manualPremiumReason: true
      }
    });

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      process.exit(1);
    }

    if (!user.manualPremiumAccess) {
      console.log(`⚠️  Cet utilisateur n'a PAS d'accès premium manuel.`);
      process.exit(0);
    }

    console.log('\n❌ Révocation de l\'accès premium manuel...');
    console.log(`   Raison initiale: ${user.manualPremiumReason || 'N/A'}`);

    await prisma.user.update({
      where: { email },
      data: {
        manualPremiumAccess: false,
        manualPremiumReason: null,
        manualPremiumGrantedAt: null,
        manualPremiumGrantedBy: null
      }
    });

    console.log('\n✅ Accès premium manuel révoqué avec succès.');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function listManualPremiums() {
  try {
    console.log('\n🔍 Recherche des utilisateurs avec accès premium manuel...\n');

    const users = await prisma.user.findMany({
      where: { manualPremiumAccess: true },
      select: {
        email: true,
        name: true,
        subscriptionStatus: true,
        manualPremiumReason: true,
        manualPremiumGrantedAt: true,
        manualPremiumGrantedBy: true,
        createdAt: true
      },
      orderBy: { manualPremiumGrantedAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('   Aucun utilisateur avec accès premium manuel trouvé.');
    } else {
      console.log(`   ${users.length} utilisateur(s) trouvé(s):\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      Nom: ${user.name || 'N/A'}`);
        console.log(`      Raison: ${user.manualPremiumReason || 'N/A'}`);
        console.log(`      Accordé par: ${user.manualPremiumGrantedBy || 'N/A'}`);
        console.log(`      Accordé le: ${user.manualPremiumGrantedAt ? new Date(user.manualPremiumGrantedAt).toLocaleString('fr-FR') : 'N/A'}`);
        console.log(`      Statut Stripe: ${user.subscriptionStatus}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
🔐 Script de gestion des accès premium manuels
==============================================

Usage:
  node grant-premium.js <commande> [arguments]

Commandes:

  grant <email> <raison> [granted_by]
    Accorder un accès premium gratuit à vie
    Exemple: node grant-premium.js grant test@example.com "Testeur beta" "admin"

  revoke <email>
    Révoquer un accès premium manuel
    Exemple: node grant-premium.js revoke test@example.com

  list
    Lister tous les utilisateurs avec accès premium manuel
    Exemple: node grant-premium.js list

  --help, -h
    Afficher cette aide
`);
  process.exit(0);
}

const command = args[0];

switch (command) {
  case 'grant':
    if (args.length < 3) {
      console.error('❌ Usage: node grant-premium.js grant <email> <raison> [granted_by]');
      process.exit(1);
    }
    grantPremium(args[1], args[2], args[3] || 'admin');
    break;

  case 'revoke':
    if (args.length < 2) {
      console.error('❌ Usage: node grant-premium.js revoke <email>');
      process.exit(1);
    }
    revokePremium(args[1]);
    break;

  case 'list':
    listManualPremiums();
    break;

  default:
    console.error(`❌ Commande inconnue: ${command}`);
    console.error('   Utilisez --help pour voir les commandes disponibles');
    process.exit(1);
}
