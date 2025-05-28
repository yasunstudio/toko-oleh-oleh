import { NextRequest } from 'next/server'
import { POST } from '@/app/api/orders/[id]/payment/route'
import fs from 'fs'
import path from 'path'

async function testPaymentUpload() {
  console.log('🧪 Testing payment upload functionality...')
  
  // Check if uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  console.log(`📁 Uploads directory: ${uploadsDir}`)
  console.log(`📁 Directory exists: ${fs.existsSync(uploadsDir)}`)
  
  if (fs.existsSync(uploadsDir)) {
    try {
      const stats = fs.statSync(uploadsDir)
      console.log(`📁 Directory permissions: ${stats.mode.toString(8)}`)
      console.log(`📁 Is writable: ${fs.constants.W_OK}`)
      
      // Test write permissions
      const testFile = path.join(uploadsDir, 'test-write.txt')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      console.log('✅ Directory is writable')
    } catch (error) {
      console.error('❌ Directory write test failed:', error)
    }
  }
  
  // Test file size limits
  console.log('\n📏 Testing file size validation...')
  const maxSize = 5 * 1024 * 1024 // 5MB
  console.log(`Max allowed size: ${maxSize} bytes (${maxSize / 1024 / 1024}MB)`)
  
  // Check for existing orders
  try {
    const { prisma } = await import('@/lib/db')
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING'
      },
      take: 1
    })
    
    if (orders.length > 0) {
      console.log(`\n📋 Found test order: ${orders[0].id}`)
      console.log(`📋 Order status: ${orders[0].paymentStatus}`)
    } else {
      console.log('\n📋 No pending orders found for testing')
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testPaymentUpload().catch(console.error)
