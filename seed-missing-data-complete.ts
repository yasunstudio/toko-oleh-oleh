import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedMissingData() {
  console.log('🌱 Starting comprehensive seeding for missing data...')

  try {
    // Seed Hero Slides
    console.log('🎠 Creating hero slides...')
    await prisma.heroSlide.deleteMany() // Clear existing data
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "Selamat Datang di Toko Oleh-Oleh Nusantara",
          subtitle: "Jelajahi Kelezatan Autentik dari Seluruh Indonesia",
          description: "Temukan beragam produk oleh-oleh terbaik dari berbagai daerah di Indonesia. Dari sambal tradisional hingga camilan khas nusantara.",
          backgroundImage: null,
          backgroundColor: 'linear-gradient(to right, #f97316, #dc2626)',
          textColor: '#ffffff',
          primaryButtonText: "Jelajahi Produk",
          primaryButtonLink: "/products",
          secondaryButtonText: "Lihat Semua",
          secondaryButtonLink: "/categories",
          isActive: true,
          order: 1
        },
        {
          title: "Rasa Autentik Nusantara",
          subtitle: "Cita Rasa Tradisional yang Terjaga",
          description: "Setiap produk dipilih langsung dari produsen lokal terpercaya untuk menjamin kualitas dan keaslian rasa.",
          backgroundImage: null,
          backgroundColor: 'linear-gradient(to right, #10b981, #0d9488)',
          textColor: '#ffffff',
          primaryButtonText: "Lihat Kategori",
          primaryButtonLink: "/categories",
          secondaryButtonText: "Cara Pesan",
          secondaryButtonLink: "/about",
          isActive: true,
          order: 2
        },
        {
          title: "Gratis Ongkir Se-Indonesia",
          subtitle: "Pengiriman Aman & Terpercaya",
          description: "Dapatkan gratis ongkos kirim untuk pembelian minimal Rp 100.000. Produk dikemas dengan aman dan higienis.",
          backgroundImage: null,
          backgroundColor: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
          textColor: '#ffffff',
          primaryButtonText: "Belanja Sekarang",
          primaryButtonLink: "/products",
          secondaryButtonText: "Info Pengiriman",
          secondaryButtonLink: "/shipping",
          isActive: true,
          order: 3
        }
      ]
    })
    console.log('✅ Hero slides created: 3')

    // Seed Settings
    console.log('⚙️ Creating settings...')
    await prisma.setting.deleteMany() // Clear existing data
    await prisma.setting.createMany({
      data: [
        { category: 'general', key: 'store_name', value: 'Toko Oleh-Oleh Nusantara' },
        { category: 'general', key: 'store_description', value: 'Pusat oleh-oleh khas nusantara terlengkap dan terpercaya' },
        { category: 'general', key: 'store_email', value: 'info@tokooleholeh.com' },
        { category: 'general', key: 'store_phone', value: '+62 821 1234 5678' },
        { category: 'general', key: 'store_address', value: 'Jl. Nusantara No. 123, Jakarta Pusat, DKI Jakarta' },
        { category: 'general', key: 'store_open_hours', value: '08:00 - 20:00 WIB' },
        { category: 'general', key: 'store_logo', value: '/uploads/store-logo.png' },
        { category: 'general', key: 'currency', value: 'IDR' },
        { category: 'general', key: 'maintenance_mode', value: 'false' },
        { category: 'general', key: 'allow_registration', value: 'true' },
        
        { category: 'payment', key: 'min_order_amount', value: '25000' },
        { category: 'payment', key: 'tax_rate', value: '0' },
        
        { category: 'shipping', key: 'free_shipping_min', value: '100000' },
        { category: 'shipping', key: 'shipping_cost', value: '15000' },
        
        { category: 'email', key: 'email_notifications', value: 'true' },
        { category: 'email', key: 'sms_notifications', value: 'false' },
      ]
    })
    console.log('✅ Settings created: 16')

    // Seed Contact Messages
    console.log('📧 Creating contact messages...')
    await prisma.contact.deleteMany() // Clear existing data
    await prisma.contact.createMany({
      data: [
        {
          name: "Budi Santoso",
          email: "budi@example.com",
          phone: "+62 812 3456 7890",
          subject: "Pertanyaan Produk Sambal",
          message: "Halo, saya ingin bertanya tentang tingkat kepedasan sambal yang tersedia. Apakah ada sambal yang tidak terlalu pedas?",
          status: "REPLIED"
        },
        {
          name: "Siti Aminah",
          email: "siti@example.com",
          phone: "+62 878 5432 1098",
          subject: "Pengiriman ke Luar Jawa",
          message: "Apakah bisa kirim ke Kalimantan? Berapa lama waktu pengiriman dan bagaimana packaging-nya?",
          status: "UNREAD"
        },
        {
          name: "Ahmad Rahman",
          email: "ahmad@example.com",
          phone: null,
          subject: "Pertanyaan Kemitraan",
          message: "Saya produsen keripik dari Malang, apakah bisa bermitra untuk menjual produk melalui toko ini?",
          status: "READ"
        }
      ]
    })
    console.log('✅ Contact messages created: 3')

    // Get users for notifications
    const users = await prisma.user.findMany()
    
    if (users.length > 0) {
      // Seed Notifications
      console.log('🔔 Creating notifications...')
      await prisma.notification.deleteMany() // Clear existing data
      await prisma.notification.createMany({
        data: [
          {
            userId: users[0].id,
            title: "Selamat Datang!",
            message: "Terima kasih telah bergabung dengan Toko Oleh-Oleh Nusantara. Nikmati pengalaman berbelanja yang menyenangkan!",
            type: "GENERAL",
            status: "UNREAD"
          },
          {
            userId: users[1]?.id || users[0].id,
            title: "Promo Spesial Hari Ini",
            message: "Dapatkan diskon 15% untuk semua produk sambal! Gunakan kode SAMBAL15 saat checkout.",
            type: "GENERAL",
            status: "READ"
          },
          {
            userId: users[2]?.id || users[0].id,
            title: "Pesanan Berhasil Diproses",
            message: "Pesanan Anda dengan nomor #ORD001 sedang diproses dan akan segera dikirim.",
            type: "ORDER_STATUS",
            status: "READ"
          }
        ]
      })
      console.log('✅ Notifications created: 3')
    }

    // Seed Visitors
    console.log('👁️ Creating visitors...')
    await prisma.visitor.deleteMany() // Clear existing data
    const visitorData = [
      {
        sessionId: "sess_123456789",
        ipAddress: "103.140.2.45",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        device: "DESKTOP" as const
      },
      {
        sessionId: "sess_987654321",
        ipAddress: "114.79.48.12",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
        device: "MOBILE" as const
      },
      {
        sessionId: "sess_456789123",
        ipAddress: "202.158.52.89",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        device: "DESKTOP" as const
      }
    ]

    const visitors = []
    for (const data of visitorData) {
      const visitor = await prisma.visitor.create({ data })
      visitors.push(visitor)
    }
    console.log('✅ Visitors created: 3')

    // Seed Page Visits
    console.log('📄 Creating page visits...')
    await prisma.pageVisit.deleteMany() // Clear existing data
    
    // Create page visits for each visitor
    for (let i = 0; i < visitors.length; i++) {
      const visitor = visitors[i]
      
      // Home page visit
      await prisma.pageVisit.create({
        data: {
          visitorId: visitor.id,
          url: "https://toko-oleh-oleh-production.up.railway.app/",
          pageTitle: "Beranda - Toko Oleh-Oleh Nusantara",
          referrer: i === 0 ? "https://google.com" : i === 1 ? "https://facebook.com" : null,
          duration: 45 + (i * 10),
          bounced: false
        }
      })
      
      // Products page visit
      await prisma.pageVisit.create({
        data: {
          visitorId: visitor.id,
          url: "https://toko-oleh-oleh-production.up.railway.app/products",
          pageTitle: "Produk - Toko Oleh-Oleh Nusantara",
          referrer: "https://toko-oleh-oleh-production.up.railway.app/",
          duration: 120 + (i * 5),
          bounced: false
        }
      })
    }
    console.log('✅ Page visits created: 6')

    console.log('🎉 Missing data seeding completed successfully!')
    
    // Final count check
    const counts = {
      heroSlides: await prisma.heroSlide.count(),
      settings: await prisma.setting.count(),
      contacts: await prisma.contact.count(),
      notifications: await prisma.notification.count(),
      visitors: await prisma.visitor.count(),
      pageVisits: await prisma.pageVisit.count()
    }
    
    console.log('\n📊 Final counts:')
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Error seeding missing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedMissingData()
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
