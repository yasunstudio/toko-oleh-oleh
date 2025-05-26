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

    // Get current month start date
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get stats in parallel
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      thisMonthOrders,
      recentOrders,
      topProductsData
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),
      prisma.product.count({
        where: { isActive: true }
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { 
          paymentStatus: 'VERIFIED',
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { 
          OR: [
            { status: 'PENDING' },
            { paymentStatus: 'PAID' }
          ]
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          }
        }
      }),
      // Get top selling products for current month
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: {
              gte: startOfMonth
            },
            status: {
              not: 'CANCELLED'
            }
          }
        },
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ])

    // Get product details for top selling products with their first image
    const topProducts = await prisma.product.findMany({
      where: {
        id: {
          in: topProductsData.map(p => p.productId)
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: {
          select: {
            url: true
          },
          take: 1
        }
      }
    })

    // Combine sales data with product details
    const topProductsWithSales = topProducts.map(product => {
      const sales = topProductsData.find(p => p.productId === product.id)?._sum?.quantity || 0
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url || null,
        sales
      }
    }).sort((a, b) => b.sales - a.sales)

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      thisMonthOrders,
      recentOrders,
      topProducts: topProductsWithSales
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil statistik' },
      { status: 500 }
    )
  }
}