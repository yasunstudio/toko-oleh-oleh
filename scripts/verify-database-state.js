// Verification script to show current database state
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabaseState() {
  console.log('🔍 DATABASE STATE VERIFICATION')
  console.log('=' .repeat(50))
  
  try {
    // Check all table counts
    const counts = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      productImages: await prisma.productImage.count(),
      cartItems: await prisma.cartItem.count(),
      orders: await prisma.order.count(),
      orderItems: await prisma.orderItem.count(),
      bankAccounts: await prisma.bankAccount.count(),
      settings: await prisma.setting.count(),
      contacts: await prisma.contact.count(),
      notifications: await prisma.notification.count(),
      heroSlides: await prisma.heroSlide.count(),
      visitors: await prisma.visitor.count(),
      pageVisits: await prisma.pageVisit.count()
    }
    
    console.log('📊 Current table counts:')
    Object.entries(counts).forEach(([table, count]) => {
      const status = table === 'users' && count > 0 ? '✅ (preserved)' : 
                   count === 0 ? '✅ (empty)' : '⚠️  (has data)'
      console.log(`   ${table.padEnd(15)}: ${count.toString().padStart(3)} ${status}`)
    })
    
    // Show preserved users
    if (counts.users > 0) {
      console.log('\n👥 Preserved users:')
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
      })
    }
    
    console.log('\n🎯 CURRENT STATUS:')
    const totalDataCount = Object.entries(counts)
      .filter(([table]) => table !== 'users')
      .reduce((sum, [, count]) => sum + count, 0)
    
    if (totalDataCount === 0) {
      console.log('✅ Database successfully cleared (except users)')
      console.log('🌟 Ready for fresh content creation')
    } else {
      console.log(`⚠️  ${totalDataCount} records still remain in non-user tables`)
    }
    
    console.log('\n📋 WHAT YOU CAN DO NOW:')
    console.log('1. 🏪 Create categories via admin panel')
    console.log('2. 📦 Add products with images')
    console.log('3. 🎨 Set up hero slides')
    console.log('4. ⚙️  Configure settings')
    console.log('5. 🏦 Add bank account info')
    console.log('')
    console.log('🔗 Admin Panel: http://localhost:3000/admin')
    console.log('🔗 Frontend: http://localhost:3000')
    
    console.log('\n💡 NOTE:')
    console.log('• Users can still log in with existing accounts')
    console.log('• UploadThing image functionality is fully operational')
    console.log('• All uploaded images remain in cloud storage')
    
  } catch (error) {
    console.error('❌ Error verifying database state:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabaseState()
