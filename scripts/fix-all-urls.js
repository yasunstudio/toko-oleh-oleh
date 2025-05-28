const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mapping dari pattern URL yang salah ke URL yang benar
const urlFixes = [
  {
    wrongPattern: 'sPrFi2oXJxbUfEHkGnJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
    correctUrl: 'https://utfs.io/f/sPrFi2oXJxbUmZjtd4uS5u4IMdNYJwrUVejZqXRBnfF123xv', // abon-sapi.jpg
    name: 'abon-sapi'
  },
  {
    wrongPattern: 'sPrFi2oXJxbUpMhC8JxbUQRpf2NtDm0qE7oLhcgCk6d4Msa', 
    correctUrl: 'https://utfs.io/f/sPrFi2oXJxbUoDHUs19fWJnx1vD04kyteXFjPUSVHslBc3gZ', // ikan-asin-jambal.jpg
    name: 'ikan-asin-jambal'
  },
  {
    wrongPattern: 'sPrFi2oXJxbUR0kEHj3HWL8TGk7o6VjPAaNfYStue1dK4hMp',
    correctUrl: 'https://utfs.io/f/sPrFi2oXJxbUeQuZcQhUSDAReM1rhWbfNFOptYlEjGKInCqL', // dendeng-balado.jpg
    name: 'dendeng-balado'
  },
  {
    wrongPattern: 'sPrFi2oXJxbU8JsXJTJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
    correctUrl: 'https://utfs.io/f/sPrFi2oXJxbUzxpdJsilLmCGFT0Kx8jurD9VNnAsWiZ1eXRw', // keripik-pisang.jpg
    name: 'keripik-pisang'
  }
]

async function fixAllUrls() {
  console.log('🔧 Fixing all wrong UploadThing URLs...\n')
  
  let totalFixed = 0
  
  try {
    for (const fix of urlFixes) {
      console.log(`📝 Fixing ${fix.name}...`)
      console.log(`   Pattern: ${fix.wrongPattern.substring(0, 30)}...`)
      console.log(`   New URL: ${fix.correctUrl}`)
      
      // Update ProductImage table
      const productUpdates = await prisma.productImage.updateMany({
        where: {
          url: { contains: fix.wrongPattern }
        },
        data: {
          url: fix.correctUrl
        }
      })
      
      // Update Category table
      const categoryUpdates = await prisma.category.updateMany({
        where: {
          image: { contains: fix.wrongPattern }
        },
        data: {
          image: fix.correctUrl
        }
      })
      
      const totalForThis = productUpdates.count + categoryUpdates.count
      totalFixed += totalForThis
      
      console.log(`   ✅ Updated ${totalForThis} records (${productUpdates.count} products, ${categoryUpdates.count} categories)`)
      console.log('')
    }
    
    // Sekarang fix categories yang berbeda
    console.log('🎯 Fixing category-specific URLs...')
    
    // Fix untuk categories yang punya URL khusus
    const categoryFixes = [
      {
        pattern: 'sPrFi2oXJxbUKfN2BJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbUyelCsVp4VOCszpZHva8fgKEblBFD2GMrnAY7',
        name: 'category-makanan-kering'
      },
      {
        pattern: 'sPrFi2oXJxbUIeM1AJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbUVbgyQdqNTma6zch29VjCuJRZkBwrH3qeFt0x',
        name: 'category-makanan-basah'
      },
      {
        pattern: 'sPrFi2oXJxbUHdL9ZJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbUWZN08JemGFl7bdAQOf1NkgxiSKaITCLszHh0',
        name: 'category-keripik'
      },
      {
        pattern: 'sPrFi2oXJxbUMhP4DJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbUeVJIp7hUSDAReM1rhWbfNFOptYlEjGKInCqL',
        name: 'category-minuman'
      },
      {
        pattern: 'sPrFi2oXJxbULgO3CJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbUGaWbmE5wMQCul5kgae4c1NfVBYxHZFpOP36q',
        name: 'category-kue-roti'
      },
      {
        pattern: 'sPrFi2oXJxbUOjR6FJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbUmZroV21S5u4IMdNYJwrUVejZqXRBnfF123xv',
        name: 'category-bumbu'
      },
      {
        pattern: 'sPrFi2oXJxbUGjK8YJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa',
        url: 'https://utfs.io/f/sPrFi2oXJxbU12c9dbTNhFmAVJ2WGcZeaov5RMC0jBETbK8Y',
        name: 'category-gula'
      }
    ]
    
    for (const fix of categoryFixes) {
      console.log(`📝 Fixing ${fix.name}...`)
      
      const categoryUpdates = await prisma.category.updateMany({
        where: {
          image: { contains: fix.pattern }
        },
        data: {
          image: fix.url
        }
      })
      
      totalFixed += categoryUpdates.count
      console.log(`   ✅ Updated ${categoryUpdates.count} category records`)
    }
    
    // Fix category-sambal yang seharusnya berbeda
    const sambalFix = await prisma.category.updateMany({
      where: {
        name: { contains: 'Sambal' }
      },
      data: {
        image: 'https://utfs.io/f/sPrFi2oXJxbUMXu7bwD8ePRaLIyTzJtN4flDG6jXYHdVKCku'
      }
    })
    
    totalFixed += sambalFix.count
    console.log(`📝 Fixed category-sambal: ${sambalFix.count} records`)
    
    // Fix keripik-singkong yang seharusnya berbeda dari keripik-pisang
    const singkongFix = await prisma.productImage.updateMany({
      where: {
        product: {
          name: { contains: 'Singkong' }
        }
      },
      data: {
        url: 'https://utfs.io/f/sPrFi2oXJxbUJdAh69UlwqmziVc1BE8IyZ9uQ43knsAxoa7M'
      }
    })
    
    totalFixed += singkongFix.count
    console.log(`📝 Fixed keripik-singkong: ${singkongFix.count} records`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 URL FIX SUMMARY')
  console.log('=' .repeat(50))
  console.log(`✅ Total records fixed: ${totalFixed}`)
  console.log('\n🎉 All URLs have been fixed!')
  console.log('🌐 Images should now load correctly from UploadThing!')
}

fixAllUrls()
