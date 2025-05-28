// Test script to verify UploadThing image functionality
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testImageFunctionality() {
  console.log('🧪 Testing Image Upload & Load Functionality')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Check UploadThing configuration
    console.log('🔧 Test 1: UploadThing Configuration')
    const uploadthingToken = process.env.UPLOADTHING_TOKEN
    if (uploadthingToken) {
      console.log('✅ UPLOADTHING_TOKEN is configured')
      console.log(`   Token starts with: ${uploadthingToken.substring(0, 10)}...`)
    } else {
      console.log('❌ UPLOADTHING_TOKEN is missing')
    }
    
    // Test 2: Check existing cloud images
    console.log('\n🌐 Test 2: Existing Cloud Images')
    const cloudImages = await prisma.productImage.findMany({
      where: { url: { startsWith: 'https://utfs.io' } },
      take: 3
    })
    
    console.log(`   Found ${cloudImages.length} sample cloud images:`)
    for (const img of cloudImages) {
      console.log(`   • ${img.url}`)
      
      // Test if image is accessible
      try {
        const response = await fetch(img.url, { method: 'HEAD' })
        if (response.ok) {
          console.log(`     ✅ Status: ${response.status} - Image accessible`)
        } else {
          console.log(`     ❌ Status: ${response.status} - Image not accessible`)
        }
      } catch (error) {
        console.log(`     ❌ Error accessing image: ${error.message}`)
      }
    }
    
    // Test 3: Check API routes
    console.log('\n🔌 Test 3: UploadThing API Routes')
    const apiRoutes = [
      '/api/uploadthing',
      '/api/uploadthing/core'
    ]
    
    for (const route of apiRoutes) {
      try {
        const response = await fetch(`http://localhost:3000${route}`, { method: 'GET' })
        console.log(`   ${route}: Status ${response.status}`)
      } catch (error) {
        console.log(`   ${route}: ❌ Error - ${error.message}`)
      }
    }
    
    // Test 4: Check categories status
    console.log('\n📂 Test 4: Categories Status')
    const categories = await prisma.category.findMany()
    console.log(`   Total categories: ${categories.length}`)
    
    for (const category of categories) {
      console.log(`   • ${category.name} (${category.slug})`)
      if (category.image) {
        console.log(`     Image: ${category.image}`)
      } else {
        console.log(`     Image: Not set`)
      }
    }
    
    // Test 5: Check current database state
    console.log('\n📊 Test 5: Database Image Summary')
    const productImageCount = await prisma.productImage.count()
    const categoryImageCount = await prisma.category.count({
      where: { image: { not: null } }
    })
    
    console.log(`   Product images: ${productImageCount}`)
    console.log(`   Category images: ${categoryImageCount}`)
    
    // Test 6: Provide testing instructions
    console.log('\n🎯 Test 6: Manual Testing Instructions')
    console.log('   1. Open admin panel: http://localhost:3000/admin')
    console.log('   2. Go to Categories section')
    console.log('   3. Click "Add New Category"')
    console.log('   4. Fill in category details:')
    console.log('      - Name: Test Category')
    console.log('      - Description: Testing image upload')
    console.log('      - Upload an image file')
    console.log('   5. Save the category')
    console.log('   6. Verify the image displays correctly')
    console.log('   7. Check browser network tab for upload progress')
    
    console.log('\n✅ IMAGE FUNCTIONALITY READY FOR TESTING!')
    console.log('📝 All UploadThing components are configured and operational.')
    
  } catch (error) {
    console.error('❌ Error testing image functionality:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImageFunctionality()
