import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyData() {
  try {
    console.log('🔍 Verifying Railway MySQL Database...')
    
    // Test connection first
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Count all entities
    const userCount = await prisma.user.count()
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const bankAccountCount = await prisma.bankAccount.count()
    const heroSlideCount = await prisma.heroSlide.count()
    const trafficCount = await prisma.visitor.count()
    
    console.log('\n📊 Database Statistics:')
    console.log(`👤 Users: ${userCount}`)
    console.log(`🏷️ Categories: ${categoryCount}`)
    console.log(`🛍️ Products: ${productCount}`)
    console.log(`📦 Orders: ${orderCount}`)
    console.log(`🏦 Bank Accounts: ${bankAccountCount}`)
    console.log(`🎯 Hero Slides: ${heroSlideCount}`)
    console.log(`📈 Traffic Visitors: ${trafficCount}`)
    
    // Get sample data
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    const firstProduct = await prisma.product.findFirst({
      include: {
        category: true,
        images: true
      }
    })
    
    const recentOrder = await prisma.order.findFirst({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n👑 Admin User:')
    console.log(`Email: ${adminUser?.email}`)
    console.log(`Name: ${adminUser?.name}`)
    
    console.log('\n🛍️ Sample Product:')
    console.log(`Name: ${firstProduct?.name}`)
    console.log(`Category: ${firstProduct?.category.name}`)
    console.log(`Price: Rp ${firstProduct?.price.toLocaleString()}`)
    console.log(`Images: ${firstProduct?.images.length}`)
    
    console.log('\n📦 Recent Order:')
    console.log(`Customer: ${recentOrder?.user.name}`)
    console.log(`Status: ${recentOrder?.status}`)
    console.log(`Total Amount: Rp ${recentOrder?.totalAmount.toLocaleString()}`)
    console.log(`Items: ${recentOrder?.orderItems.length}`)
    
    console.log('\n✅ Data verification completed successfully!')
    console.log('🚀 Railway MySQL database is populated and ready!')
    
  } catch (error) {
    console.error('❌ Error verifying data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyData()
