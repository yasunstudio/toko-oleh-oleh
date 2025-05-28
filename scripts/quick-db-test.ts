import { PrismaClient } from '@prisma/client'

const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function quickTest() {
  try {
    console.log('Testing Railway connection...')
    const count = await db.product.count()
    console.log(`Product count: ${count}`)
    
    if (count > 0) {
      const sample = await db.product.findFirst({
        include: { images: true }
      })
      console.log(`Sample product: ${sample?.name}`)
      console.log(`Image count: ${sample?.images?.length || 0}`)
    }
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await db.$disconnect()
  }
}

quickTest()
