import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMoreHeroSlides() {
  console.log('Adding more hero slides for demo...')

  // Add promotional slides
  const newSlides = [
    {
      title: 'Flash Sale Weekend',
      subtitle: 'Diskon hingga 50%',
      description: 'Dapatkan diskon besar-besaran untuk semua produk pilihan. Hanya berlaku sampai akhir weekend!',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #ef4444, #ea580c)',
      textColor: '#ffffff',
      primaryButtonText: 'Belanja Sekarang',
      primaryButtonLink: '/products?sale=true',
      secondaryButtonText: 'Lihat Promo',
      secondaryButtonLink: '/promotions',
      order: 5,
      isActive: true,
    },
    {
      title: 'Produk Terbaru',
      subtitle: 'Fresh dari Daerah',
      description: 'Koleksi terbaru produk oleh-oleh khas daerah yang baru saja tiba. Rasakan cita rasa autentik Indonesia.',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #06b6d4, #2563eb)',
      textColor: '#ffffff',
      primaryButtonText: 'Lihat Produk Baru',
      primaryButtonLink: '/products?new=true',
      secondaryButtonText: 'Katalog Lengkap',
      secondaryButtonLink: '/products',
      order: 6,
      isActive: false, // Initially inactive
    },
    {
      title: 'Paket Lebaran Special',
      subtitle: 'Lengkapi Momen Spesial',
      description: 'Paket hemat berisi berbagai oleh-oleh pilihan untuk merayakan momen lebaran bersama keluarga.',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #10b981, #059669)',
      textColor: '#ffffff',
      primaryButtonText: 'Pesan Paket',
      primaryButtonLink: '/products?category=paket-lebaran',
      secondaryButtonText: 'Info Lengkap',
      secondaryButtonLink: '/categories/paket-lebaran',
      order: 7,
      isActive: true,
    }
  ]

  for (const slide of newSlides) {
    await prisma.heroSlide.create({
      data: slide,
    })
    console.log(`✅ Added hero slide: ${slide.title}`)
  }

  console.log('✨ Additional hero slides added successfully!')
  
  // Show current count
  const totalSlides = await prisma.heroSlide.count()
  const activeSlides = await prisma.heroSlide.count({ where: { isActive: true } })
  
  console.log(`📊 Total slides: ${totalSlides}`)
  console.log(`🟢 Active slides: ${activeSlides}`)
  console.log(`🔴 Inactive slides: ${totalSlides - activeSlides}`)
}

async function main() {
  try {
    await addMoreHeroSlides()
  } catch (error) {
    console.error('Error adding hero slides:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
