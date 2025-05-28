const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function quickFix() {
  console.log('🔧 Quick fixing wrong URLs...')
  
  try {
    // Test dengan satu URL yang kita tau salah
    const result = await prisma.productImage.findMany({
      where: {
        url: { contains: 'sPrFi2oXJxbU' }
      },
      take: 5
    })
    
    console.log('Found URLs:')
    result.forEach((item, index) => {
      console.log(`${index + 1}. ${item.url}`)
    })
    
    if (result.length > 0) {
      // Update satu persatu
      for (const item of result) {
        if (item.url.includes('sPrFi2oXJxbUZ0A4bJ')) {
          // This is rendang-kering
          await prisma.productImage.update({
            where: { id: item.id },
            data: { url: 'https://utfs.io/f/sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a' }
          })
          console.log('✅ Fixed rendang-kering URL')
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickFix()
