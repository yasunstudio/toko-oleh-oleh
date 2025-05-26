import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Get dashboard insights in parallel
    const [
      pendingOrders,
      lowStockProducts,
      readyToShip,
      recentActivities
    ] = await Promise.all([
      // Pesanan menunggu (PENDING status or PAID payment waiting for confirmation)
      prisma.order.count({
        where: {
          OR: [
            { status: 'PENDING' },
            { 
              status: 'CONFIRMED',
              paymentStatus: 'PAID'
            }
          ]
        }
      }),
      
      // Produk dengan stok rendah (< 10)
      prisma.product.count({
        where: {
          isActive: true,
          stock: {
            lt: 10
          }
        }
      }),
      
      // Pesanan siap kirim (PROCESSING status)
      prisma.order.count({
        where: {
          status: 'PROCESSING'
        }
      }),

      // Recent activities - mix of orders, users, and products
      Promise.all([
        // Recent orders
        prisma.order.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }),
        
        // Recent customers
        prisma.user.findMany({
          take: 2,
          orderBy: { createdAt: 'desc' },
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          select: {
            name: true,
            createdAt: true
          }
        }),

        // Low stock products
        prisma.product.findMany({
          take: 2,
          where: {
            isActive: true,
            stock: {
              lt: 10
            }
          },
          select: {
            name: true,
            stock: true
          }
        })
      ])
    ])

    // Format recent activities
    const [recentOrders, recentCustomers, lowStockItems] = recentActivities
    
    const activities = [
      ...recentOrders.map(order => ({
        action: `Pesanan baru #${order.orderNumber} diterima`,
        time: formatTimeAgo(order.createdAt),
        type: 'order' as const
      })),
      ...recentCustomers.map(customer => ({
        action: `Pelanggan baru "${customer.name}" mendaftar`,
        time: formatTimeAgo(customer.createdAt),
        type: 'user' as const
      })),
      ...lowStockItems.map(product => ({
        action: `Produk "${product.name}" stok rendah (${product.stock})`,
        time: 'Hari ini',
        type: 'alert' as const
      }))
    ].sort((a, b) => {
      // Sort by time, newest first
      if (a.time.includes('menit') && b.time.includes('menit')) {
        const aMinutes = parseInt(a.time.split(' ')[0])
        const bMinutes = parseInt(b.time.split(' ')[0])
        return aMinutes - bMinutes
      }
      return a.time.localeCompare(b.time)
    }).slice(0, 4)

    return NextResponse.json({
      pendingOrders,
      lowStockProducts,
      readyToShip,
      recentActivities: activities
    })
  } catch (error) {
    console.error('Error fetching dashboard insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard insights' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Baru saja'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} jam yang lalu`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} hari yang lalu`
  }
}
