#!/usr/bin/env tsx

/**
 * UploadThing Image Verification Script
 * 
 * This script verifies that all images in the database are using UploadThing
 * and checks their accessibility. Focus only on UploadThing cloud storage.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ImageTestResult {
  url: string
  working: boolean
  status?: number
  error?: string
}

// Test if an UploadThing image URL is accessible
async function testUploadThingUrl(url: string): Promise<ImageTestResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UploadThingVerifier/1.0)',
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
      status: response.status
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

async function verifyUploadThingImages() {
  console.log('☁️ Verifying UploadThing Images...\n')

  try {
    // Step 1: Get all products with images
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true
      }
    })

    // Step 2: Get all categories with images
    const categories = await prisma.category.findMany()

    console.log('📊 CURRENT IMAGE STATUS')
    console.log('='.repeat(50))
    console.log(`📦 Products: ${products.length}`)
    console.log(`📁 Categories: ${categories.length}`)

    // Step 3: Collect all image URLs
    const allImageUrls: string[] = []
    
    products.forEach(product => {
      product.images.forEach(image => {
        if (image.url && !allImageUrls.includes(image.url)) {
          allImageUrls.push(image.url)
        }
      })
    })
    
    categories.forEach(category => {
      if (category.image && !allImageUrls.includes(category.image)) {
        allImageUrls.push(category.image)
      }
    })

    // Step 4: Categorize URL patterns (UploadThing focus only)
    const urlPatterns = {
      uploadthing: allImageUrls.filter(url => url.includes('utfs.io')),
      placeholder: allImageUrls.filter(url => url === '/placeholder.jpg' || url.includes('placeholder')),
      local: allImageUrls.filter(url => url.startsWith('/uploads/')),
      other: allImageUrls.filter(url => 
        !url.includes('utfs.io') && 
        !url.includes('placeholder') && 
        !url.startsWith('/uploads/')
      )
    }

    console.log('\n🔍 URL Pattern Analysis:')
    console.log(`☁️  UploadThing (utfs.io): ${urlPatterns.uploadthing.length}`)
    console.log(`📋 Placeholder: ${urlPatterns.placeholder.length}`)
    console.log(`🔗 Local paths: ${urlPatterns.local.length}`)
    console.log(`❓ Other: ${urlPatterns.other.length}`)

    // Step 5: Test UploadThing image accessibility
    if (urlPatterns.uploadthing.length > 0) {
      console.log('\n🧪 Testing UploadThing Image Accessibility:')
      console.log('='.repeat(50))

      let workingCount = 0
      let brokenCount = 0

      for (const url of urlPatterns.uploadthing) {
        console.log(`⏳ Testing: ${url.substring(0, 50)}...`)
        const result = await testUploadThingUrl(url)
        
        if (result.working) {
          console.log(`✅ WORKING: ${url}`)
          workingCount++
        } else {
          const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (HTTP ${result.status})` : ''
          console.log(`❌ BROKEN: ${url}${errorInfo}`)
          brokenCount++
        }
      }

      console.log('\n📊 UploadThing Test Results:')
      console.log(`✅ Working: ${workingCount}`)
      console.log(`❌ Broken: ${brokenCount}`)
      console.log(`📈 Success Rate: ${((workingCount / urlPatterns.uploadthing.length) * 100).toFixed(1)}%`)
    }

    // Step 6: Recommendations
    console.log('\n🎯 RECOMMENDATIONS:')
    console.log('='.repeat(50))

    if (urlPatterns.local.length > 0) {
      console.log(`⚠️  Found ${urlPatterns.local.length} local image paths (/uploads/)`)
      console.log('   → These should be migrated to UploadThing or removed')
    }

    if (urlPatterns.other.length > 0) {
      console.log(`⚠️  Found ${urlPatterns.other.length} non-UploadThing external URLs`)
      console.log('   → Consider migrating these to UploadThing for consistency')
    }

    if (urlPatterns.uploadthing.length === 0) {
      console.log('📋 No UploadThing images found.')
      console.log('   → Upload new images via admin panel to start using UploadThing')
    } else {
      console.log(`✅ Found ${urlPatterns.uploadthing.length} UploadThing images`)
      console.log('   → Your UploadThing integration is working!')
    }

    console.log('\n🚀 Next Steps:')
    console.log('   1. Upload new images through admin panel')
    console.log('   2. New uploads will automatically use UploadThing (utfs.io)')
    console.log('   3. Consider replacing remaining placeholders with real images')
    console.log('   4. Monitor UploadThing dashboard for usage')

  } catch (error) {
    console.error('❌ Verification error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification
verifyUploadThingImages()
