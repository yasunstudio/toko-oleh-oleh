import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProductionDatabase() {
  console.log('🔍 Verifying Railway Production Database...\n')
  
  try {
    // Check database connection
    await prisma.$connect()
    console.log('✅ Database connection successful\n')
    
    // Count all tables
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()
    const orderCount = await prisma.order.count()
    const heroSlideCount = await prisma.heroSlide.count()
    const bankAccountCount = await prisma.bankAccount.count()
    const contactCount = await prisma.contact.count()
    
    console.log('📊 Database Content Summary:')
    console.log(`👤 Users: ${userCount}`)
    console.log(`📦 Products: ${productCount}`)
    console.log(`🏷️ Categories: ${categoryCount}`)
    console.log(`🛍️ Orders: ${orderCount}`)
    console.log(`🎨 Hero Slides: ${heroSlideCount}`)
    console.log(`🏦 Bank Accounts: ${bankAccountCount}`)
    console.log(`📧 Contact Messages: ${contactCount}\n`)
    
    // Check admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log('🔐 Admin User Found:')
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Name: ${adminUser.name}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Created: ${adminUser.createdAt.toDateString()}\n`)
    }
    
    // Check sample products
    const sampleProducts = await prisma.product.findMany({
      take: 3,
      include: {
        category: true
      }
    })
    
    console.log('📦 Sample Products:')
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`)
      console.log(`      Category: ${product.category.name}`)
      console.log(`      Price: Rp ${product.price.toLocaleString()}`)
      console.log(`      Stock: ${product.stock}`)
    })
    
    // Check orders
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })
    
    console.log('\n📈 Order Status Summary:')
    orderStatuses.forEach(status => {
      console.log(`   ${status.status}: ${status._count.id} orders`)
    })
    
    console.log('\n✅ Production database verification completed successfully!')
    console.log('🎯 Database is ready for production use!')
    
  } catch (error) {
    console.error('❌ Database verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProductionDatabase()
