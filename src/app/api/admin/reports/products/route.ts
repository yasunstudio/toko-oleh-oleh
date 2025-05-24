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

    // Get product metrics
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    })
    const outOfStock = await prisma.product.count({
      where: { stock: 0 }
    })
    const lowStockItems = await prisma.product.count({
      where: { 
        stock: { 
          gt: 0,
          lte: 10 
        } 
      }
    })

    // Get order items data for the period
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

    // Calculate best sellers
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

    // Convert to array and sort for best sellers
    const salesArray = Array.from(productSales.values())
    const bestSellers = salesArray
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)
      .map(item => ({
        name: item.product.name,
        category: item.product.category.name,
        sold: item.totalSold,
        revenue: item.totalRevenue,
        stock: item.product.stock
      }))

    // Get worst performers (products with sales)
    const worstPerformers = salesArray
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 10)
      .map(item => ({
        name: item.product.name,
        category: item.product.category.name,
        sold: item.totalSold,
        revenue: item.totalRevenue,
        stock: item.product.stock
      }))

    // Get low stock items
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 20 }
      },
      include: {
        category: true
      },
      orderBy: {
        stock: 'asc'
      },
      take: 20
    })

    const lowStock = lowStockProducts.map(product => ({
      name: product.name,
      category: product.category.name,
      currentStock: product.stock,
      minStock: 10, // Default minimum stock
      status: product.stock === 0 
        ? 'critical' as const
        : product.stock <= 5 
          ? 'critical' as const
          : product.stock <= 10 
            ? 'warning' as const
            : 'normal' as const
    }))

    // Calculate category performance
    const categoryStats = new Map<string, {
      categoryName: string,
      products: number,
      totalSold: number,
      revenue: number
    }>()

    // Initialize with all categories
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

    // Add sales data
    orderItems.forEach(item => {
      const categoryId = item.product.categoryId
      if (categoryStats.has(categoryId)) {
        const existing = categoryStats.get(categoryId)!
        existing.totalSold += item.quantity
        existing.revenue += item.price * item.quantity
      }
    })

    const categoryPerformance = Array.from(categoryStats.values())
      .map(item => ({
        category: item.categoryName,
        products: item.products,
        totalSold: item.totalSold,
        revenue: item.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)

    const productData = {
      bestSellers,
      worstPerformers,
      lowStock,
      categoryPerformance,
      metrics: {
        totalProducts,
        activeProducts,
        outOfStock,
        lowStockItems
      }
    }

    return NextResponse.json(productData)

  } catch (error) {
    console.error('Error fetching product report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
