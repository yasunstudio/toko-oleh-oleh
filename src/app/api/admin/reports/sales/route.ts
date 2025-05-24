import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get orders data for the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate conversion rate (simplified - orders/total visitors)
    // For now, we'll use a placeholder calculation
    const conversionRate = totalOrders > 0 ? Math.min(totalOrders * 0.1, 100) : 0

    // Generate daily sales data
    const dailySalesMap = new Map<string, { sales: number, orders: number }>()
    
    // Initialize all days in the period
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      dailySalesMap.set(dateKey, { sales: 0, orders: 0 })
    }

    // Populate with actual data
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const existing = dailySalesMap.get(dateKey) || { sales: 0, orders: 0 }
      existing.sales += order.totalAmount
      existing.orders += 1
      dailySalesMap.set(dateKey, existing)
    })

    const dailySales = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders
    }))

    // Generate monthly sales data
    const monthlyMap = new Map<string, { sales: number, orders: number }>()
    orders.forEach(order => {
      const monthKey = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
      const existing = monthlyMap.get(monthKey) || { sales: 0, orders: 0 }
      existing.sales += order.totalAmount
      existing.orders += 1
      monthlyMap.set(monthKey, existing)
    })

    const monthlySales = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      sales: data.sales,
      orders: data.orders,
      growth: 0 // Calculate growth percentage if needed
    }))

    // Calculate sales by category
    const categoryMap = new Map<string, number>()
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const categoryName = item.product.category.name
        const existing = categoryMap.get(categoryName) || 0
        categoryMap.set(categoryName, existing + (item.price * item.quantity))
      })
    })

    const totalCategorySales = Array.from(categoryMap.values()).reduce((sum, sales) => sum + sales, 0)
    const salesByCategory = Array.from(categoryMap.entries()).map(([category, sales]) => ({
      category,
      sales,
      percentage: totalCategorySales > 0 ? (sales / totalCategorySales) * 100 : 0
    }))

    // Calculate top products
    const productMap = new Map<string, { sales: number, quantity: number }>()
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productName = item.product.name
        const existing = productMap.get(productName) || { sales: 0, quantity: 0 }
        existing.sales += item.price * item.quantity
        existing.quantity += item.quantity
        productMap.set(productName, existing)
      })
    })

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        quantity: data.quantity
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)

    const salesData = {
      dailySales,
      monthlySales,
      salesByCategory,
      topProducts,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate
      }
    }

    return NextResponse.json(salesData)

  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
