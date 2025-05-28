import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLocalPaths() {
  console.log('🔍 Checking for local paths in database...\n')
  
  try {
    // Check ProductImage table for local paths
    const localProductImages = await prisma.productImage.findMany({
      where: {
        url: { contains: '/uploads/' }
      },
      select: {
        id: true,
        url: true,
        product: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${localProductImages.length} product images with local paths:`)
    localProductImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.product.name}`)
      console.log(`   URL: ${img.url}`)
      console.log('')
    })
    
    // Check Category images for local paths
    const localCategories = await prisma.category.findMany({
      where: {
        image: { contains: '/uploads/' }
      },
      select: {
        id: true,
        name: true,
        image: true
      }
    })
    
    console.log(`\n📊 Found ${localCategories.length} category images with local paths:`)
    localCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`)
      console.log(`   URL: ${cat.image}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLocalPaths()
