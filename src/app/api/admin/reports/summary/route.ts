import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate date ranges
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get current month data
    const [
      currentSales,
      currentOrders,
      currentCustomers,
      totalProducts
    ] = await Promise.all([
      // Total sales this month
      prisma.orderItem.aggregate({
        where: {
          order: {
            createdAt: {
              gte: currentMonthStart
            },
            status: {
              in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
            }
          }
        },
        _sum: {
          price: true
        }
      }),

      // Total orders this month
      prisma.order.count({
        where: {
          createdAt: {
            gte: currentMonthStart
          },
          status: {
            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
          }
        }
      }),

      // New customers this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentMonthStart
          },
          role: 'CUSTOMER'
        }
      }),

      // Total products
      prisma.product.count()
    ])

    // Get last month data for comparison
    const [
      lastSales,
      lastOrders,
      lastCustomers,
      lastMonthProducts
    ] = await Promise.all([
      // Total sales last month
      prisma.orderItem.aggregate({
        where: {
          order: {
            createdAt: {
              gte: lastMonthStart,
              lte: lastMonthEnd
            },
            status: {
              in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
            }
          }
        },
        _sum: {
          price: true
        }
      }),

      // Total orders last month
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          },
          status: {
            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
          }
        }
      }),

      // New customers last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          },
          role: 'CUSTOMER'
        }
      }),

      // Products count at start of last month
      prisma.product.count({
        where: {
          createdAt: {
            lt: lastMonthStart
          }
        }
      })
    ])

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const totalSales = currentSales._sum.price || 0
    const totalOrders = currentOrders
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    })

    const lastTotalSales = lastSales._sum.price || 0
    const lastTotalOrders = lastOrders
    const lastTotalCustomers = lastCustomers

    const summary = {
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      salesGrowth: calculateGrowth(totalSales, lastTotalSales),
      orderGrowth: calculateGrowth(totalOrders, lastTotalOrders),
      customerGrowth: calculateGrowth(currentCustomers, lastTotalCustomers),
      productGrowth: calculateGrowth(totalProducts, lastMonthProducts)
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error fetching report summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
