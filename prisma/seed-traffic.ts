import { PrismaClient, DeviceType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Pages in the application
const pages = [
  { url: '/', title: 'Beranda | Toko Oleh-Oleh' },
  { url: '/products', title: 'Semua Produk | Toko Oleh-Oleh' },
  { url: '/categories', title: 'Kategori | Toko Oleh-Oleh' },
  { url: '/products/keripik-pisang-coklat', title: 'Keripik Pisang Coklat | Toko Oleh-Oleh' },
  { url: '/products/keripik-singkong-balado', title: 'Keripik Singkong Balado | Toko Oleh-Oleh' },
  { url: '/cart', title: 'Keranjang Belanja | Toko Oleh-Oleh' },
  { url: '/checkout', title: 'Checkout | Toko Oleh-Oleh' },
  { url: '/about', title: 'Tentang Kami | Toko Oleh-Oleh' },
]

// Possible referrers
const referrers = [
  null, // Direct
  'https://www.google.com/search?q=toko+oleh+oleh',
  'https://facebook.com/shared_link',
  'https://instagram.com/story',
  'https://blog.culinary.com/best-snacks',
]

// User agents for different device types
const userAgents = {
  DESKTOP: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15',
  ],
  MOBILE: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.70 Mobile Safari/537.36',
  ],
  TABLET: [
    'Mozilla/5.0 (iPad; CPU OS 15_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 12; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.70 Safari/537.36',
  ],
}

// Function to generate a random number between min and max
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate a random item from an array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Function to generate a random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate traffic data for the past 90 days
async function seedTrafficData() {
  console.log('Seeding traffic data...')
  
  // Date ranges
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 90) // 90 days ago
  
  // Generate between 500-1000 visitors
  const visitorCount = randomInt(500, 1000)
  console.log(`Generating ${visitorCount} visitors...`)
  
  for (let i = 0; i < visitorCount; i++) {
    // Random device type
    const deviceTypeOptions: DeviceType[] = ['DESKTOP', 'MOBILE', 'TABLET']
    const deviceType = randomItem(deviceTypeOptions) as keyof typeof userAgents;
    
    // Create visitor
    const visitor = await prisma.visitor.create({
      data: {
        sessionId: uuidv4(),
        ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
        userAgent: randomItem(userAgents[deviceType]),
        device: deviceType,
        firstVisit: randomDate(startDate, endDate),
        lastVisit: endDate, // Last visit is always today
      },
    })
    
    // Generate between 1-8 page visits for this visitor
    const visitCount = randomInt(1, 8)
    
    // First page is usually the homepage
    const isDirectVisit = Math.random() < 0.6 // 60% of visits are direct
    
    // Create first page visit
    let lastPage = '/'
    let lastVisitTime = visitor.firstVisit
    let bounced = visitCount === 1 // Bounced if there's only 1 page visit
    
    await prisma.pageVisit.create({
      data: {
        url: lastPage,
        pageTitle: 'Beranda | Toko Oleh-Oleh',
        timestamp: lastVisitTime,
        referrer: isDirectVisit ? null : randomItem(referrers),
        duration: randomInt(10, 300), // 10s to 5min
        bounced,
        visitorId: visitor.id,
      },
    })
    
    // Create additional page visits
    for (let j = 1; j < visitCount; j++) {
      // Next page is based on current page with some randomness
      let nextPage = lastPage
      
      if (lastPage === '/') {
        nextPage = randomItem(['/products', '/categories', '/about'])
      } else if (lastPage === '/products') {
        nextPage = randomItem(['/products/keripik-pisang-coklat', '/products/keripik-singkong-balado', '/categories'])
      } else if (lastPage === '/categories') {
        nextPage = randomItem(['/products', '/products/keripik-pisang-coklat', '/products/keripik-singkong-balado'])
      } else if (lastPage.startsWith('/products/')) {
        nextPage = randomItem(['/cart', '/products', '/categories'])
      } else if (lastPage === '/cart') {
        nextPage = randomItem(['/checkout', '/products', '/'])
      }
      
      // Time spent on page - between 10s and 10min
      const duration = randomInt(10, 600)
      
      // Calculate next visit timestamp
      lastVisitTime = new Date(lastVisitTime.getTime() + duration * 1000)
      
      // Don't create page visits that would be after the current date
      if (lastVisitTime > endDate) {
        break
      }
      
      // Create the page visit
      const pageInfo = pages.find(p => p.url === nextPage) || { url: nextPage, title: 'Unknown Page' }
      await prisma.pageVisit.create({
        data: {
          url: nextPage,
          pageTitle: pageInfo.title,
          timestamp: lastVisitTime,
          referrer: lastPage,
          duration: j === visitCount - 1 ? null : duration, // Last page visit might not have a duration
          bounced: false, // Not bounced since they navigated from another page
          visitorId: visitor.id,
        },
      })
      
      lastPage = nextPage
    }
    
    if (i % 50 === 0) {
      console.log(`Created ${i} visitors...`)
    }
  }
  
  console.log('Traffic data seeding completed!')
}

async function main() {
  try {
    await seedTrafficData()
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
