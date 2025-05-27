import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
const envPath = join(process.cwd(), '.env')
config({ path: envPath })

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  console.log('📝 Please create a .env file with DATABASE_URL or run:')
  console.log('   cp .env.example .env')
  console.log('   # Then edit .env with your database connection string')
  process.exit(1)
}

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testImageUrl(url: string): Promise<{ working: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageVerifier/1.0)'
      }
    })
    
    const isImage = response.headers.get('content-type')?.startsWith('image/')
    return {
      working: response.ok && !!isImage,
      status: response.status
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      working: false,
      error: errorMessage
    }
  }
}

async function verifyAllImages() {
  try {
    console.log('🔍 Verifying all images are accessible...')
    console.log(`🌐 Using database: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'unknown'}`)
    
    // Test database connection first
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    let totalImages = 0
    let workingImages = 0
    let brokenImages = 0
    
    // Check product images
    const products = await prisma.product.findMany({
      include: { images: true }
    })
    
    console.log(`\n📦 Checking ${products.length} products...`)
    
    for (const product of products) {
      for (const image of product.images) {
        totalImages++
        process.stdout.write(`⏳ Testing image ${totalImages}/${products.reduce((acc, p) => acc + p.images.length, 0)}...`)
        const result = await testImageUrl(image.url)
        
        if (result.working) {
          workingImages++
          console.log(`\r✅ ${product.name}: ${image.url.substring(0, 60)}...`)
        } else {
          brokenImages++
          const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (HTTP ${result.status})` : ''
          console.log(`\r❌ ${product.name}: ${image.url}${errorInfo}`)
        }
      }
    }
    
    // Check category images
    const categories = await prisma.category.findMany()
    console.log(`\n📂 Checking ${categories.length} categories...`)
    
    for (const category of categories) {
      if (category.image) {
        totalImages++
        process.stdout.write(`⏳ Testing category image ${totalImages}...`)
        const result = await testImageUrl(category.image)
        
        if (result.working) {
          workingImages++
          console.log(`\r✅ Category ${category.name}: ${category.image.substring(0, 60)}...`)
        } else {
          brokenImages++
          const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (HTTP ${result.status})` : ''
          console.log(`\r❌ Category ${category.name}: ${category.image}${errorInfo}`)
        }
      }
    }
    
    // Check hero slide images
    const heroSlides = await prisma.heroSlide.findMany()
    console.log(`\n🎯 Checking ${heroSlides.length} hero slides...`)
    
    for (const slide of heroSlides) {
      if (slide.backgroundImage) {
        totalImages++
        process.stdout.write(`⏳ Testing hero slide image ${totalImages}...`)
        const result = await testImageUrl(slide.backgroundImage)
        
        if (result.working) {
          workingImages++
          console.log(`\r✅ Hero "${slide.title}": ${slide.backgroundImage.substring(0, 60)}...`)
        } else {
          brokenImages++
          const errorInfo = result.error ? ` (${result.error})` : result.status ? ` (HTTP ${result.status})` : ''
          console.log(`\r❌ Hero "${slide.title}": ${slide.backgroundImage}${errorInfo}`)
        }
      }
    }
    
    // Summary
    console.log(`\n📊 Image Verification Summary:`)
    console.log(`📈 Total images: ${totalImages}`)
    console.log(`✅ Working images: ${workingImages}`)
    console.log(`❌ Broken images: ${brokenImages}`)
    console.log(`📊 Success rate: ${Math.round((workingImages / totalImages) * 100)}%`)
    
    if (brokenImages === 0) {
      console.log(`\n🎉 All images are working perfectly!`)
      console.log(`🚀 Railway deployment image issue is RESOLVED!`)
    } else {
      console.log(`\n⚠️  Some images need attention`)
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Verification failed:', errorMessage)
    
    if (errorMessage.includes('DATABASE_URL')) {
      console.log('\n💡 Environment setup suggestions:')
      console.log('   1. Copy example environment: cp .env.example .env')
      console.log('   2. Edit .env with your database connection')
      console.log('   3. For development: Use local MySQL or Docker')
      console.log('   4. For production verification: Use Railway database URL')
    } else if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Server has closed')) {
      console.log('\n💡 Database connection troubleshooting:')
      console.log('   1. Check if Railway database is running')
      console.log('   2. Verify DATABASE_URL is current (Railway URLs can change)')
      console.log('   3. Try running: railway connect')
      console.log('   4. Alternative: Test with known working cloud image URLs directly')
      console.log('\n🔄 Attempting to verify a few known cloud images without database...')
      
      // Test some known UploadThing URLs directly
      const testUrls = [
        'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdm6.jpeg',
        'https://utfs.io/f/c17df8de-6bcf-4e6c-b57a-bb4e3ee8de7c-j9sdmb.jpeg'
      ]
      
      for (const url of testUrls) {
        const result = await testImageUrl(url)
        if (result.working) {
          console.log(`✅ Cloud storage test: ${url.substring(0, 60)}...`)
        } else {
          console.log(`❌ Cloud storage test: ${url}`)
        }
      }
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAllImages()
