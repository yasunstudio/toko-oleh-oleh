import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSpecificUrls() {
  console.log('🔧 Fixing specific wrong UploadThing URLs...\n')
  
  try {
    // Mari kita ambil sample URLs yang salah dan ganti dengan yang benar
    // Berdasarkan data sebelumnya, kita tau URL yang salah dan benar
    
    // Test dengan URL yang kita lihat di database: sPrFi2oXJxbUZ0A4bJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa
    // Yang seharusnya untuk rendang-kering.jpg: sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a
    
    const updates = await prisma.productImage.updateMany({
      where: {
        url: 'https://utfs.io/f/sPrFi2oXJxbUZ0A4bJxbUQRpf2NtDm0qE7oLhcgCk6d4Msa'
      },
      data: {
        url: 'https://utfs.io/f/sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a'
      }
    })
    
    console.log(`✅ Updated ${updates.count} product image(s) for rendang-kering`)
    
    // Test URL yang valid
    const testUrl = 'https://utfs.io/f/sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a'
    console.log(`\n🧪 Testing new URL: ${testUrl}`)
    
  } catch (error) {
    console.error('❌ Fix error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSpecificUrls()
