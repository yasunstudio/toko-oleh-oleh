import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function debugImageUrls() {
  console.log('🔍 Debugging Image URLs...')
  
  try {
    const products = await db.product.findMany({
      take: 5,
      include: {
        category: true,
        images: true
      }
    })

    console.log(`\n📊 Found ${products.length} products to test:`)
    
    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.name} ---`)
      console.log(`ID: ${product.id}`)
      console.log(`Slug: ${product.slug}`)
      console.log(`Images data type: ${typeof product.images}`)
      console.log(`Images data:`, product.images)
      
      // Test the getProductImageUrl logic
      const getProductImageUrl = (): string => {
        try {
          if (!product.images || product.images.length === 0) {
            return '/placeholder.jpg'
          }
          
          const firstImage = product.images[0]
          if (typeof firstImage === 'string') {
            return firstImage
          } else if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
            return firstImage.url
          }
          
          return '/placeholder.jpg'
        } catch (error) {
          console.error('Error getting product image:', error)
          return '/placeholder.jpg'
        }
      }
      
      const resolvedUrl = getProductImageUrl()
      console.log(`🖼️ Resolved URL: ${resolvedUrl}`)
      console.log(`🔗 Is valid URL: ${resolvedUrl.startsWith('http') || resolvedUrl.startsWith('/')}`)
    })

    // Test image accessibility
    console.log('\n🌐 Testing image accessibility...')
    for (const product of products.slice(0, 3)) {
      const firstImageUrl = product.images && product.images.length > 0 
        ? product.images[0].url
        : null

      if (firstImageUrl && firstImageUrl.startsWith('http')) {
        try {
          const response = await fetch(firstImageUrl, { method: 'HEAD' })
          console.log(`✅ ${product.name}: ${response.status} ${response.statusText}`)
        } catch (error) {
          console.log(`❌ ${product.name}: Failed to fetch - ${error}`)
        }
      } else {
        console.log(`⚠️ ${product.name}: Invalid or local URL - ${firstImageUrl}`)
      }
    }

  } catch (error) {
    console.error('❌ Database error:', error)
  }
}

// Run the debug function
debugImageUrls().then(() => {
  console.log('\n✅ Debug complete!')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Debug failed:', error)
  process.exit(1)
})
