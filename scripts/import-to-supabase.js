/**
 * Import des données Neon → Supabase
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  console.log('🚀 Début de l\'import vers Supabase...\n');

  try {
    // Lire le fichier d'export
    const exportPath = path.join(__dirname, 'neon-export.json');
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

    console.log(`📦 Import de ${exportData.totalUsers} utilisateurs et ${exportData.totalPhotos} photos...\n`);

    // Importer les utilisateurs avec toutes leurs données
    for (const user of exportData.users) {
      console.log(`👤 Import utilisateur: ${user.email || user.name}...`);

      // Créer l'utilisateur
      const createdUser = await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          currentPeriodEnd: user.currentPeriodEnd,
          lastAnalysisReset: user.lastAnalysisReset,
          monthlyAnalysisCount: user.monthlyAnalysisCount,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: user.subscriptionStatus,
          password: user.password,
          backupCodes: user.backupCodes || [],
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorSecret: user.twoFactorSecret,
          twoFactorVerified: user.twoFactorVerified,
          hashedPassword: user.hashedPassword,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry,
          nickname: user.nickname,
          starterAnalysisCount: user.starterAnalysisCount,
          starterExportsCount: user.starterExportsCount,
          starterPackActivated: user.starterPackActivated,
          starterPackUsed: user.starterPackUsed,
          starterSharesCount: user.starterSharesCount,
          starterPackPurchased: user.starterPackPurchased,
          role: user.role,
          isAdmin: user.isAdmin,
          manualPremiumAccess: user.manualPremiumAccess,
          manualPremiumReason: user.manualPremiumReason,
          manualPremiumGrantedAt: user.manualPremiumGrantedAt,
          manualPremiumGrantedBy: user.manualPremiumGrantedBy
        }
      });

      // Importer les accounts
      for (const account of user.accounts || []) {
        await prisma.account.create({
          data: {
            id: account.id,
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state
          }
        });
      }

      // Importer les sessions
      for (const session of user.sessions || []) {
        await prisma.session.create({
          data: {
            id: session.id,
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires
          }
        });
      }

      // Importer les préférences
      if (user.userPreferences) {
        await prisma.userPreferences.create({
          data: {
            id: user.userPreferences.id,
            userId: user.userPreferences.userId,
            displayName: user.userPreferences.displayName,
            preferredAnalysisMode: user.userPreferences.preferredAnalysisMode,
            defaultExportFormat: user.userPreferences.defaultExportFormat,
            theme: user.userPreferences.theme,
            language: user.userPreferences.language,
            shareAnalytics: user.userPreferences.shareAnalytics,
            publicProfile: user.userPreferences.publicProfile,
            createdAt: user.userPreferences.createdAt,
            updatedAt: user.userPreferences.updatedAt
          }
        });
      }

      // Importer les photos
      for (const photo of user.photos || []) {
        await prisma.photo.create({
          data: {
            id: photo.id,
            userId: photo.userId,
            url: photo.url,
            filename: photo.filename,
            analysis: photo.analysis,
            score: photo.score,
            suggestions: photo.suggestions,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
            isTopPhoto: photo.isTopPhoto,
            improvements: photo.improvements,
            potentialScore: photo.potentialScore,
            analysisLanguage: photo.analysisLanguage,
            analysisMetadata: photo.analysisMetadata,
            analysisTone: photo.analysisTone,
            exifData: photo.exifData,
            hasExifData: photo.hasExifData,
            partialScores: photo.partialScores,
            photoType: photo.photoType,
            sessionId: photo.sessionId
          }
        });
      }

      // Importer les collections
      for (const collection of user.collections || []) {
        const createdCollection = await prisma.collection.create({
          data: {
            id: collection.id,
            userId: collection.userId,
            name: collection.name,
            description: collection.description,
            color: collection.color,
            isPublic: collection.isPublic,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt
          }
        });

        // Importer les items de collection
        for (const item of collection.items || []) {
          await prisma.collectionItem.create({
            data: {
              id: item.id,
              collectionId: item.collectionId,
              photoId: item.photoId,
              addedAt: item.addedAt
            }
          });
        }
      }

      console.log(`   ✅ ${user.photos?.length || 0} photos, ${user.collections?.length || 0} collections\n`);
    }

    // Importer les audit logs
    console.log(`📝 Import de ${exportData.auditLogs.length} audit logs...`);
    for (const log of exportData.auditLogs) {
      await prisma.auditLog.create({
        data: {
          id: log.id,
          userId: log.userId,
          email: log.email,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          eventType: log.eventType,
          description: log.description,
          metadata: log.metadata,
          riskLevel: log.riskLevel,
          success: log.success,
          timestamp: log.timestamp
        }
      });
    }

    // Importer les verification tokens
    console.log(`🔐 Import de ${exportData.verificationTokens.length} tokens...`);
    for (const token of exportData.verificationTokens) {
      await prisma.verificationToken.create({
        data: {
          identifier: token.identifier,
          token: token.token,
          expires: token.expires
        }
      });
    }

    console.log('\n✅ Import terminé avec succès !');
    console.log(`📊 Résumé :`);
    console.log(`   - ${exportData.totalUsers} utilisateurs`);
    console.log(`   - ${exportData.totalPhotos} photos`);
    console.log(`   - ${exportData.auditLogs.length} audit logs`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'import :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData()
  .then(() => {
    console.log('\n🎉 Migration Neon → Supabase réussie !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Échec migration :', error);
    process.exit(1);
  });
