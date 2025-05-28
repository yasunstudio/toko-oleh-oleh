import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Checking Database Connection and Data...')
  
  try {
    // Test basic connection
    const result = await db.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')
    
    // Count records in each table
    const productCount = await db.product.count()
    const categoryCount = await db.category.count()
    const imageCount = await db.productImage.count()
    
    console.log(`\n📊 Database Statistics:`)
    console.log(`- Products: ${productCount}`)
    console.log(`- Categories: ${categoryCount}`)
    console.log(`- Product Images: ${imageCount}`)
    
    if (productCount > 0) {
      console.log('\n🔍 Sample Product Data:')
      const sampleProduct = await db.product.findFirst({
        include: {
          images: true,
          category: true
        }
      })
      
      if (sampleProduct) {
        console.log(`Sample Product: ${sampleProduct.name}`)
        console.log(`Images count: ${sampleProduct.images?.length || 0}`)
        if (sampleProduct.images && sampleProduct.images.length > 0) {
          console.log(`First image URL: ${sampleProduct.images[0].url}`)
        }
      }
    } else {
      console.log('⚠️ No products found in database!')
    }
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkDatabase().then(() => {
  console.log('\n✅ Database check complete!')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Check failed:', error)
  process.exit(1)
})
