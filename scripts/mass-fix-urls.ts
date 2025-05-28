import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping dari URL salah ke URL benar berdasarkan pattern yang kita lihat
const urlMappings = [
  // Product images - ganti semua URL yang menggunakan pattern yang salah
  {
    oldPattern: 'sPrFi2oXJxbUZ0A4bJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // rendang-kering.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a'
  },
  {
    oldPattern: 'sPrFi2oXJxbUfEHkGnJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // abon-sapi.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUmZjtd4uS5u4IMdNYJwrUVejZqXRBnfF123xv'
  },
  {
    oldPattern: 'sPrFi2oXJxbUpMhC8JxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // ikan-asin-jambal.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUoDHUs19fWJnx1vD04kyteXFjPUSVHslBc3gZ'
  },
  {
    oldPattern: 'sPrFi2oXJxbUR0kEHj3HWL8TGk7o6VjPAaNfYStue1dK4hMp', // dendeng-balado.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUeQuZcQhUSDAReM1rhWbfNFOptYlEjGKInCqL'
  },
  {
    oldPattern: 'sPrFi2oXJxbU8JsXJTJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // keripik-pisang.jpg (dan keripik-singkong.jpg)
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUzxpdJsilLmCGFT0Kx8jurD9VNnAsWiZ1eXRw'
  },
  // Category images
  {
    oldPattern: 'sPrFi2oXJxbUKfN2BJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-makanan-kering.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUyelCsVp4VOCszpZHva8fgKEblBFD2GMrnAY7'
  },
  {
    oldPattern: 'sPrFi2oXJxbUIeM1AJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-makanan-basah.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUVbgyQdqNTma6zch29VjCuJRZkBwrH3qeFt0x'
  },
  {
    oldPattern: 'sPrFi2oXJxbUHdL9ZJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-keripik.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUWZN08JemGFl7bdAQOf1NkgxiSKaITCLszHh0'
  },
  {
    oldPattern: 'sPrFi2oXJxbUMhP4DJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-minuman.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUeVJIp7hUSDAReM1rhWbfNFOptYlEjGKInCqL'
  },
  {
    oldPattern: 'sPrFi2oXJxbULgO3CJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-kue-roti.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUGaWbmE5wMQCul5kgae4c1NfVBYxHZFpOP36q'
  },
  {
    oldPattern: 'sPrFi2oXJxbUOjR6FJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-bumbu.jpg
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbUmZroV21S5u4IMdNYJwrUVejZqXRBnfF123xv'
  },
  {
    oldPattern: 'sPrFi2oXJxbUGjK8YJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', // category-gula.jpg (dan category-sambal.jpg)
    newUrl: 'https://utfs.io/f/sPrFi2oXJxbU12c9dbTNhFmAVJ2WGcZeaov5RMC0jBETbK8Y'
  }
]

async function massFixUrls() {
  console.log('🔧 Mass fixing all wrong UploadThing URLs...\n')
  
  let totalUpdated = 0
  let errorCount = 0
  
  try {
    for (const mapping of urlMappings) {
      console.log(`📝 Fixing pattern: ${mapping.oldPattern.substring(0, 20)}...`)
      console.log(`   New URL: ${mapping.newUrl}`)
      
      try {
        // Update ProductImage table
        const productImageUpdates = await prisma.productImage.updateMany({
          where: { 
            url: { contains: mapping.oldPattern }
          },
          data: { url: mapping.newUrl }
        })
        
        // Update Category table  
        const categoryUpdates = await prisma.category.updateMany({
          where: { 
            image: { contains: mapping.oldPattern }
          },
          data: { image: mapping.newUrl }
        })
        
        // Update HeroSlide table
        const heroUpdates = await prisma.heroSlide.updateMany({
          where: { 
            backgroundImage: { contains: mapping.oldPattern }
          },
          data: { backgroundImage: mapping.newUrl }
        })
        
        const totalForThisPattern = productImageUpdates.count + categoryUpdates.count + heroUpdates.count
        totalUpdated += totalForThisPattern
        
        if (totalForThisPattern > 0) {
          console.log(`   ✅ Updated ${totalForThisPattern} record(s) (${productImageUpdates.count} products, ${categoryUpdates.count} categories, ${heroUpdates.count} hero slides)`)
        } else {
          console.log(`   ⚠️  No records found for this pattern`)
        }
        
      } catch (error) {
        console.error(`   ❌ Error updating pattern:`, error)
        errorCount++
      }
      
      console.log('') // empty line
    }
    
    // Mari kita handle juga products yang menggunakan URL yang sama untuk berbeda produk
    // Ini adalah masalah dimana migration script menggunakan URL yang sama untuk file yang berbeda
    
    // Sekarang mari kita fix produk-produk dengan URL yang benar berdasarkan nama produk
    console.log('🎯 Fixing specific products with correct URLs...')
    
    // Fix keripik-singkong yang seharusnya berbeda dari keripik-pisang
    const keripikSingkongUpdate = await prisma.productImage.updateMany({
      where: {
        product: {
          name: { contains: 'Keripik Singkong' }
        }
      },
      data: {
        url: 'https://utfs.io/f/sPrFi2oXJxbUJdAh69UlwqmziVc1BE8IyZ9uQ43knsAxoa7M'
      }
    })
    
    if (keripikSingkongUpdate.count > 0) {
      console.log(`   ✅ Fixed Keripik Singkong: ${keripikSingkongUpdate.count} record(s)`)
      totalUpdated += keripikSingkongUpdate.count
    }
    
    // Fix category-sambal yang seharusnya berbeda dari category-gula
    const categorySambalUpdate = await prisma.category.updateMany({
      where: {
        name: { contains: 'Sambal' }
      },
      data: {
        image: 'https://utfs.io/f/sPrFi2oXJxbUMXu7bwD8ePRaLIyTzJtN4flDG6jXYHdVKCku'
      }
    })
    
    if (categorySambalUpdate.count > 0) {
      console.log(`   ✅ Fixed Category Sambal: ${categorySambalUpdate.count} record(s)`)
      totalUpdated += categorySambalUpdate.count
    }
    
  } catch (error) {
    console.error('❌ Mass fix error:', error)
  } finally {
    await prisma.$disconnect()
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 MASS FIX SUMMARY')
  console.log('=' .repeat(50))
  console.log(`✅ Successfully updated: ${totalUpdated} records`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('\n🎉 Mass URL fix completed!')
  console.log('🌐 All images should now load correctly from UploadThing!')
}

massFixUrls()
