import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImageStatus() {
  console.log('🔍 Checking image status in database...\n')
  
  try {
    // Check ProductImage table
    const productImages = await prisma.productImage.findMany({
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
    
    console.log(`📊 Found ${productImages.length} product images:`)
    productImages.forEach((img, index) => {
      const isLocal = img.url.startsWith('/uploads/')
      const isCloud = img.url.includes('utfs.io')
      console.log(`${index + 1}. ${img.product.name}`)
      console.log(`   URL: ${img.url}`)
      console.log(`   Status: ${isLocal ? '🔴 LOCAL' : isCloud ? '🟢 CLOUD' : '❓ UNKNOWN'}`)
      console.log('')
    })
    
    // Check Category images
    const categories = await prisma.category.findMany({
      where: {
        image: { not: null }
      },
      select: {
        id: true,
        name: true,
        image: true
      }
    })
    
    console.log(`\n📊 Found ${categories.length} category images:`)
    categories.forEach((cat, index) => {
      const isLocal = cat.image?.startsWith('/uploads/')
      const isCloud = cat.image?.includes('utfs.io')
      console.log(`${index + 1}. ${cat.name}`)
      console.log(`   URL: ${cat.image}`)
      console.log(`   Status: ${isLocal ? '🔴 LOCAL' : isCloud ? '🟢 CLOUD' : '❓ UNKNOWN'}`)
      console.log('')
    })
    
    // Check HeroSlide images
    const heroSlides = await prisma.heroSlide.findMany({
      where: {
        backgroundImage: { not: null }
      },
      select: {
        id: true,
        title: true,
        backgroundImage: true
      }
    })
    
    console.log(`\n📊 Found ${heroSlides.length} hero slide images:`)
    heroSlides.forEach((hero, index) => {
      const isLocal = hero.backgroundImage?.startsWith('/uploads/')
      const isCloud = hero.backgroundImage?.includes('utfs.io')
      console.log(`${index + 1}. ${hero.title}`)
      console.log(`   URL: ${hero.backgroundImage}`)
      console.log(`   Status: ${isLocal ? '🔴 LOCAL' : isCloud ? '🟢 CLOUD' : '❓ UNKNOWN'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkImageStatus()
