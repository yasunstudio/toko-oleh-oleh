import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)
    
    // Get previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER'
      }
    })

    const previousTotalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          lt: startDate
        }
      }
    })

    // New customers in current period
    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: startDate
        }
      }
    })

    const previousNewCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    // Active customers (customers who made orders in the period)
    const activeCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    })

    const previousActiveCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: {
              gte: previousStartDate,
              lt: startDate
            }
          }
        }
      }
    })

    // Customer acquisition over time (daily for last 30 days)
    const acquisitionData = []
    for (let i = parseInt(period); i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const count = await prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      acquisitionData.push({
        date: date.toISOString().split('T')[0],
        customers: count
      })
    }

    // Top customers by order count
    const topCustomers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: {
        orders: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // Calculate total spent for each customer
    const topCustomersWithSpent = topCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      orderCount: customer._count.orders,
      totalSpent: customer.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    }))

    // Customer segments by order frequency
    const customerSegments = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN order_count = 0 THEN 'Tidak Aktif'
          WHEN order_count = 1 THEN 'Baru'
          WHEN order_count BETWEEN 2 AND 5 THEN 'Reguler'
          WHEN order_count > 5 THEN 'VIP'
        END as segment,
        COUNT(*) as count
      FROM (
        SELECT u.id, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.userId
        WHERE u.role = 'CUSTOMER'
        GROUP BY u.id
      ) customer_orders
      GROUP BY segment
    ` as Array<{ segment: string; count: bigint }>

    const segmentData = customerSegments.map(segment => ({
      segment: segment.segment,
      count: Number(segment.count)
    }))

    // Customer lifetime value
    const avgOrderValue = await prisma.order.aggregate({
      _avg: {
        totalAmount: true
      }
    })

    const avgOrdersPerCustomer = totalCustomers > 0 ? 
      (await prisma.order.count()) / totalCustomers : 0

    const customerLifetimeValue = (avgOrderValue._avg?.totalAmount || 0) * avgOrdersPerCustomer

    // Retention rate (customers who made more than one order)
    const customersWithMultipleOrders = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {}
        }
      }
    })

    const customersWhoMadeOrders = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {}
        }
      }
    })

    const retentionRate = customersWhoMadeOrders > 0 ? 
      (customersWithMultipleOrders / customersWhoMadeOrders) * 100 : 0

    // Previous period retention for comparison
    const previousCustomersWithOrders = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: {
          some: {
            createdAt: {
              gte: previousStartDate,
              lt: startDate
            }
          }
        }
      }
    })

    // Calculate percentage changes
    const newCustomersChange = previousNewCustomers > 0 ? 
      ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 : 0

    const activeCustomersChange = previousActiveCustomers > 0 ? 
      ((activeCustomers - previousActiveCustomers) / previousActiveCustomers) * 100 : 0

    const totalCustomersChange = previousTotalCustomers > 0 ? 
      ((totalCustomers - previousTotalCustomers) / previousTotalCustomers) * 100 : 0

    return NextResponse.json({
      overview: {
        totalCustomers,
        newCustomers,
        activeCustomers,
        retentionRate: Math.round(retentionRate * 100) / 100,
        customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
        changes: {
          totalCustomers: Math.round(totalCustomersChange * 100) / 100,
          newCustomers: Math.round(newCustomersChange * 100) / 100,
          activeCustomers: Math.round(activeCustomersChange * 100) / 100,
          retentionRate: 0 // Calculate if needed
        }
      },
      acquisitionData,
      topCustomers: topCustomersWithSpent,
      segments: segmentData,
      period: parseInt(period)
    })

  } catch (error) {
    console.error('Error generating customer report:', error)
    return NextResponse.json(
      { error: 'Failed to generate customer report' },
      { status: 500 }
    )
  }
}
