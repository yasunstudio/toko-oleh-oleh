#!/usr/bin/env npx tsx

/**
 * Check current product images in production database
 * Verify if images are using cloud URLs or still local paths
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductImages() {
  try {
    console.log('🔍 Checking current product images in production database...\n')
    
    // Get all products with their images
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          select: {
            id: true,
            url: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })
    
    console.log(`📦 Found ${products.length} products\n`)
    
    // Analyze image URLs
    const localImages: any[] = []
    const cloudImages: any[] = []
    const brokenImages: any[] = []
    
    products.forEach(product => {
      if (!product.image) {
        brokenImages.push(product)
      } else if (product.image.startsWith('/uploads/') || product.image.startsWith('uploads/')) {
        localImages.push(product)
      } else if (product.image.startsWith('http')) {
        cloudImages.push(product)
      } else {
        brokenImages.push(product)
      }
    })
    
    // Results
    console.log('📊 IMAGE URL ANALYSIS:')
    console.log(`✅ Cloud images (working): ${cloudImages.length}`)
    console.log(`❌ Local images (broken on Railway): ${localImages.length}`)
    console.log(`⚠️  Broken/missing images: ${brokenImages.length}\n`)
    
    if (localImages.length > 0) {
      console.log('❌ PRODUCTS WITH LOCAL IMAGE PATHS (need fixing):')
      localImages.forEach(product => {
        console.log(`   - ID: ${product.id}, Name: ${product.name}`)
        console.log(`     Image: ${product.image}`)
      })
      console.log('')
    }
    
    if (brokenImages.length > 0) {
      console.log('⚠️  PRODUCTS WITH BROKEN/MISSING IMAGES:')
      brokenImages.forEach(product => {
        console.log(`   - ID: ${product.id}, Name: ${product.name}`)
        console.log(`     Image: ${product.image || 'NULL'}`)
      })
      console.log('')
    }
    
    if (cloudImages.length > 0) {
      console.log('✅ PRODUCTS WITH CLOUD IMAGES (working):')
      cloudImages.slice(0, 5).forEach(product => {
        console.log(`   - ID: ${product.id}, Name: ${product.name}`)
        console.log(`     Image: ${product.image}`)
      })
      if (cloudImages.length > 5) {
        console.log(`   ... and ${cloudImages.length - 5} more`)
      }
      console.log('')
    }
    
    // Check categories too
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true
      }
    })
    
    const localCategoryImages = categories.filter(cat => 
      cat.image && (cat.image.startsWith('/uploads/') || cat.image.startsWith('uploads/'))
    )
    
    console.log(`📂 Categories with local images (broken): ${localCategoryImages.length}`)
    if (localCategoryImages.length > 0) {
      localCategoryImages.forEach(cat => {
        console.log(`   - ID: ${cat.id}, Name: ${cat.name}, Image: ${cat.image}`)
      })
    }
    
    // Summary and recommendations
    console.log('\n🎯 SUMMARY:')
    if (localImages.length > 0 || localCategoryImages.length > 0) {
      console.log(`❌ PROBLEM FOUND: ${localImages.length + localCategoryImages.length} images still using local paths`)
      console.log('🔧 SOLUTION: Need to run image migration script to fix these')
      console.log('📝 ACTION REQUIRED: Run fix-product-images-railway script')
    } else {
      console.log('✅ ALL IMAGES USING CLOUD URLS - Should be working on Railway!')
      console.log('🔍 If images still not showing, check:')
      console.log('   1. UploadThing configuration')
      console.log('   2. CORS settings')
      console.log('   3. Image component implementation')
    }
    
  } catch (error) {
    console.error('❌ Error checking images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductImages()
