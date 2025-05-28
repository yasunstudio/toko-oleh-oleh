import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAutoNotifications() {
  try {
    console.log('🧪 Testing automatic notification system...\n')

    // Find customer and admin accounts
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    })

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!customer || !admin) {
      console.log('❌ Missing customer or admin accounts')
      return
    }

    console.log(`👤 Customer: ${customer.name} (${customer.email})`)
    console.log(`👨‍💼 Admin: ${admin.name} (${admin.email})\n`)

    // Check current notifications for admin
    const beforeNotifications = await prisma.notification.findMany({
      where: { userId: admin.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Admin notifications before test: ${beforeNotifications.length}`)

    // Get a product for testing
    const product = await prisma.product.findFirst({
      where: { 
        isActive: true,
        stock: { gt: 0 }
      }
    })

    if (!product) {
      console.log('❌ No available products for testing')
      return
    }

    console.log(`📦 Testing with product: ${product.name} (Stock: ${product.stock})\n`)

    // Create a cart item for the customer
    await prisma.cartItem.deleteMany({
      where: { userId: customer.id }
    })

    await prisma.cartItem.create({
      data: {
        userId: customer.id,
        productId: product.id,
        quantity: 1
      }
    })

    console.log('✅ Cart item created for customer')

    // Simulate order creation by calling the API endpoint logic
    const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: customer.id,
          totalAmount: product.price,
          shippingAddress: 'Test Address for notification testing',
          notes: 'Auto notification test order',
          bankAccount: 'BCA - 1234567890 (Test)',
          status: 'PENDING',
          paymentStatus: 'PENDING'
        }
      })

      // Create order items
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: product.id,
          quantity: 1,
          price: product.price
        }
      })

      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } }
      })

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: customer.id }
      })

      // Create admin notification for new order (the new functionality)
      const adminUsers = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      })

      // Notify all admin users about the new order
      for (const adminUser of adminUsers) {
        await tx.notification.create({
          data: {
            userId: adminUser.id,
            title: 'Pesanan Baru Masuk',
            message: `Pesanan baru ${orderNumber} dari customer perlu dikonfirmasi`,
            type: 'ORDER_STATUS',
            orderId: newOrder.id,
            data: JSON.stringify({
              orderNumber,
              customerName: customer.name,
              totalAmount: product.price,
              status: 'PENDING'
            })
          }
        })
      }

      return newOrder
    })

    console.log(`✅ Test order created: ${order.orderNumber}`)

    // Check notifications after order creation
    const afterNotifications = await prisma.notification.findMany({
      where: { userId: admin.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Admin notifications after test: ${afterNotifications.length}`)

    const newNotifications = afterNotifications.filter(n => 
      !beforeNotifications.find(bn => bn.id === n.id)
    )

    console.log(`🔔 New notifications created: ${newNotifications.length}\n`)

    if (newNotifications.length > 0) {
      console.log('✅ AUTOMATIC NOTIFICATIONS WORKING!')
      console.log('\n📱 New notification details:')
      newNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`)
        console.log(`   Message: ${notif.message}`)
        console.log(`   Type: ${notif.type}`)
        console.log(`   Status: ${notif.status}`)
        console.log(`   Created: ${notif.createdAt}`)
        if (notif.data) {
          const data = JSON.parse(notif.data)
          console.log(`   Data: ${JSON.stringify(data, null, 2)}`)
        }
        console.log('')
      })
    } else {
      console.log('❌ NO NEW NOTIFICATIONS CREATED - System not working')
    }

    // Summary
    console.log('\n=== TEST SUMMARY ===')
    console.log(`Test Order: ${order.orderNumber}`)
    console.log(`Customer: ${customer.name}`)
    console.log(`Admin Notifications Created: ${newNotifications.length}`)
    console.log(`Auto-notification Status: ${newNotifications.length > 0 ? '✅ WORKING' : '❌ NOT WORKING'}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAutoNotifications()
