import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createAdminNotifications() {
  try {
    console.log("🔔 Creating admin notifications for testing...");

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ No admin user found. Please create an admin account first.');
      return;
    }

    // Find some orders for notification context
    const orders = await prisma.order.findMany({
      take: 3,
      include: {
        user: true
      }
    });

    // Clear existing admin notifications first
    await prisma.notification.deleteMany({
      where: { 
        userId: admin.id 
      }
    });

    console.log(`📧 Creating notifications for admin: ${admin.name} (${admin.email})`);

    // Create various types of admin notifications
    const notifications = [
      {
        userId: admin.id,
        title: 'Pesanan Baru Masuk',
        message: `Pesanan baru dari ${orders[0]?.user.name || 'Customer'} dengan total Rp 350.000 menunggu konfirmasi.`,
        type: 'ORDER_STATUS' as const,
        orderId: orders[0]?.id,
        data: JSON.stringify({
          orderNumber: orders[0]?.orderNumber,
          customerName: orders[0]?.user.name,
          amount: 350000
        })
      },
      {
        userId: admin.id,
        title: 'Pembayaran Perlu Verifikasi',
        message: `Bukti pembayaran dari ${orders[1]?.user.name || 'Customer'} telah diupload dan perlu diverifikasi.`,
        type: 'PAYMENT_STATUS' as const,
        orderId: orders[1]?.id,
        data: JSON.stringify({
          orderNumber: orders[1]?.orderNumber,
          customerName: orders[1]?.user.name,
          paymentMethod: 'Bank Transfer'
        })
      },
      {
        userId: admin.id,
        title: 'Stock Produk Menipis',
        message: 'Beberapa produk memiliki stock yang hampir habis. Segera lakukan restock untuk menghindari kehabisan.',
        type: 'GENERAL' as const,
        data: JSON.stringify({
          products: [
            { name: 'Keripik Singkong Original', stock: 5 },
            { name: 'Dodol Garut Asli', stock: 3 },
            { name: 'Kue Lapis Legit', stock: 2 }
          ]
        })
      },
      {
        userId: admin.id,
        title: 'Laporan Penjualan Harian',
        message: `Penjualan hari ini mencapai Rp 1.250.000 dari 15 transaksi.`,
        type: 'GENERAL' as const,
        data: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          totalSales: 1250000,
          totalTransactions: 15,
          topProduct: 'Keripik Pisang Coklat'
        })
      },
      {
        userId: admin.id,
        title: 'Pengguna Baru Mendaftar',
        message: 'Ada 3 pengguna baru yang mendaftar hari ini. Sistem berjalan dengan baik.',
        type: 'GENERAL' as const,
        data: JSON.stringify({
          newUsersCount: 3,
          date: new Date().toISOString().split('T')[0]
        })
      },
      {
        userId: admin.id,
        title: 'Pesanan Siap Dikirim',
        message: `Pesanan ${orders[2]?.orderNumber || 'ORD-001'} telah selesai dikemas dan siap untuk dikirim.`,
        type: 'ORDER_STATUS' as const,
        orderId: orders[2]?.id,
        data: JSON.stringify({
          orderNumber: orders[2]?.orderNumber,
          customerName: orders[2]?.user.name,
          shippingAddress: orders[2]?.shippingAddress
        })
      }
    ];

    // Create notifications with different read status and timestamps
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      
      await prisma.notification.create({
        data: {
          ...notification,
          status: i > 3 ? 'READ' : 'UNREAD', // First 4 notifications unread, rest read
          createdAt: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)) // Spread over last 12 hours
        }
      });
      
      console.log(`✓ Created notification: ${notification.title}`);
    }

    // Get updated notification count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: admin.id,
        status: 'UNREAD'
      }
    });

    console.log(`\n🎉 Admin notifications created successfully!`);
    console.log(`📊 Total unread notifications for admin: ${unreadCount}`);
    console.log(`\n🔐 Login to admin panel with:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log(`\n🧪 Test scenarios:`);
    console.log(`   - Check notification bell icon with badge`);
    console.log(`   - Open notification dropdown`);
    console.log(`   - Mark notifications as read`);
    console.log(`   - Visit /admin/notifications page`);
    console.log(`   - Test real-time updates`);
    
  } catch (error) {
    console.error("❌ Error creating admin notifications:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminNotifications();
