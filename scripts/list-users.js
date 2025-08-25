// Script pour lister les utilisateurs inscrits
const { PrismaClient } = require('@prisma/client')

async function listUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('📊 Récupération des utilisateurs inscrits...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptionStatus: true,
        _count: {
          select: {
            photos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`✅ Total d'utilisateurs: ${users.length}\n`)
    
    if (users.length === 0) {
      console.log('Aucun utilisateur inscrit pour le moment.')
      return
    }
    
    console.log('👥 Liste des utilisateurs:')
    console.log('─'.repeat(80))
    
    users.forEach((user, index) => {
      const statusEmoji = {
        'free': '🆓',
        'premium': '⭐',
        'lifetime': '💎'
      }[user.subscriptionStatus] || '❓'
      
      console.log(`${index + 1}. ${statusEmoji} ${user.name || 'Sans nom'}`)
      console.log(`   📧 ${user.email}`)
      console.log(`   📸 ${user._count.photos} photo(s) téléchargée(s)`)
      console.log(`   📅 Inscrit le: ${user.createdAt.toLocaleDateString('fr-FR')}`)
      console.log(`   📊 Statut: ${user.subscriptionStatus}`)
      console.log('')
    })
    
    // Statistiques rapides
    const stats = {
      free: users.filter(u => u.subscriptionStatus === 'free').length,
      premium: users.filter(u => u.subscriptionStatus === 'premium').length,
      lifetime: users.filter(u => u.subscriptionStatus === 'lifetime').length,
      totalPhotos: users.reduce((sum, u) => sum + u._count.photos, 0)
    }
    
    console.log('📈 Statistiques rapides:')
    console.log('─'.repeat(40))
    console.log(`🆓 Utilisateurs gratuits: ${stats.free}`)
    console.log(`⭐ Utilisateurs premium: ${stats.premium}`)
    console.log(`💎 Utilisateurs lifetime: ${stats.lifetime}`)
    console.log(`📸 Total photos: ${stats.totalPhotos}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()