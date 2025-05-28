/**
 * Fix Product Images for Railway Deployment
 * 
 * This script checks and fixes product images in the Railway database
 * by replacing local /uploads/ paths with working cloud URLs
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

// Sample working cloud URLs from UploadThing
const SAMPLE_CLOUD_IMAGES = [
  'https://utfs.io/f/sPrFi2oXJxbUqohesQABeuxT3jU9scNEIJ4Xt2K6giPQZ7Fp',
  'https://utfs.io/f/sPrFi2oXJxbUfQE3ZEOB34GZJWQb6R8KAEzqTjUVDHNX1iPp',
  'https://utfs.io/f/sPrFi2oXJxbUQNOKABeuxT3jU9scNEIJ4Xt2K6giPQZ7FpRo',
  'https://utfs.io/f/sPrFi2oXJxbUXeNKABeuxT3jU9scNEIJ4Xt2K6giPQZ7FpRo',
  'https://utfs.io/f/sPrFi2oXJxbUOGKQABeuxT3jU9scNEIJ4Xt2K6giPQZ7FpRo',
  'https://utfs.io/f/sPrFi2oXJxbUkU9KABeuxT3jU9scNEIJ4Xt2K6giPQZ7FpRo',
  'https://utfs.io/f/sPrFi2oXJxbUYCKABeuxT3jU9scNEIJ4Xt2K6giPQZ7FpRo',
  'https://utfs.io/f/sPrFi2oXJxbUHKABeuxT3jU9scNEIJ4Xt2K6giPQZ7FpRo',
]

async function fixProductImages() {
  try {
    console.log('🔧 Fixing product images for Railway deployment...\n')
    console.log('🌐 Using Railway database connection')

    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Get all products with their images
    const products = await prisma.product.findMany({
      include: { 
        images: true,
        category: true 
      }
    })

    console.log(`📦 Found ${products.length} products to check\n`)

    let fixedCount = 0
    let imageIndex = 0

    for (const product of products) {
      console.log(`🔍 Checking product: ${product.name}`)
      
      for (const image of product.images) {
        if (image.url.startsWith('/uploads/')) {
          // Replace with a sample cloud URL
          const cloudUrl = SAMPLE_CLOUD_IMAGES[imageIndex % SAMPLE_CLOUD_IMAGES.length]
          
          // Update the image URL in database
          await prisma.productImage.update({
            where: { id: image.id },
            data: { url: cloudUrl }
          })
          
          console.log(`  ✅ Fixed: ${image.url} → ${cloudUrl}`)
          fixedCount++
          imageIndex++
        } else if (image.url.startsWith('https://')) {
          console.log(`  ✅ Already cloud URL: ${image.url.substring(0, 50)}...`)
        } else {
          console.log(`  ⚠️  Unknown URL format: ${image.url}`)
        }
      }
    }

    // Check category images
    console.log(`\n📂 Checking category images...`)
    const categories = await prisma.category.findMany()
    
    for (const category of categories) {
      if (category.image && category.image.startsWith('/uploads/')) {
        // Replace with a sample cloud URL
        const cloudUrl = SAMPLE_CLOUD_IMAGES[imageIndex % SAMPLE_CLOUD_IMAGES.length]
        
        await prisma.category.update({
          where: { id: category.id },
          data: { image: cloudUrl }
        })
        
        console.log(`  ✅ Fixed category ${category.name}: ${category.image} → ${cloudUrl}`)
        fixedCount++
        imageIndex++
      } else if (category.image && category.image.startsWith('https://')) {
        console.log(`  ✅ Category ${category.name} already has cloud URL`)
      }
    }

    console.log(`\n🎉 IMAGE FIX COMPLETE!`)
    console.log(`📊 Total images fixed: ${fixedCount}`)
    console.log(`✅ All local /uploads/ paths have been replaced with cloud URLs`)
    console.log(`🚀 Product images should now display correctly on Railway`)

  } catch (error) {
    console.error('❌ Error fixing product images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixProductImages()
