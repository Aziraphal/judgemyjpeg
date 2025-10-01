/**
 * Script d'export Neon → Supabase
 * URGENCE : Migration pour stopper les frais Neon
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Neon URL
    }
  }
});

async function exportData() {
  console.log('🚀 Début de l\'export Neon...\n');

  try {
    // Export Users
    console.log('📦 Export des utilisateurs...');
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        userPreferences: true,
        photos: true,
        collections: {
          include: {
            items: true
          }
        },
        favorites: true,
        feedbacks: true,
        reports: true,
        userSessions: true,
        apiKeys: {
          include: {
            usages: true
          }
        }
      }
    });
    console.log(`✅ ${users.length} utilisateurs exportés`);

    // Export AuditLogs
    console.log('📦 Export des audit logs...');
    const auditLogs = await prisma.auditLog.findMany();
    console.log(`✅ ${auditLogs.length} audit logs exportés`);

    // Export VerificationTokens
    console.log('📦 Export des tokens de vérification...');
    const verificationTokens = await prisma.verificationToken.findMany();
    console.log(`✅ ${verificationTokens.length} tokens exportés`);

    // Sauvegarder en JSON
    const exportData = {
      users,
      auditLogs,
      verificationTokens,
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      totalPhotos: users.reduce((acc, u) => acc + u.photos.length, 0)
    };

    const exportPath = path.join(__dirname, 'neon-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Export terminé : ${exportPath}`);
    console.log(`📊 Statistiques :`);
    console.log(`   - Utilisateurs : ${exportData.totalUsers}`);
    console.log(`   - Photos : ${exportData.totalPhotos}`);
    console.log(`   - Audit logs : ${auditLogs.length}`);

    return exportData;

  } catch (error) {
    console.error('❌ Erreur lors de l\'export :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData()
  .then(() => {
    console.log('\n✅ Export Neon réussi !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Échec export :', error);
    process.exit(1);
  });
