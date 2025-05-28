/**
 * Fix Product Images with Working Placeholder URLs
 * 
 * This script replaces all local /uploads/ paths with working placeholder images
 * until we can properly upload the actual images to UploadThing
 */

import { PrismaClient } from '@prisma/client'

// Use Railway database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Working placeholder image URLs - using Unsplash for Indonesian food images
const FOOD_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80', // Indonesian food
  'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500&q=80', // Spices
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80', // Traditional food
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80', // Food dish
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80', // Asian cuisine
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80', // Traditional snacks
  'https://images.unsplash.com/photo-1563379091339-03246962d51a?w=500&q=80', // Spicy food
  'https://images.unsplash.com/photo-1512838243191-5742b53b1c3e?w=500&q=80', // Drinks
]

// Category placeholder images
const CATEGORY_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80', // General food
  'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80', // Spices category
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', // Snacks category
  'https://images.unsplash.com/photo-1512838243191-5742b53b1c3e?w=400&q=80', // Drinks category
]

async function testImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && response.headers.get('content-type')?.startsWith('image/') === true
  } catch {
    return false
  }
}

async function fixImagesWithPlaceholders() {
  try {
    console.log('🔧 Fixing product images with working placeholder URLs...')
    console.log('🌐 Using Railway database connection')
    
    // Test database connection
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')

    let fixedCount = 0
    let imageIndex = 0

    // Check product images
    const products = await prisma.product.findMany({
      include: { images: true }
    })
    
    console.log(`📦 Found ${products.length} products to check`)

    for (const product of products) {
      console.log(`\n🔍 Checking product: ${product.name}`)
      
      for (const image of product.images) {
        if (image.url.startsWith('/uploads/') || !image.url.startsWith('http')) {
          // Replace with a working placeholder URL
          const placeholderUrl = FOOD_PLACEHOLDER_IMAGES[imageIndex % FOOD_PLACEHOLDER_IMAGES.length]
          
          // Test if the placeholder URL works
          console.log(`  🧪 Testing placeholder URL...`)
          const isWorking = await testImageUrl(placeholderUrl)
          
          if (isWorking) {
            await prisma.productImage.update({
              where: { id: image.id },
              data: { url: placeholderUrl }
            })
            
            console.log(`  ✅ Fixed: ${image.url} → ${placeholderUrl}`)
            fixedCount++
          } else {
            console.log(`  ❌ Placeholder URL not working: ${placeholderUrl}`)
          }
          
          imageIndex++
        } else if (image.url.startsWith('https://')) {
          // Test existing cloud URL
          const isWorking = await testImageUrl(image.url)
          if (isWorking) {
            console.log(`  ✅ Already working: ${image.url.substring(0, 50)}...`)
          } else {
            console.log(`  ⚠️  Cloud URL not working: ${image.url.substring(0, 50)}...`)
            // Replace with working placeholder
            const placeholderUrl = FOOD_PLACEHOLDER_IMAGES[imageIndex % FOOD_PLACEHOLDER_IMAGES.length]
            const placeholderWorking = await testImageUrl(placeholderUrl)
            
            if (placeholderWorking) {
              await prisma.productImage.update({
                where: { id: image.id },
                data: { url: placeholderUrl }
              })
              console.log(`  🔄 Replaced with placeholder: ${placeholderUrl}`)
              fixedCount++
            }
            imageIndex++
          }
        } else {
          console.log(`  ⚠️  Unknown URL format: ${image.url}`)
        }
      }
    }

    // Check category images
    console.log(`\n📂 Checking category images...`)
    const categories = await prisma.category.findMany()
    
    for (const category of categories) {
      if (category.image && (category.image.startsWith('/uploads/') || !category.image.startsWith('http'))) {
        // Replace with a working placeholder URL
        const placeholderUrl = CATEGORY_PLACEHOLDER_IMAGES[imageIndex % CATEGORY_PLACEHOLDER_IMAGES.length]
        
        const isWorking = await testImageUrl(placeholderUrl)
        
        if (isWorking) {
          await prisma.category.update({
            where: { id: category.id },
            data: { image: placeholderUrl }
          })
          
          console.log(`  ✅ Fixed category ${category.name}: ${category.image} → ${placeholderUrl}`)
          fixedCount++
        } else {
          console.log(`  ❌ Category placeholder not working: ${placeholderUrl}`)
        }
        
        imageIndex++
      } else if (category.image && category.image.startsWith('https://')) {
        // Test existing cloud URL
        const isWorking = await testImageUrl(category.image)
        if (isWorking) {
          console.log(`  ✅ Category ${category.name} already working`)
        } else {
          console.log(`  ⚠️  Category ${category.name} URL not working`)
          // Replace with working placeholder
          const placeholderUrl = CATEGORY_PLACEHOLDER_IMAGES[imageIndex % CATEGORY_PLACEHOLDER_IMAGES.length]
          const placeholderWorking = await testImageUrl(placeholderUrl)
          
          if (placeholderWorking) {
            await prisma.category.update({
              where: { id: category.id },
              data: { image: placeholderUrl }
            })
            console.log(`  🔄 Category replaced with placeholder: ${placeholderUrl}`)
            fixedCount++
          }
          imageIndex++
        }
      }
    }

    console.log(`\n🎉 IMAGE FIX COMPLETE!`)
    console.log(`📊 Total images fixed: ${fixedCount}`)
    console.log(`✅ All images should now display with working placeholder URLs`)
    console.log(`🚀 Product images should now display correctly on Railway`)
    console.log(`\n📝 Next steps:`)
    console.log(`   1. Visit the Railway application to verify images are working`)
    console.log(`   2. Later, upload actual product images through the admin panel`)
    console.log(`   3. The admin upload will automatically use UploadThing cloud storage`)

  } catch (error) {
    console.error('❌ Error fixing product images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixImagesWithPlaceholders()
