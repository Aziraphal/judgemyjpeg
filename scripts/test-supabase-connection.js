const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Test connexion Supabase...\n');

  try {
    // Test users
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);

    // Test photos
    const photoCount = await prisma.photo.count();
    console.log(`✅ Photos: ${photoCount}`);

    // Test audit logs
    const auditCount = await prisma.auditLog.count();
    console.log(`✅ Audit logs: ${auditCount}`);

    // Test query performance
    const start = Date.now();
    const recentPhotos = await prisma.photo.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
    const duration = Date.now() - start;

    console.log(`✅ Query test: ${recentPhotos.length} photos en ${duration}ms`);
    console.log('\n🎉 Connexion Supabase OK ! Tout fonctionne !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
