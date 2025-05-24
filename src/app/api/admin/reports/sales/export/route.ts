import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

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

    // Get comprehensive sales data
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
        user: true,
        orderItems: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Sales Summary
    const salesSummary = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Date': order.createdAt.toLocaleDateString('id-ID'),
      'Customer': order.user.name,
      'Email': order.user.email,
      'Total Amount': order.totalAmount,
      'Status': order.status,
      'Payment Status': order.paymentStatus,
      'Items Count': order.orderItems.length
    }))

    const salesSheet = XLSX.utils.json_to_sheet(salesSummary)
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Summary')

    // Sheet 2: Order Items Detail
    const orderItemsDetail: Array<{
      'Order Number': string
      'Date': string
      'Customer': string
      'Product': string
      'Category': string
      'Quantity': number
      'Unit Price': number
      'Total': number
    }> = []
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        orderItemsDetail.push({
          'Order Number': order.orderNumber,
          'Date': order.createdAt.toLocaleDateString('id-ID'),
          'Customer': order.user.name,
          'Product': item.product.name,
          'Category': item.product.category.name,
          'Quantity': item.quantity,
          'Unit Price': item.price,
          'Total': item.price * item.quantity
        })
      })
    })

    const itemsSheet = XLSX.utils.json_to_sheet(orderItemsDetail)
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Order Items')

    // Sheet 3: Daily Sales
    const dailySalesMap = new Map<string, { sales: number, orders: number }>()
    
    // Initialize all days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toLocaleDateString('id-ID')
      dailySalesMap.set(dateKey, { sales: 0, orders: 0 })
    }

    // Populate with actual data
    orders.forEach(order => {
      const dateKey = order.createdAt.toLocaleDateString('id-ID')
      const existing = dailySalesMap.get(dateKey) || { sales: 0, orders: 0 }
      existing.sales += order.totalAmount
      existing.orders += 1
      dailySalesMap.set(dateKey, existing)
    })

    const dailySales = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
      'Date': date,
      'Sales Amount': data.sales,
      'Number of Orders': data.orders,
      'Average Order Value': data.orders > 0 ? Math.round(data.sales / data.orders) : 0
    }))

    const dailySheet = XLSX.utils.json_to_sheet(dailySales)
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Sales')

    // Sheet 4: Category Performance
    const categoryMap = new Map<string, { sales: number, orders: number, quantity: number }>()
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const categoryName = item.product.category.name
        const existing = categoryMap.get(categoryName) || { sales: 0, orders: 0, quantity: 0 }
        existing.sales += item.price * item.quantity
        existing.quantity += item.quantity
        categoryMap.set(categoryName, existing)
      })
    })

    const categoryPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
      'Category': category,
      'Total Sales': data.sales,
      'Total Quantity': data.quantity,
      'Average Price': data.quantity > 0 ? Math.round(data.sales / data.quantity) : 0
    }))

    const categorySheet = XLSX.utils.json_to_sheet(categoryPerformance)
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Performance')

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    })

    // Create response with proper headers
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="sales-report-${period}days-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })

    return response

  } catch (error) {
    console.error('Error exporting sales report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
