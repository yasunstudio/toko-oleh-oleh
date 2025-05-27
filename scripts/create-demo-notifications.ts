import { prisma } from '../src/lib/db'

async function createDemoNotifications() {
  try {
    // Find a customer user
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    })

    if (!customer) {
      console.log('No customer found. Please create a customer account first.')
      return
    }

    // Find an order belonging to this customer
    const order = await prisma.order.findFirst({
      where: { userId: customer.id }
    })

    console.log(`Creating demo notifications for user: ${customer.name} (${customer.email})`)

    // Create demo notifications
    const notifications = [
      {
        userId: customer.id,
        title: 'Pesanan Dikonfirmasi',
        message: 'Pesanan Anda telah dikonfirmasi dan sedang diproses oleh admin.',
        type: 'ORDER_STATUS' as const,
        orderId: order?.id,
        data: JSON.stringify({
          oldStatus: 'PENDING',
          newStatus: 'CONFIRMED',
          orderNumber: order?.orderNumber
        })
      },
      {
        userId: customer.id,
        title: 'Pembayaran Diverifikasi',
        message: 'Pembayaran Anda telah diverifikasi dan dikonfirmasi. Pesanan akan segera diproses.',
        type: 'PAYMENT_STATUS' as const,
        orderId: order?.id,
        data: JSON.stringify({
          oldPaymentStatus: 'PENDING',
          newPaymentStatus: 'VERIFIED',
          orderNumber: order?.orderNumber
        })
      },
      {
        userId: customer.id,
        title: 'Pesanan Sedang Disiapkan',
        message: 'Pesanan Anda sedang disiapkan oleh tim kami. Estimasi selesai dalam 1-2 hari kerja.',
        type: 'ORDER_STATUS' as const,
        orderId: order?.id,
        data: JSON.stringify({
          oldStatus: 'CONFIRMED',
          newStatus: 'PROCESSING',
          orderNumber: order?.orderNumber
        })
      },
      {
        userId: customer.id,
        title: 'Pesanan Telah Dikirim',
        message: 'Pesanan Anda telah dikirim! Silakan pantau status pengiriman melalui kurir.',
        type: 'ORDER_STATUS' as const,
        orderId: order?.id,
        data: JSON.stringify({
          oldStatus: 'PROCESSING',
          newStatus: 'SHIPPED',
          orderNumber: order?.orderNumber
        })
      },
      {
        userId: customer.id,
        title: 'Promo Spesial',
        message: 'Dapatkan diskon 20% untuk pembelian berikutnya! Gunakan kode NEXT20.',
        type: 'GENERAL' as const,
        data: JSON.stringify({
          promoCode: 'NEXT20',
          discount: 20,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    ]

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification
      })
      console.log(`✓ Created notification: ${notification.title}`)
    }

    console.log('\n🎉 Demo notifications created successfully!')
    console.log(`Login as ${customer.email} to see the notifications in action.`)

  } catch (error) {
    console.error('Error creating demo notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createDemoNotifications()
