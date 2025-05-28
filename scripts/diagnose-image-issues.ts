#!/usr/bin/env npx tsx

/**
 * Diagnose Image Display Issues
 * 
 * This script performs comprehensive diagnosis of image display problems
 * by checking database URLs, testing image accessibility, and frontend components
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ImageTestResult {
  url: string
  working: boolean
  status?: number
  error?: string
  contentType?: string
}

// Test if an image URL is accessible and valid
async function testImageUrl(url: string): Promise<ImageTestResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10-second timeout

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageDiagnostic/1.0)',
        'Accept': 'image/*,*/*;q=0.8'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type')
    const isImage = contentType?.startsWith('image/')

    return {
      url,
      working: response.ok && !!isImage,
      status: response.status,
      contentType: contentType || undefined
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      url,
      working: false,
      error: errorMessage
    }
  }
}

// Main diagnostic function
async function diagnoseImageIssues() {
  console.log('🔍 COMPREHENSIVE IMAGE DIAGNOSIS STARTING...\n')
  
  try {
    // Step 1: Database Analysis
    console.log('📊 STEP 1: DATABASE ANALYSIS')
    console.log('='.repeat(50))
    
    const products = await prisma.product.findMany({
      include: { 
        images: true,
        category: true 
      },
      take: 10 // Sample first 10 products for testing
    })
    
    const categories = await prisma.category.findMany()
    
    console.log(`📦 Analyzing ${products.length} products (sample)`)
    console.log(`🏷️ Analyzing ${categories.length} categories`)
    
    // Step 2: Image URL Pattern Analysis
    console.log('\n📈 STEP 2: URL PATTERN ANALYSIS')
    console.log('='.repeat(50))
    
    const productImageUrls: string[] = []
    const categoryImageUrls: string[] = []
    
    // Collect all unique image URLs
    products.forEach(product => {
      product.images.forEach(image => {
        if (image.url && !productImageUrls.includes(image.url)) {
          productImageUrls.push(image.url)
        }
      })
    })
    
    categories.forEach(category => {
      if (category.image && !categoryImageUrls.includes(category.image)) {
        categoryImageUrls.push(category.image)
      }
    })
    
    const allImageUrls = [...productImageUrls, ...categoryImageUrls]
    
    // Categorize URL patterns
    const urlPatterns = {
      local: allImageUrls.filter(url => url.startsWith('/uploads/')),
      uploadthing: allImageUrls.filter(url => url.includes('utfs.io')),
      unsplash: allImageUrls.filter(url => url.includes('unsplash.com')),
      placeholder: allImageUrls.filter(url => url === '/placeholder.jpg'),
      other: allImageUrls.filter(url => 
        !url.startsWith('/uploads/') && 
        !url.includes('utfs.io') && 
        !url.includes('unsplash.com') && 
        url !== '/placeholder.jpg'
      )
    }
    
    console.log('URL Pattern Distribution:')
    console.log(`🔗 Local paths (/uploads/): ${urlPatterns.local.length}`)
    console.log(`☁️ UploadThing (utfs.io): ${urlPatterns.uploadthing.length}`)
    console.log(`🖼️ Unsplash: ${urlPatterns.unsplash.length}`)
    console.log(`📋 Placeholder: ${urlPatterns.placeholder.length}`)
    console.log(`❓ Other: ${urlPatterns.other.length}`)
    
    // Step 3: Image Accessibility Test
    console.log('\n🧪 STEP 3: IMAGE ACCESSIBILITY TEST')
    console.log('='.repeat(50))
    
    const sampleUrls = [
      ...urlPatterns.uploadthing.slice(0, 3),
      ...urlPatterns.unsplash.slice(0, 3),
      ...urlPatterns.other.slice(0, 2)
    ].filter(url => !url.startsWith('/uploads/') && url !== '/placeholder.jpg')
    
    console.log(`Testing ${sampleUrls.length} sample image URLs...`)
    
    const testResults: ImageTestResult[] = []
    
    for (const url of sampleUrls) {
      console.log(`⏳ Testing: ${url.substring(0, 60)}...`)
      const result = await testImageUrl(url)
      testResults.push(result)
      
      if (result.working) {
        console.log(`✅ WORKING: ${url}`)
      } else {
        const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (HTTP ${result.status})` : ''
        console.log(`❌ BROKEN: ${url}${errorInfo}`)
      }
    }
    
    // Step 4: Issue Analysis & Recommendations
    console.log('\n🎯 STEP 4: ISSUE ANALYSIS & RECOMMENDATIONS')
    console.log('='.repeat(50))
    
    const workingImages = testResults.filter(r => r.working).length
    const brokenImages = testResults.filter(r => !r.working).length
    
    console.log(`📊 Test Results: ${workingImages} working, ${brokenImages} broken`)
    
    // Primary Issues
    console.log('\n🚨 IDENTIFIED ISSUES:')
    
    if (urlPatterns.local.length > 0) {
      console.log(`❌ CRITICAL: ${urlPatterns.local.length} images still use local paths (/uploads/)`)
      console.log('   This will cause images to not display on Railway deployment')
      console.log('   Solution: Run migration script to update to cloud URLs')
    }
    
    if (brokenImages > 0) {
      console.log(`❌ WARNING: ${brokenImages} cloud images are not accessible`)
      console.log('   This indicates network issues or invalid URLs')
      console.log('   Solution: Replace broken URLs with working alternatives')
    }
    
    if (urlPatterns.placeholder.length > workingImages) {
      console.log(`⚠️ NOTICE: More placeholder images than working images`)
      console.log('   Solution: Upload actual product images via admin panel')
    }
    
    // Solutions
    console.log('\n💡 RECOMMENDED SOLUTIONS:')
    
    if (urlPatterns.local.length > 0) {
      console.log('1. 🔧 Run image migration script:')
      console.log('   npx tsx scripts/fix-product-images-railway.ts')
    }
    
    if (brokenImages > 0) {
      console.log('2. 🔄 Replace broken URLs with working placeholders:')
      console.log('   npx tsx scripts/fix-images-with-placeholders.ts')
    }
    
    console.log('3. 📤 Upload real product images:')
    console.log('   Use the admin panel to upload actual product photos')
    console.log('   New uploads will automatically use UploadThing cloud storage')
    
    // Step 5: Frontend Component Check
    console.log('\n🔍 STEP 5: FRONTEND COMPONENT RECOMMENDATIONS')
    console.log('='.repeat(50))
    
    console.log('Frontend components to check:')
    console.log('• ProductCard component - getProductImageUrl() function')
    console.log('• ProductImageGallery component - image URL handling')
    console.log('• AdminProductCard component - image display logic')
    console.log('• Check Next.js Image component configuration')
    console.log('• Verify browser console for loading errors')
    
    console.log('\n🎉 DIAGNOSIS COMPLETE!')
    console.log('Review the issues and solutions above to fix image display problems.')
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run diagnosis
diagnoseImageIssues()
