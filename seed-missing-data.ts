import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMissingData() {
  try {
    console.log('🌱 Seeding missing data...\n');

    // 1. Add Hero Slides
    console.log('🎠 Adding Hero Slides...');
    const heroSlidesData = [
      {
        title: "Selamat Datang di Toko Oleh-Oleh Nusantara",
        subtitle: "Jelajahi Kelezatan Autentik dari Seluruh Indonesia",
        description: "Temukan beragam produk oleh-oleh terbaik dari berbagai daerah di Indonesia. Dari sambal tradisional hingga camilan khas nusantara.",
        image: "/uploads/hero-slide-1.jpg",
        buttonText: "Jelajahi Produk",
        buttonLink: "/products",
        isActive: true,
        order: 1
      },
      {
        title: "Rasa Autentik Nusantara",
        subtitle: "Cita Rasa Tradisional yang Terjaga",
        description: "Setiap produk dipilih langsung dari produsen lokal terpercaya untuk menjamin kualitas dan keaslian rasa.",
        image: "/uploads/hero-slide-2.jpg",
        buttonText: "Lihat Kategori",
        buttonLink: "/categories",
        isActive: true,
        order: 2
      },
      {
        title: "Gratis Ongkir Se-Indonesia",
        subtitle: "Pengiriman Aman & Terpercaya",
        description: "Dapatkan gratis ongkos kirim untuk pembelian minimal Rp 100.000. Produk dikemas dengan aman dan higienis.",
        image: "/uploads/hero-slide-3.jpg",
        buttonText: "Belanja Sekarang",
        buttonLink: "/products",
        isActive: true,
        order: 3
      }
    ];

    for (const slide of heroSlidesData) {
      await prisma.heroSlide.create({ data: slide });
    }
    console.log(`✅ Added ${heroSlidesData.length} hero slides`);

    // 2. Add Settings
    console.log('⚙️ Adding Settings...');
    const settingsData = [
      { key: 'store_name', value: 'Toko Oleh-Oleh Nusantara' },
      { key: 'store_description', value: 'Pusat oleh-oleh khas nusantara terlengkap dan terpercaya' },
      { key: 'store_email', value: 'info@tokooleholeh.com' },
      { key: 'store_phone', value: '+62 821 1234 5678' },
      { key: 'store_address', value: 'Jl. Nusantara No. 123, Jakarta Pusat, DKI Jakarta' },
      { key: 'min_order_amount', value: '25000' },
      { key: 'free_shipping_min', value: '100000' },
      { key: 'shipping_cost', value: '15000' },
      { key: 'store_open_hours', value: '08:00 - 20:00 WIB' },
      { key: 'whatsapp_number', value: '+6282112345678' },
      { key: 'instagram_url', value: 'https://instagram.com/tokooleholeh' },
      { key: 'facebook_url', value: 'https://facebook.com/tokooleholeh' },
      { key: 'store_logo', value: '/uploads/store-logo.png' },
      { key: 'currency', value: 'IDR' },
      { key: 'tax_rate', value: '0' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'allow_registration', value: 'true' },
      { key: 'email_notifications', value: 'true' },
      { key: 'sms_notifications', value: 'false' },
      { key: 'store_status', value: 'active' }
    ];

    for (const setting of settingsData) {
      await prisma.setting.create({ data: setting });
    }
    console.log(`✅ Added ${settingsData.length} settings`);

    // 3. Add Sample Contact Messages
    console.log('📧 Adding Sample Contact Messages...');
    const contactData = [
      {
        name: "Budi Santoso",
        email: "budi@example.com",
        phone: "+62 812 3456 7890",
        message: "Apakah ada diskon untuk pembelian dalam jumlah besar? Saya ingin memesan untuk acara kantor.",
        status: "PENDING"
      },
      {
        name: "Sari Dewi",
        email: "sari@example.com",
        phone: "+62 856 7890 1234",
        message: "Halo, saya ingin tanya tentang ketersediaan sambal roa. Apakah bisa dikirim ke Surabaya?",
        status: "REPLIED"
      },
      {
        name: "Ahmad Rahman",
        email: "ahmad@example.com",
        phone: "+62 878 5432 1098",
        message: "Mohon info cara menjadi reseller produk-produk oleh-oleh ini. Terima kasih.",
        status: "PENDING"
      }
    ];

    for (const contact of contactData) {
      await prisma.contact.create({ data: contact });
    }
    console.log(`✅ Added ${contactData.length} contact messages`);

    // 4. Add Sample Notifications
    console.log('🔔 Adding Sample Notifications...');
    const users = await prisma.user.findMany();
    const customers = users.filter(u => u.role === 'CUSTOMER');

    if (customers.length > 0) {
      const notificationsData = [
        {
          userId: customers[0].id,
          title: "Selamat Datang!",
          message: "Terima kasih telah bergabung dengan Toko Oleh-Oleh Nusantara. Jelajahi produk terbaik kami!",
          type: "GENERAL",
          status: "UNREAD"
        },
        {
          userId: customers[0].id,
          title: "Promo Spesial",
          message: "Dapatkan diskon 15% untuk pembelian pertama dengan kode WELCOME15",
          type: "GENERAL",
          status: "UNREAD"
        }
      ];

      if (customers.length > 1) {
        notificationsData.push({
          userId: customers[1].id,
          title: "Pesanan Berhasil",
          message: "Pesanan Anda telah berhasil diproses dan akan segera dikirim",
          type: "ORDER_STATUS",
          status: "READ"
        });
      }

      for (const notification of notificationsData) {
        await prisma.notification.create({ data: notification });
      }
      console.log(`✅ Added ${notificationsData.length} notifications`);
    }

    // 5. Add Sample Visitor Data
    console.log('👁️ Adding Sample Visitor Data...');
    const today = new Date();
    const visitorData = [];

    // Generate visitor data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate 3-10 random visitors per day
      const visitorCount = Math.floor(Math.random() * 8) + 3;
      
      for (let j = 0; j < visitorCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const visitTime = new Date(date);
        visitTime.setHours(hour, minute, 0, 0);

        visitorData.push({
          sessionId: `session_${Date.now()}_${i}_${j}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          country: "Indonesia",
          city: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"][Math.floor(Math.random() * 5)],
          createdAt: visitTime
        });
      }
    }

    for (const visitor of visitorData) {
      await prisma.visitor.create({ data: visitor });
    }
    console.log(`✅ Added ${visitorData.length} visitors`);

    // 6. Add Sample Page Visits
    console.log('📄 Adding Sample Page Visits...');
    const visitors = await prisma.visitor.findMany();
    const pages = ['/', '/products', '/categories', '/about', '/contact'];
    const pageVisitData = [];

    visitors.forEach(visitor => {
      // Each visitor visits 1-3 pages
      const pageCount = Math.floor(Math.random() * 3) + 1;
      const visitedPages = pages.sort(() => 0.5 - Math.random()).slice(0, pageCount);
      
      visitedPages.forEach((page, index) => {
        const visitTime = new Date(visitor.createdAt);
        visitTime.setMinutes(visitTime.getMinutes() + (index * 2)); // 2 minutes between pages
        
        pageVisitData.push({
          visitorId: visitor.id,
          page: page,
          duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
          createdAt: visitTime
        });
      });
    });

    for (const pageVisit of pageVisitData) {
      await prisma.pageVisit.create({ data: pageVisit });
    }
    console.log(`✅ Added ${pageVisitData.length} page visits`);

    console.log('\n🎉 All missing data has been seeded successfully!');
    
    // Final count check
    console.log('\n📊 Final count check:');
    const finalCounts = {
      heroSlides: await prisma.heroSlide.count(),
      contacts: await prisma.contact.count(),
      notifications: await prisma.notification.count(),
      visitors: await prisma.visitor.count(),
      pageVisits: await prisma.pageVisit.count(),
      settings: await prisma.setting.count(),
    };

    Object.entries(finalCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMissingData();
