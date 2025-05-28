#!/usr/bin/env tsx

/**
 * Fix Production Images - Replace local paths with working cloud URLs
 * Script untuk memperbaiki gambar di production Railway
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Working image URLs from previous successful deployment
const WORKING_IMAGES = {
  // Product Images
  'sambal-roa.jpg': 'https://images.unsplash.com/photo-1534621893-1f17e8356ca8?w=400&h=300&fit=crop&auto=format',
  'sambal-matah.jpg': 'https://images.unsplash.com/photo-1598511757522-bf2684716b38?w=400&h=300&fit=crop&auto=format',
  'gula-aren.jpg': 'https://images.unsplash.com/photo-1571167681781-8d5b3c41223c?w=400&h=300&fit=crop&auto=format',
  'gula-kelapa.jpg': 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&h=300&fit=crop&auto=format',
  'kemiri-bakar.jpg': 'https://images.unsplash.com/photo-1583079912273-8b2e91d5b5dd?w=400&h=300&fit=crop&auto=format',
  'bumbu-gudeg.jpg': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&auto=format',
  'bumbu-rendang.jpg': 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&h=300&fit=crop&auto=format',
  'sambal-oelek.jpg': 'https://images.unsplash.com/photo-1596040033229-a40b1c2c5f85?w=400&h=300&fit=crop&auto=format',
  'secang.jpg': 'https://images.unsplash.com/photo-1571167681781-8d5b3c41223c?w=400&h=300&fit=crop&auto=format',
  'wedang-jahe.jpg': 'https://images.unsplash.com/photo-1566306202754-0b5fcde99486?w=400&h=300&fit=crop&auto=format',
  'teh-pucuk.jpg': 'https://images.unsplash.com/photo-1558618166-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
  'kopi-luwak.jpg': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format',
  'kerupuk-udang.jpg': 'https://images.unsplash.com/photo-1586829135343-132950070391?w=400&h=300&fit=crop&auto=format',
  'keripik-singkong.jpg': 'https://images.unsplash.com/photo-1586829351208-c01b1ce8baa9?w=400&h=300&fit=crop&auto=format',
  'emping-melinjo.jpg': 'https://images.unsplash.com/photo-1625398407786-dd4d2a051d10?w=400&h=300&fit=crop&auto=format',
  'dodol-betawi.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
  'wajik-ketan.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
  'lapis-legit.jpg': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&auto=format',
  'abon-ikan.jpg': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
  'dendeng-balado.jpg': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&auto=format',
  'rendang-daging.jpg': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&auto=format',
  'keripik-tempe.jpg': 'https://images.unsplash.com/photo-1586829351208-c01b1ce8baa9?w=400&h=300&fit=crop&auto=format',
  'manisan-mangga.jpg': 'https://images.unsplash.com/photo-1566476286313-de47bb06bba8?w=400&h=300&fit=crop&auto=format',
  'asinan-betawi.jpg': 'https://images.unsplash.com/photo-1611305553394-62a0c4536cd0?w=400&h=300&fit=crop&auto=format',
  'keripik-pisang.jpg': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=300&fit=crop&auto=format',
  'sale-pisang.jpg': 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=300&fit=crop&auto=format',

  // Category Images
  'category-bumbu.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
  'category-gula.jpg': 'https://images.unsplash.com/photo-1571167681781-8d5b3c41223c?w=400&h=300&fit=crop&auto=format',
  'category-minuman.jpg': 'https://images.unsplash.com/photo-1566306202754-0b5fcde99486?w=400&h=300&fit=crop&auto=format',
  'category-camilan.jpg': 'https://images.unsplash.com/photo-1586829135343-132950070391?w=400&h=300&fit=crop&auto=format',
  'category-manisan.jpg': 'https://images.unsplash.com/photo-1566476286313-de47bb06bba8?w=400&h=300&fit=crop&auto=format',
  'category-kue.jpg': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format',
  'category-lauk.jpg': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&auto=format',
  'category-sambal.jpg': 'https://images.unsplash.com/photo-1596040033229-a40b1c2c5f85?w=400&h=300&fit=crop&auto=format'
}

function getCloudUrlForLocalPath(localPath: string): string {
  // Extract filename from path
  const fileName = localPath.replace(/^\/uploads\//, '')
  
  // Return working cloud URL or placeholder
  return WORKING_IMAGES[fileName as keyof typeof WORKING_IMAGES] || 
         'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=400&h=300&fit=crop&auto=format'
}

async function fixProductImages() {
  console.log('🔧 Fixing product images...')
  
  const products = await prisma.product.findMany({
    include: { images: true }
  })
  
  let fixedCount = 0
  
  for (const product of products) {
    for (const image of product.images) {
      if (image.url.startsWith('/uploads/')) {
        const cloudUrl = getCloudUrlForLocalPath(image.url)
        
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: cloudUrl }
        })
        
        console.log(`✅ Fixed product image: ${product.name} -> ${cloudUrl}`)
        fixedCount++
      }
    }
  }
  
  return fixedCount
}

async function fixCategoryImages() {
  console.log('🔧 Fixing category images...')
  
  const categories = await prisma.category.findMany()
  let fixedCount = 0
  
  for (const category of categories) {
    if (category.image && category.image.startsWith('/uploads/')) {
      const cloudUrl = getCloudUrlForLocalPath(category.image)
      
      await prisma.category.update({
        where: { id: category.id },
        data: { image: cloudUrl }
      })
      
      console.log(`✅ Fixed category image: ${category.name} -> ${cloudUrl}`)
      fixedCount++
    }
  }
  
  return fixedCount
}

async function fixHeroSlideImages() {
  console.log('🔧 Fixing hero slide images...')
  
  const heroSlides = await prisma.heroSlide.findMany()
  let fixedCount = 0
  
  for (const slide of heroSlides) {
    if (slide.backgroundImage && slide.backgroundImage.startsWith('/uploads/')) {
      const cloudUrl = getCloudUrlForLocalPath(slide.backgroundImage)
      
      await prisma.heroSlide.update({
        where: { id: slide.id },
        data: { backgroundImage: cloudUrl }
      })
      
      console.log(`✅ Fixed hero slide image: ${slide.title} -> ${cloudUrl}`)
      fixedCount++
    }
  }
  
  return fixedCount
}

async function main() {
  console.log('🚀 Starting production image fix...')
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development')
  console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not configured')
  
  try {
    const productImagesFixed = await fixProductImages()
    const categoryImagesFixed = await fixCategoryImages()  
    const heroImagesFixed = await fixHeroSlideImages()
    
    const totalFixed = productImagesFixed + categoryImagesFixed + heroImagesFixed
    
    console.log('\n' + '='.repeat(50))
    console.log('📊 PRODUCTION IMAGE FIX SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Product images fixed: ${productImagesFixed}`)
    console.log(`✅ Category images fixed: ${categoryImagesFixed}`)
    console.log(`✅ Hero slide images fixed: ${heroImagesFixed}`)
    console.log(`🎉 Total images fixed: ${totalFixed}`)
    console.log('='.repeat(50))
    
    if (totalFixed > 0) {
      console.log('🎉 SUCCESS: All local image paths have been replaced with working cloud URLs!')
    } else {
      console.log('ℹ️  INFO: No local image paths found - all images already using cloud URLs')
    }
    
  } catch (error) {
    console.error('❌ Error fixing images:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}
