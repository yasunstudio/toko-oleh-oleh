import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:LdWAhekKvysVjnCGfqCSZpqFDQAslfcna@nozomi.proxy.rlwy.net:43774/railway"
    }
  }
})

async function checkRailwayData() {
  try {
    console.log('🔍 Checking Railway database data...')
    
    // Check products
    const productCount = await prisma.product.count()
    console.log(`📦 Products count: ${productCount}`)
    
    if (productCount > 0) {
      const products = await prisma.product.findMany({
        take: 3,
        include: {
          images: true,
          category: true
        }
      })
      
      console.log('\n🛍️ Sample products:')
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   Price: Rp${product.price}`)
        console.log(`   Category: ${product.category?.name || 'No category'}`)
        console.log(`   Images: ${product.images.length}`)
        if (product.images.length > 0) {
          console.log(`   First image: ${product.images[0].url}`)
        }
        console.log('')
      })
    }
    
    // Check categories
    const categoryCount = await prisma.category.count()
    console.log(`📂 Categories count: ${categoryCount}`)
    
    // Check users
    const userCount = await prisma.user.count()
    console.log(`👥 Users count: ${userCount}`)
    
    // Check orders
    const orderCount = await prisma.order.count()
    console.log(`🛒 Orders count: ${orderCount}`)
    
    console.log('\n✅ Railway database check complete!')
    
  } catch (error) {
    console.error('❌ Error checking Railway database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRailwayData()
