import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedHeroSlides() {
  console.log('Seeding hero slides...')

  // Clear existing hero slides
  await prisma.heroSlide.deleteMany()

  // Create hero slides
  const heroSlides = [
    {
      title: 'Oleh-Oleh Khas Daerah',
      subtitle: 'Berkualitas Tinggi',
      description: 'Temukan berbagai macam oleh-oleh khas dari seluruh Indonesia. Pesan online, kirim ke seluruh nusantara dengan kualitas terjamin.',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #f97316, #dc2626)',
      textColor: '#ffffff',
      primaryButtonText: 'Lihat Produk',
      primaryButtonLink: '/products',
      secondaryButtonText: 'Jelajahi Kategori',
      secondaryButtonLink: '/categories',
      order: 1,
      isActive: true,
    },
    {
      title: 'Keripik Nusantara',
      subtitle: 'Renyah & Gurih',
      description: 'Nikmati kelezatan keripik tradisional dari berbagai daerah. Dibuat dengan bahan-bahan pilihan dan resep turun temurun.',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #10b981, #0d9488)',
      textColor: '#ffffff',
      primaryButtonText: 'Beli Sekarang',
      primaryButtonLink: '/products?category=keripik',
      secondaryButtonText: 'Lihat Detail',
      secondaryButtonLink: '/categories/keripik',
      order: 2,
      isActive: true,
    },
    {
      title: 'Bumbu Dapur Asli',
      subtitle: 'Cita Rasa Otentik',
      description: 'Lengkapi dapur Anda dengan bumbu-bumbu pilihan khas daerah. Buat masakan yang lebih lezat dengan bumbu asli Indonesia.',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #eab308, #f97316)',
      textColor: '#ffffff',
      primaryButtonText: 'Pesan Bumbu',
      primaryButtonLink: '/products?category=bumbu',
      secondaryButtonText: 'Lihat Resep',
      secondaryButtonLink: '/categories/bumbu',
      order: 3,
      isActive: true,
    },
    {
      title: 'Kue & Roti Tradisional',
      subtitle: 'Manis & Lembut',
      description: 'Rasakan kelezatan kue dan roti tradisional Indonesia. Dibuat fresh setiap hari dengan resep rahasia keluarga.',
      backgroundImage: null,
      backgroundColor: 'linear-gradient(to right, #ec4899, #9333ea)',
      textColor: '#ffffff',
      primaryButtonText: 'Order Kue',
      primaryButtonLink: '/products?category=kue-roti',
      secondaryButtonText: 'Katalog Lengkap',
      secondaryButtonLink: '/categories/kue-roti',
      order: 4,
      isActive: true,
    },
  ]

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({
      data: slide,
    })
    console.log(`Created hero slide: ${slide.title}`)
  }

  console.log('Hero slides seeding completed!')
}

async function main() {
  try {
    await seedHeroSlides()
  } catch (error) {
    console.error('Error seeding hero slides:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
