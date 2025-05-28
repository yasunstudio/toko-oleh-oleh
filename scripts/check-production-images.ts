import { PrismaClient } from '@prisma/client'

// Production database connection using Railway URLs
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL
    }
  }
})

async function checkProductionImages() {
  console.log('🔍 Checking production database images...\n')
  
  try {
    // Check products with images
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true
      },
      take: 10 // Limit to first 10 for testing
    })

    console.log(`📦 Found ${products.length} products in production database\n`)

    let cloudCount = 0
    let localCount = 0

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Category: ${product.category?.name || 'None'}`)
      console.log(`   Images: ${product.images.length}`)
      
      if (product.images.length > 0) {
        product.images.forEach((image, imgIndex) => {
          if (image.url.startsWith('https://utfs.io') || image.url.startsWith('https://uploadthing')) {
            cloudCount++
            console.log(`   📸 Image ${imgIndex + 1}: ✅ Cloud URL - ${image.url}`)
          } else {
            localCount++
            console.log(`   📸 Image ${imgIndex + 1}: ❌ Local URL - ${image.url}`)
          }
        })
      } else {
        console.log('   📸 No images found')
      }
      console.log('')
    })

    console.log('📊 SUMMARY:')
    console.log(`✅ Cloud images: ${cloudCount}`)
    console.log(`❌ Local images: ${localCount}`)
    console.log(`📈 Total images: ${cloudCount + localCount}`)
    
    if (localCount > 0) {
      console.log('\n⚠️  WARNING: Found local image paths in production database!')
      console.log('   These images will not display on Railway.')
    } else {
      console.log('\n🎉 All images are using cloud URLs!')
    }

  } catch (error) {
    console.error('❌ Error checking production images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionImages()
