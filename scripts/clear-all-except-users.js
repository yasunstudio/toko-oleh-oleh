// Script to clear all tables except users
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllTablesExceptUsers() {
  console.log('🗑️  Clearing all tables except users...')
  console.log('=' .repeat(60))
  
  try {
    // First, let's check what data we have
    console.log('📊 Current data count:')
    
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
    
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count}`)
    })
    
    console.log('\n🔄 Starting deletion process...\n')
    
    // Delete in correct order to respect foreign key constraints
    
    // 1. Delete page visits first (depends on visitors)
    console.log('🔄 Step 1: Clearing page visits...')
    const pageVisitsDeleted = await prisma.pageVisit.deleteMany({})
    console.log(`   ✅ Deleted ${pageVisitsDeleted.count} page visits`)
    
    // 2. Delete visitors
    console.log('🔄 Step 2: Clearing visitors...')
    const visitorsDeleted = await prisma.visitor.deleteMany({})
    console.log(`   ✅ Deleted ${visitorsDeleted.count} visitors`)
    
    // 3. Delete order items first (depends on orders and products)
    console.log('🔄 Step 3: Clearing order items...')
    const orderItemsDeleted = await prisma.orderItem.deleteMany({})
    console.log(`   ✅ Deleted ${orderItemsDeleted.count} order items`)
    
    // 4. Delete notifications (depends on orders and users)
    console.log('🔄 Step 4: Clearing notifications...')
    const notificationsDeleted = await prisma.notification.deleteMany({})
    console.log(`   ✅ Deleted ${notificationsDeleted.count} notifications`)
    
    // 5. Delete orders (depends on users)
    console.log('🔄 Step 5: Clearing orders...')
    const ordersDeleted = await prisma.order.deleteMany({})
    console.log(`   ✅ Deleted ${ordersDeleted.count} orders`)
    
    // 6. Delete cart items (depends on users and products)
    console.log('🔄 Step 6: Clearing cart items...')
    const cartItemsDeleted = await prisma.cartItem.deleteMany({})
    console.log(`   ✅ Deleted ${cartItemsDeleted.count} cart items`)
    
    // 7. Delete product images (depends on products)
    console.log('🔄 Step 7: Clearing product images...')
    const productImagesDeleted = await prisma.productImage.deleteMany({})
    console.log(`   ✅ Deleted ${productImagesDeleted.count} product images`)
    
    // 8. Delete products (depends on categories)
    console.log('🔄 Step 8: Clearing products...')
    const productsDeleted = await prisma.product.deleteMany({})
    console.log(`   ✅ Deleted ${productsDeleted.count} products`)
    
    // 9. Delete categories
    console.log('🔄 Step 9: Clearing categories...')
    const categoriesDeleted = await prisma.category.deleteMany({})
    console.log(`   ✅ Deleted ${categoriesDeleted.count} categories`)
    
    // 10. Delete hero slides
    console.log('🔄 Step 10: Clearing hero slides...')
    const heroSlidesDeleted = await prisma.heroSlide.deleteMany({})
    console.log(`   ✅ Deleted ${heroSlidesDeleted.count} hero slides`)
    
    // 11. Delete contacts
    console.log('🔄 Step 11: Clearing contacts...')
    const contactsDeleted = await prisma.contact.deleteMany({})
    console.log(`   ✅ Deleted ${contactsDeleted.count} contacts`)
    
    // 12. Delete settings
    console.log('🔄 Step 12: Clearing settings...')
    const settingsDeleted = await prisma.setting.deleteMany({})
    console.log(`   ✅ Deleted ${settingsDeleted.count} settings`)
    
    // 13. Delete bank accounts
    console.log('🔄 Step 13: Clearing bank accounts...')
    const bankAccountsDeleted = await prisma.bankAccount.deleteMany({})
    console.log(`   ✅ Deleted ${bankAccountsDeleted.count} bank accounts`)
    
    console.log('\n📊 Verification - Final count:')
    const finalCounts = {
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
    
    Object.entries(finalCounts).forEach(([table, count]) => {
      if (table === 'users') {
        console.log(`   ${table}: ${count} ✅ (preserved)`)
      } else {
        console.log(`   ${table}: ${count} ${count === 0 ? '✅' : '❌'}`)
      }
    })
    
    console.log('\n🎉 Database cleared successfully!')
    console.log('👥 User accounts have been preserved')
    console.log('🔄 All other data has been removed')
    
    console.log('\n🔗 NEXT STEPS:')
    console.log('1. Users can still log in with existing accounts')
    console.log('2. Admin can create new categories, products, etc.')
    console.log('3. Fresh start for content management')
    console.log('4. All image upload functionality remains intact')
    
  } catch (error) {
    console.error('❌ Error clearing tables:', error)
    console.log('\n💡 If you see foreign key constraint errors:')
    console.log('   This might happen if there are complex relationships')
    console.log('   The script handles most common scenarios')
    console.log('   Some data might remain due to constraints')
  } finally {
    await prisma.$disconnect()
  }
}

clearAllTablesExceptUsers()
