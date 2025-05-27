import { PrismaClient } from '@prisma/client'
import { UTApi } from 'uploadthing/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()
const utapi = new UTApi()

async function migrateImageToCloud(localPath: string): Promise<string | null> {
  try {
    // Remove leading slash and uploads/ prefix to get filename
    const fileName = localPath.replace(/^\/uploads\//, '')
    const fullPath = join(process.cwd(), 'public', 'uploads', fileName)
    
    console.log(`📤 Migrating: ${fileName}`)
    
    if (!existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${fullPath}`)
      return null
    }

    // Read file
    const fileBuffer = readFileSync(fullPath)
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    // Create File object
    const file = new File([fileBuffer], fileName, {
      type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`
    })

    // Upload to UploadThing
    const response = await utapi.uploadFiles([file])
    
    if (response[0]?.data?.url) {
      console.log(`✅ Uploaded: ${fileName} -> ${response[0].data.url}`)
      return response[0].data.url
    } else {
      console.log(`❌ Upload failed for: ${fileName}`)
      return null
    }
  } catch (error) {
    console.error(`❌ Error migrating ${localPath}:`, error)
    return null
  }
}

async function migrateAllImages() {
  try {
    console.log('🚀 Starting image migration to UploadThing...')
    
    // Get all products with local image URLs
    const products = await prisma.product.findMany({
      include: { images: true }
    })
    
    console.log(`📊 Found ${products.length} products to check`)
    
    let migratedCount = 0
    
    for (const product of products) {
      console.log(`\n🔍 Checking product: ${product.name}`)
      
      for (const image of product.images) {
        if (image.url.startsWith('/uploads/')) {
          const cloudUrl = await migrateImageToCloud(image.url)
          
          if (cloudUrl) {
            // Update database with cloud URL
            await prisma.productImage.update({
              where: { id: image.id },
              data: { url: cloudUrl }
            })
            
            migratedCount++
            console.log(`✅ Updated image ${image.id} for product ${product.name}`)
          }
        } else {
          console.log(`⏭️  Image already cloud-hosted: ${image.url}`)
        }
      }
    }
    
    // Migrate category images
    const categories = await prisma.category.findMany()
    console.log(`\n📊 Found ${categories.length} categories to check`)
    
    for (const category of categories) {
      if (category.image && category.image.startsWith('/uploads/')) {
        console.log(`\n🔍 Checking category: ${category.name}`)
        const cloudUrl = await migrateImageToCloud(category.image)
        
        if (cloudUrl) {
          await prisma.category.update({
            where: { id: category.id },
            data: { image: cloudUrl }
          })
          
          migratedCount++
          console.log(`✅ Updated category image for ${category.name}`)
        }
      }
    }
    
    // Migrate hero slide images
    const heroSlides = await prisma.heroSlide.findMany()
    console.log(`\n📊 Found ${heroSlides.length} hero slides to check`)
    
    for (const slide of heroSlides) {
      if (slide.backgroundImage && slide.backgroundImage.startsWith('/uploads/')) {
        console.log(`\n🔍 Checking hero slide: ${slide.title}`)
        const cloudUrl = await migrateImageToCloud(slide.backgroundImage)
        
        if (cloudUrl) {
          await prisma.heroSlide.update({
            where: { id: slide.id },
            data: { backgroundImage: cloudUrl }
          })
          
          migratedCount++
          console.log(`✅ Updated hero slide image for ${slide.title}`)
        }
      }
    }
    
    console.log(`\n🎉 Migration completed!`)
    console.log(`📈 Total images migrated: ${migratedCount}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateAllImages()
