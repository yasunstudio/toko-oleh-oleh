#!/usr/bin/env tsx

/**
 * Remove Unsplash Images and Replace with UploadThing Placeholders
 * 
 * This script removes all Unsplash URLs from the database and replaces them
 * with default UploadThing placeholder URLs or removes them completely.
 * Focus only on UploadThing for image storage.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default UploadThing placeholder image (you can upload a generic placeholder to UploadThing)
const DEFAULT_UPLOADTHING_PLACEHOLDER = '/placeholder.jpg'

async function removeUnsplashImages() {
  console.log('🧹 Removing all Unsplash images from database...\n')

  try {
    // Step 1: Remove Unsplash URLs from ProductImage table
    console.log('📸 Processing product images...')
    const productImages = await prisma.productImage.findMany({
      where: {
        url: {
          contains: 'unsplash.com'
        }
      },
      include: {
        product: true
      }
    })

    console.log(`Found ${productImages.length} product images using Unsplash`)

    for (const image of productImages) {
      console.log(`  🗑️  Removing Unsplash image from product: ${image.product.name}`)
      
      // Option 1: Delete the image record completely
      await prisma.productImage.delete({
        where: { id: image.id }
      })
      
      // Option 2: Replace with placeholder (uncomment if you prefer this approach)
      // await prisma.productImage.update({
      //   where: { id: image.id },
      //   data: { url: DEFAULT_UPLOADTHING_PLACEHOLDER }
      // })
    }

    // Step 2: Remove Unsplash URLs from Category table
    console.log('\n📁 Processing category images...')
    const categories = await prisma.category.findMany({
      where: {
        image: {
          contains: 'unsplash.com'
        }
      }
    })

    console.log(`Found ${categories.length} categories using Unsplash`)

    for (const category of categories) {
      console.log(`  🗑️  Removing Unsplash image from category: ${category.name}`)
      
      await prisma.category.update({
        where: { id: category.id },
        data: { image: null } // Remove image completely
      })
    }

    // Step 3: Report remaining images
    console.log('\n📊 Checking remaining images...')
    
    const remainingProductImages = await prisma.productImage.count()
    const remainingCategoryImages = await prisma.category.count({
      where: {
        image: {
          not: null
        }
      }
    })

    console.log(`📸 Remaining product images: ${remainingProductImages}`)
    console.log(`📁 Remaining category images: ${remainingCategoryImages}`)

    // Step 4: Show UploadThing images
    const uploadthingImages = await prisma.productImage.findMany({
      where: {
        url: {
          contains: 'utfs.io'
        }
      },
      include: {
        product: true
      }
    })

    console.log(`☁️  UploadThing images: ${uploadthingImages.length}`)
    
    if (uploadthingImages.length > 0) {
      console.log('\n✅ UploadThing images found:')
      uploadthingImages.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.product.name}: ${img.url.substring(0, 50)}...`)
      })
    }

    console.log('\n🎉 CLEANUP COMPLETE!')
    console.log('✅ All Unsplash references removed')
    console.log('🎯 Project now focuses only on UploadThing for image storage')
    console.log('\n📝 Next steps:')
    console.log('   1. Upload new images via admin panel (they will use UploadThing)')
    console.log('   2. Images will automatically get utfs.io URLs')
    console.log('   3. No more 404 errors from external Unsplash URLs')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
removeUnsplashImages()
