// Script to clear Railway production database (except users)
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearRailwayDatabase() {
  console.log('🚂 Clearing Railway Production Database...')
  console.log('=' .repeat(60))
  
  try {
    // Check if we're in production environment
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT
    console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION (Railway)' : 'DEVELOPMENT'}`)
    
    if (!isProduction) {
      console.log('⚠️  WARNING: This script is intended for Railway production deployment')
      console.log('   Running in development mode...')
    }
    
    // Check current data count
    console.log('\n📊 Current production data count:')
    
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
    
    // Confirm before proceeding in production
    if (isProduction) {
      console.log('\n⚠️  PRODUCTION DATABASE CLEARING')
      console.log('   This will remove all data except user accounts!')
      console.log('   Proceeding in 5 seconds...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    
    console.log('\n🔄 Starting deletion process...\n')
    
    // Delete in correct order to respect foreign key constraints
    
    // 1. Delete page visits first
    console.log('🔄 Step 1: Clearing page visits...')
    const pageVisitsDeleted = await prisma.pageVisit.deleteMany({})
    console.log(`   ✅ Deleted ${pageVisitsDeleted.count} page visits`)
    
    // 2. Delete visitors
    console.log('🔄 Step 2: Clearing visitors...')
    const visitorsDeleted = await prisma.visitor.deleteMany({})
    console.log(`   ✅ Deleted ${visitorsDeleted.count} visitors`)
    
    // 3. Delete order items
    console.log('🔄 Step 3: Clearing order items...')
    const orderItemsDeleted = await prisma.orderItem.deleteMany({})
    console.log(`   ✅ Deleted ${orderItemsDeleted.count} order items`)
    
    // 4. Delete notifications
    console.log('🔄 Step 4: Clearing notifications...')
    const notificationsDeleted = await prisma.notification.deleteMany({})
    console.log(`   ✅ Deleted ${notificationsDeleted.count} notifications`)
    
    // 5. Delete orders
    console.log('🔄 Step 5: Clearing orders...')
    const ordersDeleted = await prisma.order.deleteMany({})
    console.log(`   ✅ Deleted ${ordersDeleted.count} orders`)
    
    // 6. Delete cart items
    console.log('🔄 Step 6: Clearing cart items...')
    const cartItemsDeleted = await prisma.cartItem.deleteMany({})
    console.log(`   ✅ Deleted ${cartItemsDeleted.count} cart items`)
    
    // 7. Delete product images
    console.log('🔄 Step 7: Clearing product images...')
    const productImagesDeleted = await prisma.productImage.deleteMany({})
    console.log(`   ✅ Deleted ${productImagesDeleted.count} product images`)
    
    // 8. Delete products
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
    
    console.log('\n📊 Final verification:')
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
    
    console.log('\n🎉 Railway database cleared successfully!')
    console.log('👥 User accounts preserved for production access')
    console.log('🌐 UploadThing cloud images remain accessible')
    console.log('🚀 Ready for fresh content in production')
    
  } catch (error) {
    console.error('❌ Error clearing Railway database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearRailwayDatabase()
