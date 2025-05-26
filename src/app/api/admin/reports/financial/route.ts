import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)
    const endDate = now
    
    // Get previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)
    const previousEndDate = startDate

    // Calculate total revenue from completed orders
    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate previous period completed orders
    const previousCompletedOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate pending payments
    const pendingPayments = await prisma.order.findMany({
      where: {
        paymentStatus: {
          in: ['PENDING', 'PAID'],
        },
        status: {
          not: 'CANCELLED',
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate total revenue (current period)
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Calculate total revenue (previous period)
    const previousRevenue = previousCompletedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Calculate revenue growth
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Calculate total cost of goods sold (COGS)
    let totalCOGS = 0
    for (const order of completedOrders) {
      for (const item of order.orderItems) {
        // Assuming cost is 60% of selling price (you can adjust this or add a cost field to products)
        const itemCost = item.product.price * 0.6 * item.quantity
        totalCOGS += itemCost
      }
    }

    // Calculate previous period COGS
    let previousCOGS = 0
    for (const order of previousCompletedOrders) {
      for (const item of order.orderItems) {
        const itemCost = item.product.price * 0.6 * item.quantity
        previousCOGS += itemCost
      }
    }

    // Calculate gross profit
    const grossProfit = totalRevenue - totalCOGS
    const previousGrossProfit = previousRevenue - previousCOGS
    
    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const previousProfitMargin = previousRevenue > 0 ? (previousGrossProfit / previousRevenue) * 100 : 0
    const profitMarginGrowth = previousProfitMargin > 0 ? profitMargin - previousProfitMargin : 0

    const totalPendingAmount = pendingPayments.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate average order value
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
    const previousAverageOrderValue = previousCompletedOrders.length > 0 ? previousRevenue / previousCompletedOrders.length : 0
    const averageOrderGrowth = previousAverageOrderValue > 0 ? ((averageOrderValue - previousAverageOrderValue) / previousAverageOrderValue) * 100 : 0

    // Daily revenue data for chart
    const dailyRevenueMap = new Map<string, number>()
    const dailyCOGSMap = new Map<string, number>()
    
    // Initialize all dates in period with 0
    for (let i = 0; i < parseInt(period); i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split('T')[0]
      dailyRevenueMap.set(dateString, 0)
      dailyCOGSMap.set(dateString, 0)
    }

    // Calculate daily revenue and COGS
    for (const order of completedOrders) {
      const dateString = order.createdAt.toISOString().split('T')[0]
      const currentRevenue = dailyRevenueMap.get(dateString) || 0
      dailyRevenueMap.set(dateString, currentRevenue + order.totalAmount)

      // Calculate order COGS
      let orderCOGS = 0
      for (const item of order.orderItems) {
        orderCOGS += item.product.price * 0.6 * item.quantity
      }
      const currentCOGS = dailyCOGSMap.get(dateString) || 0
      dailyCOGSMap.set(dateString, currentCOGS + orderCOGS)
    }

    // Convert to array for chart
    const dailyFinancialData = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => {
      const cogs = dailyCOGSMap.get(date) || 0
      const profit = revenue - cogs
      return {
        date,
        revenue,
        cogs,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      }
    }).sort((a, b) => a.date.localeCompare(b.date))

    // Monthly revenue breakdown (for longer periods)
    const monthlyRevenueMap = new Map<string, number>()
    for (const order of completedOrders) {
      const monthKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
      const currentRevenue = monthlyRevenueMap.get(monthKey) || 0
      monthlyRevenueMap.set(monthKey, currentRevenue + order.totalAmount)
    }

    const monthlyFinancialData = Array.from(monthlyRevenueMap.entries()).map(([month, revenue]) => ({
      month,
      revenue
    })).sort((a, b) => a.month.localeCompare(b.month))

    // Payment method breakdown (simplified since no payment method field in schema)
    const paymentMethodData = [
      {
        method: 'Transfer Bank',
        count: completedOrders.length,
        amount: totalRevenue,
        percentage: 100
      }
    ]

    // Top revenue generating products
    const productRevenueMap = new Map<string, { productId: string, productName: string, revenue: number, quantity: number }>()
    for (const order of completedOrders) {
      for (const item of order.orderItems) {
        const current = productRevenueMap.get(item.productId) || {
          productId: item.productId,
          productName: item.product.name,
          revenue: 0,
          quantity: 0
        }
        productRevenueMap.set(item.productId, {
          ...current,
          revenue: current.revenue + (item.price * item.quantity),
          quantity: current.quantity + item.quantity
        })
      }
    }

    const topRevenueProducts = Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Expense categories (simplified - you can expand this based on your needs)
    const expenses = [
      { category: 'Operasional', amount: totalCOGS * 0.1, description: 'Biaya operasional' },
      { category: 'Marketing', amount: totalRevenue * 0.05, description: 'Biaya pemasaran' },
      { category: 'Pengiriman', amount: completedOrders.length * 15000, description: 'Biaya pengiriman' }
    ]
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) + totalCOGS
    const netProfit = totalRevenue - totalExpenses
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Financial summary
    const overview = {
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfit,
      profitMargin,
      netProfitMargin,
      averageOrderValue,
      totalPendingAmount,
      pendingOrdersCount: pendingPayments.length,
      revenueGrowth,
      profitMarginGrowth,
      averageOrderGrowth
    }

    return NextResponse.json({
      overview,
      dailyFinancialData,
      monthlyFinancialData,
      paymentMethodData,
      topRevenueProducts,
      expenses,
      pendingPayments: pendingPayments.map(order => ({
        id: order.id,
        customerName: order.user?.name || 'Unknown',
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      })),
      period: parseInt(period)
    })

  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial report data' },
      { status: 500 }
    )
  }
}
