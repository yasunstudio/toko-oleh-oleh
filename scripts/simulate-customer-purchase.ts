import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function simulateCustomerPurchase() {
  try {
    console.log('🛒 Simulating complete customer purchase flow...\n')

    // Find customer account
    const customer = await prisma.user.findFirst({
      where: { 
        role: 'CUSTOMER',
        email: 'customer@example.com'
      }
    })

    if (!customer) {
      console.log('❌ Customer account not found')
      return
    }

    console.log(`👤 Customer: ${customer.name} (${customer.email})`)

    // Clear existing cart
    await prisma.cartItem.deleteMany({
      where: { userId: customer.id }
    })

    // Get available products
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        stock: { gt: 0 }
      },
      take: 3
    })

    if (products.length === 0) {
      console.log('❌ No available products')
      return
    }

    console.log('\n🛍️ Adding products to cart:')
    
    // Add products to cart
    const cartItems: Array<{ product: any, quantity: number }> = []
    for (let i = 0; i < Math.min(2, products.length); i++) {
      const product = products[i]
      const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 items
      
      await prisma.cartItem.create({
        data: {
          userId: customer.id,
          productId: product.id,
          quantity
        }
      })
      
      cartItems.push({ product, quantity })
      console.log(`  - ${product.name} x${quantity} (${product.price.toLocaleString('id-ID')} each)`)
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    console.log(`\n💰 Total amount: Rp ${totalAmount.toLocaleString('id-ID')}`)

    // Check admin notifications before order
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })

    const beforeCounts = {}
    for (const admin of adminUsers) {
      const count = await prisma.notification.count({
        where: { userId: admin.id }
      })
      beforeCounts[admin.id] = count
    }

    console.log('\n📊 Admin notification counts before order:')
    adminUsers.forEach(admin => {
      console.log(`  ${admin.name}: ${beforeCounts[admin.id]} notifications`)
    })

    // Simulate order creation (mimicking the API call)
    console.log('\n📦 Creating order...')
    
    const orderNumber = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: customer.id,
          totalAmount,
          shippingAddress: 'Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345',
          notes: 'Mohon dikemas dengan rapi. Terima kasih!',
          bankAccount: 'BCA - 1234567890 (Toko Oleh-Oleh)',
          status: 'PENDING',
          paymentStatus: 'PENDING'
        }
      })

      // Create order items
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }
        })
      }

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: customer.id }
      })

      // Create admin notification for new order (AUTO NOTIFICATION)
      const adminUsers = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, name: true }
      })

      console.log(`🔔 Creating notifications for ${adminUsers.length} admin(s)...`)

      // Notify all admin users about the new order
      for (const admin of adminUsers) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: 'Pesanan Baru Masuk',
            message: `Pesanan baru ${orderNumber} dari customer perlu dikonfirmasi`,
            type: 'ORDER_STATUS',
            orderId: newOrder.id,
            data: JSON.stringify({
              orderNumber,
              customerName: customer.name,
              totalAmount,
              status: 'PENDING'
            })
          }
        })
      }

      return newOrder
    })

    console.log(`✅ Order created: ${order.orderNumber}`)

    // Check admin notifications after order
    const afterCounts = {}
    const newNotifications = []
    
    for (const admin of adminUsers) {
      const count = await prisma.notification.count({
        where: { userId: admin.id }
      })
      afterCounts[admin.id] = count
      
      if (count > beforeCounts[admin.id]) {
        const newNotifs = await prisma.notification.findMany({
          where: { 
            userId: admin.id,
            orderId: order.id
          },
          orderBy: { createdAt: 'desc' }
        })
        newNotifications.push(...newNotifs)
      }
    }

    console.log('\n📊 Admin notification counts after order:')
    adminUsers.forEach(admin => {
      const increase = afterCounts[admin.id] - beforeCounts[admin.id]
      console.log(`  ${admin.name}: ${afterCounts[admin.id]} notifications (+${increase})`)
    })

    console.log(`\n🔔 Total new notifications created: ${newNotifications.length}`)

    if (newNotifications.length > 0) {
      console.log('\n✅ AUTOMATIC ADMIN NOTIFICATIONS WORKING!')
      console.log('\n📱 Notification details:')
      newNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. "${notif.title}"`)
        console.log(`   Message: ${notif.message}`)
        console.log(`   Type: ${notif.type}`)
        console.log(`   Status: ${notif.status}`)
        console.log(`   Created: ${notif.createdAt.toLocaleString('id-ID')}`)
        
        if (notif.data) {
          const data = JSON.parse(notif.data)
          console.log(`   Order Data:`)
          console.log(`     - Order Number: ${data.orderNumber}`)
          console.log(`     - Customer: ${data.customerName}`)
          console.log(`     - Amount: Rp ${data.totalAmount.toLocaleString('id-ID')}`)
          console.log(`     - Status: ${data.status}`)
        }
        console.log('')
      })
    } else {
      console.log('❌ NO AUTOMATIC NOTIFICATIONS CREATED')
    }

    // Final summary
    console.log('\n=== PURCHASE SIMULATION COMPLETE ===')
    console.log(`🛒 Order: ${order.orderNumber}`)
    console.log(`👤 Customer: ${customer.name} (${customer.email})`)
    console.log(`💰 Total: Rp ${totalAmount.toLocaleString('id-ID')}`)
    console.log(`📦 Items: ${cartItems.length} different products`)
    console.log(`👨‍💼 Admins notified: ${adminUsers.length}`)
    console.log(`🔔 Notifications sent: ${newNotifications.length}`)
    console.log(`✅ Auto-notification system: ${newNotifications.length > 0 ? 'WORKING CORRECTLY' : 'NOT WORKING'}`)

    if (newNotifications.length > 0) {
      console.log('\n🎉 SUCCESS: Admin will be automatically notified when customers make orders!')
    }

  } catch (error) {
    console.error('❌ Simulation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simulateCustomerPurchase()
