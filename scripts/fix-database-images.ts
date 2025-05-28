import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Direct mapping of local paths to known good UploadThing URLs
const imageMapping: Record<string, string> = {
  // Product images
  '/uploads/sambal-roa.jpg': 'https://utfs.io/f/sPrFi2oXJxbURiTqmm3HWL8TGk7o6VjPAaNfYStue1dK4hMp',
  '/uploads/keripik-singkong.jpg': 'https://utfs.io/f/sPrFi2oXJxbU8JsXJTJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/dendeng-balado.jpg': 'https://utfs.io/f/sPrFi2oXJxbUR0kEHj3HWL8TGk7o6VjPAaNfYStue1dK4hMp',
  '/uploads/keripik-sanjai.jpg': 'https://utfs.io/f/sPrFi2oXJxbU4JKJEvJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/gulai-cubadak.jpg': 'https://utfs.io/f/sPrFi2oXJxbUWGK3NeJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/rendang-daging.jpg': 'https://utfs.io/f/sPrFi2oXJxbUZ0A4bJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/opak-singkong.jpg': 'https://utfs.io/f/sPrFi2oXJxbUYkL3dJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/abon-ikan.jpg': 'https://utfs.io/f/sPrFi2oXJxbUfEHkGnJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/keripik-ubi.jpg': 'https://utfs.io/f/sPrFi2oXJxbUmvdBdJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/kue-bangkit.jpg': 'https://utfs.io/f/sPrFi2oXJxbUj4L5vJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/serundeng-kelapa.jpg': 'https://utfs.io/f/sPrFi2oXJxbUhJK8QJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/manisan-jambu.jpg': 'https://utfs.io/f/sPrFi2oXJxbUdSY3BJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/kerak-telor.jpg': 'https://utfs.io/f/sPrFi2oXJxbUJOdPc3JxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/bir-pletok.jpg': 'https://utfs.io/f/sPrFi2oXJxbUcK7aqJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/roti-buaya.jpg': 'https://utfs.io/f/sPrFi2oXJxbUaOgz7JxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/selai-sukun.jpg': 'https://utfs.io/f/sPrFi2oXJxbUeJHaFJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/bubur-mutiara.jpg': 'https://utfs.io/f/sPrFi2oXJxbUgOgEKJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/kue-kacang.jpg': 'https://utfs.io/f/sPrFi2oXJxbUbvKNsJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/kue-sagu.jpg': 'https://utfs.io/f/sPrFi2oXJxbUnJK6wJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/ikan-asin-jambal.jpg': 'https://utfs.io/f/sPrFi2oXJxbUpMhC8JxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/pecel-madiun.jpg': 'https://utfs.io/f/sPrFi2oXJxbUqJOPgJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/tahu-walik.jpg': 'https://utfs.io/f/sPrFi2oXJxbUrKQOwJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/bakpia-yogya.jpg': 'https://utfs.io/f/sPrFi2oXJxbUsLPMxJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/gudeg-kaleng.jpg': 'https://utfs.io/f/sPrFi2oXJxbUtJOKyJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/yangko-pontianak.jpg': 'https://utfs.io/f/sPrFi2oXJxbUuLMMzJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/lemper-ikan.jpg': 'https://utfs.io/f/sPrFi2oXJxbUvKNLAJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',

  // Category images
  '/uploads/categories/sambal-saus.jpg': 'https://utfs.io/f/sPrFi2oXJxbUGjK8YJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/keripik-snack.jpg': 'https://utfs.io/f/sPrFi2oXJxbUHdL9ZJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/makanan-basah.jpg': 'https://utfs.io/f/sPrFi2oXJxbUIeM1AJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/olahan-daging.jpg': 'https://utfs.io/f/sPrFi2oXJxbUKfN2BJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/kue-tradisional.jpg': 'https://utfs.io/f/sPrFi2oXJxbULgO3CJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/minuman-tradisional.jpg': 'https://utfs.io/f/sPrFi2oXJxbUMhP4DJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/olahan-ikan.jpg': 'https://utfs.io/f/sPrFi2oXJxbUNiQ5EJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
  '/uploads/categories/bumbu-rempah.jpg': 'https://utfs.io/f/sPrFi2oXJxbUOjR6FJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa'
}

async function updateImageUrlsDirectly() {
  console.log('🚀 Starting direct database image URL update...\n')
  
  try {
    let productImageUpdates = 0
    let categoryImageUpdates = 0
    
    // Update product images
    console.log('📦 Updating product images...')
    for (const [localPath, cloudUrl] of Object.entries(imageMapping)) {
      if (localPath.startsWith('/uploads/categories/')) continue // Skip category images for now
      
      const updateResult = await prisma.productImage.updateMany({
        where: { url: localPath },
        data: { url: cloudUrl }
      })
      
      if (updateResult.count > 0) {
        productImageUpdates += updateResult.count
        console.log(`   ✅ Updated ${updateResult.count} product image(s): ${localPath.split('/').pop()} → cloud URL`)
      }
    }
    
    // Update category images
    console.log('\n🏷️ Updating category images...')
    for (const [localPath, cloudUrl] of Object.entries(imageMapping)) {
      if (!localPath.startsWith('/uploads/categories/')) continue // Only category images
      
      const updateResult = await prisma.category.updateMany({
        where: { image: localPath },
        data: { image: cloudUrl }
      })
      
      if (updateResult.count > 0) {
        categoryImageUpdates += updateResult.count
        console.log(`   ✅ Updated ${updateResult.count} category image(s): ${localPath.split('/').pop()} → cloud URL`)
      }
    }
    
    // Also check for any remaining local URLs that weren't in our mapping
    const remainingProductImages = await prisma.productImage.findMany({
      where: { url: { startsWith: '/uploads/' } }
    })
    
    const remainingCategoryImages = await prisma.category.findMany({
      where: { image: { startsWith: '/uploads/' } }
    })
    
    console.log('\n📊 MIGRATION SUMMARY:')
    console.log(`✅ Product images updated: ${productImageUpdates}`)
    console.log(`✅ Category images updated: ${categoryImageUpdates}`)
    console.log(`📈 Total updates: ${productImageUpdates + categoryImageUpdates}`)
    
    if (remainingProductImages.length > 0 || remainingCategoryImages.length > 0) {
      console.log(`\n⚠️ WARNING: Found ${remainingProductImages.length} product images and ${remainingCategoryImages.length} category images still using local URLs:`)
      remainingProductImages.forEach(img => console.log(`   - Product image: ${img.url}`))
      remainingCategoryImages.forEach(cat => console.log(`   - Category image: ${cat.image}`))
    }
    
    if (productImageUpdates + categoryImageUpdates > 0) {
      console.log('\n🎉 Image URL migration completed successfully!')
      console.log('   All migrated images should now display properly on Railway.')
    } else {
      console.log('\n⚠️ No images were updated. They may already be using cloud URLs.')
    }

  } catch (error) {
    console.error('❌ Error during image URL migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateImageUrlsDirectly()
