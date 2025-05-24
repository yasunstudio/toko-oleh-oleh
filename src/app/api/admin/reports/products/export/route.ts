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

    // Get comprehensive product data
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: {
            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
          }
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    // Calculate product sales
    const productSales = new Map<string, {
      product: any,
      totalSold: number,
      totalRevenue: number
    }>()

    orderItems.forEach(item => {
      const productId = item.productId
      if (productSales.has(productId)) {
        const existing = productSales.get(productId)!
        existing.totalSold += item.quantity
        existing.totalRevenue += item.price * item.quantity
      } else {
        productSales.set(productId, {
          product: item.product,
          totalSold: item.quantity,
          totalRevenue: item.price * item.quantity
        })
      }
    })

    // Get all products for comprehensive report
    const allProducts = await prisma.product.findMany({
      include: {
        category: true
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Product Overview
    const productOverview = allProducts.map(product => {
      const sales = productSales.get(product.id)
      return {
        'Product Name': product.name,
        'Category': product.category.name,
        'Current Price': product.price,
        'Stock': product.stock,
        'Status': product.isActive ? 'Active' : 'Inactive',
        'Units Sold': sales?.totalSold || 0,
        'Revenue': sales?.totalRevenue || 0,
        'Stock Status': product.stock === 0 
          ? 'Out of Stock' 
          : product.stock <= 5 
            ? 'Critical' 
            : product.stock <= 10 
              ? 'Low Stock' 
              : 'Normal'
      }
    })

    const productSheet = XLSX.utils.json_to_sheet(productOverview)
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Product Overview')

    // Sheet 2: Best Sellers
    const bestSellers = Array.from(productSales.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 20)
      .map((item, index) => ({
        'Rank': index + 1,
        'Product Name': item.product.name,
        'Category': item.product.category.name,
        'Units Sold': item.totalSold,
        'Revenue': item.totalRevenue,
        'Current Stock': item.product.stock,
        'Price': item.product.price
      }))

    const bestSellersSheet = XLSX.utils.json_to_sheet(bestSellers)
    XLSX.utils.book_append_sheet(workbook, bestSellersSheet, 'Best Sellers')

    // Sheet 3: Low Stock Items
    const lowStockItems = allProducts
      .filter(product => product.stock <= 20)
      .sort((a, b) => a.stock - b.stock)
      .map(product => {
        const sales = productSales.get(product.id)
        return {
          'Product Name': product.name,
          'Category': product.category.name,
          'Current Stock': product.stock,
          'Status': product.stock === 0 
            ? 'Out of Stock' 
            : product.stock <= 5 
              ? 'Critical' 
              : 'Low Stock',
          'Units Sold': sales?.totalSold || 0,
          'Price': product.price
        }
      })

    const lowStockSheet = XLSX.utils.json_to_sheet(lowStockItems)
    XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Low Stock')

    // Sheet 4: Category Performance
    const categoryStats = new Map<string, {
      categoryName: string,
      products: number,
      totalSold: number,
      revenue: number
    }>()

    const allCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    allCategories.forEach(category => {
      categoryStats.set(category.id, {
        categoryName: category.name,
        products: category._count.products,
        totalSold: 0,
        revenue: 0
      })
    })

    orderItems.forEach(item => {
      const categoryId = item.product.categoryId
      if (categoryStats.has(categoryId)) {
        const existing = categoryStats.get(categoryId)!
        existing.totalSold += item.quantity
        existing.revenue += item.price * item.quantity
      }
    })

    const categoryPerformance = Array.from(categoryStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((item, index) => ({
        'Rank': index + 1,
        'Category': item.categoryName,
        'Total Products': item.products,
        'Units Sold': item.totalSold,
        'Revenue': item.revenue,
        'Avg Revenue per Product': item.products > 0 ? Math.round(item.revenue / item.products) : 0
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
        'Content-Disposition': `attachment; filename="product-report-${period}days-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })

    return response

  } catch (error) {
    console.error('Error exporting product report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
