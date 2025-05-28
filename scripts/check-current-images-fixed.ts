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
    const productsWithLocalImages: typeof products = []
    const productsWithCloudImages: typeof products = []
    const productsWithoutImages: typeof products = []
    
    products.forEach(product => {
      if (product.images.length === 0) {
        productsWithoutImages.push(product)
      } else {
        const hasLocalImages = product.images.some(img => 
          img.url.startsWith('/uploads/') || img.url.startsWith('uploads/')
        )
        const hasCloudImages = product.images.some(img => 
          img.url.startsWith('http')
        )
        
        if (hasLocalImages) {
          productsWithLocalImages.push(product)
        } else if (hasCloudImages) {
          productsWithCloudImages.push(product)
        }
      }
    })
    
    // Results
    console.log('📊 IMAGE URL ANALYSIS:')
    console.log(`✅ Products with cloud images: ${productsWithCloudImages.length}`)
    console.log(`❌ Products with local images (broken on Railway): ${productsWithLocalImages.length}`)
    console.log(`⚠️  Products without images: ${productsWithoutImages.length}\n`)
    
    if (productsWithLocalImages.length > 0) {
      console.log('❌ PRODUCTS WITH LOCAL IMAGE PATHS (need fixing):')
      productsWithLocalImages.forEach(product => {
        console.log(`   - ID: ${product.id}, Name: ${product.name}`)
        product.images.forEach(img => {
          console.log(`     Image: ${img.url}`)
        })
      })
      console.log('')
    }
    
    if (productsWithoutImages.length > 0) {
      console.log('⚠️  PRODUCTS WITHOUT IMAGES:')
      productsWithoutImages.forEach(product => {
        console.log(`   - ID: ${product.id}, Name: ${product.name}`)
      })
      console.log('')
    }
    
    if (productsWithCloudImages.length > 0) {
      console.log('✅ PRODUCTS WITH CLOUD IMAGES (should be working):')
      productsWithCloudImages.slice(0, 3).forEach(product => {
        console.log(`   - ID: ${product.id}, Name: ${product.name}`)
        product.images.slice(0, 1).forEach(img => {
          console.log(`     Image: ${img.url}`)
        })
      })
      if (productsWithCloudImages.length > 3) {
        console.log(`   ... and ${productsWithCloudImages.length - 3} more`)
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
    
    const cloudCategoryImages = categories.filter(cat => 
      cat.image && cat.image.startsWith('http')
    )
    
    console.log(`📂 Categories analysis:`)
    console.log(`   - With cloud images: ${cloudCategoryImages.length}`)
    console.log(`   - With local images (broken): ${localCategoryImages.length}`)
    
    if (localCategoryImages.length > 0) {
      console.log('\n❌ CATEGORIES WITH LOCAL IMAGES:')
      localCategoryImages.forEach(cat => {
        console.log(`   - ID: ${cat.id}, Name: ${cat.name}, Image: ${cat.image}`)
      })
    }
    
    // Summary and recommendations
    console.log('\n🎯 SUMMARY:')
    const totalLocalImages = productsWithLocalImages.length + localCategoryImages.length
    if (totalLocalImages > 0) {
      console.log(`❌ PROBLEM FOUND: ${totalLocalImages} items still using local paths`)
      console.log('🔧 SOLUTION: Need to run image migration script to fix these')
      console.log('📝 ACTION REQUIRED: Run fix-product-images-railway script')
    } else {
      console.log('✅ ALL IMAGES USING CLOUD URLS - Should be working on Railway!')
      console.log('🔍 If images still not showing, check:')
      console.log('   1. Image component implementation in frontend')
      console.log('   2. Network/CORS issues')
      console.log('   3. Image URL validity')
    }
    
  } catch (error) {
    console.error('❌ Error checking images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductImages()
