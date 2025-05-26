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

    // Total stock
    const totalStock = await prisma.product.aggregate({
      _sum: {
        stock: true
      },
      where: {
        isActive: true
      }
    })

    // Low stock products (stock <= 10)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: 10,
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        stock: 'asc'
      }
    })

    // Out of stock products
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: 0
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Top stock products
    const topStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        stock: 'desc'
      },
      take: 10
    })

    // Inventory value
    const inventoryValue = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        stock: true,
        price: true
      }
    })

    const totalInventoryValue = inventoryValue.reduce((sum, product) => {
      return sum + (product.stock * product.price)
    }, 0)

    // Stock by category
    const stockByCategory = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        products: {
          where: {
            isActive: true
          },
          select: {
            stock: true,
            price: true
          }
        }
      }
    })

    const categoryStockData = stockByCategory.map(category => {
      const totalCategoryStock = category.products.reduce((sum, product) => sum + product.stock, 0)
      const totalCategoryValue = category.products.reduce((sum, product) => sum + (product.stock * product.price), 0)
      
      return {
        category: category.name,
        totalStock: totalCategoryStock,
        totalValue: totalCategoryValue,
        productCount: category.products.length
      }
    }).filter(cat => cat.totalStock > 0)

    // Stock movement (products that had stock changes based on orders)
    const recentOrders = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate
          }
        }
      },
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            stock: true
          }
        }
      }
    })

    // Calculate stock movement
    const stockMovement = recentOrders.reduce((acc, item) => {
      const productId = item.product.id
      if (!acc[productId]) {
        acc[productId] = {
          productId: productId,
          productName: item.product.name,
          currentStock: item.product.stock,
          totalSold: 0
        }
      }
      acc[productId].totalSold += item.quantity
      return acc
    }, {} as Record<string, any>)

    const stockMovementData = Object.values(stockMovement)
      .sort((a: any, b: any) => b.totalSold - a.totalSold)
      .slice(0, 10)

    // Stock alerts (products that need attention)
    const stockAlerts = [
      ...outOfStockProducts.map(product => ({
        type: 'out_of_stock',
        message: `${product.name} habis stok`,
        severity: 'high',
        product: product
      })),
      ...lowStockProducts.map(product => ({
        type: 'low_stock',
        message: `${product.name} stok rendah (${product.stock} tersisa)`,
        severity: 'medium',
        product: product
      }))
    ]

    // Calculate trends (simplified - comparing current vs previous period sales impact on stock)
    const previousOrders = await prisma.orderItem.aggregate({
      _sum: {
        quantity: true
      },
      where: {
        order: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }
    })

    const currentOrders = await prisma.orderItem.aggregate({
      _sum: {
        quantity: true
      },
      where: {
        order: {
          createdAt: {
            gte: startDate
          }
        }
      }
    })

    const stockMovementTrend = previousOrders._sum.quantity && currentOrders._sum.quantity ? 
      ((currentOrders._sum.quantity - previousOrders._sum.quantity) / previousOrders._sum.quantity) * 100 : 0

    return NextResponse.json({
      overview: {
        totalStock: totalStock._sum.stock || 0,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalInventoryValue: totalInventoryValue,
        stockMovementTrend: Math.round(stockMovementTrend * 100) / 100
      },
      lowStockProducts,
      outOfStockProducts,
      topStockProducts,
      categoryStockData,
      stockMovementData,
      stockAlerts,
      period: parseInt(period)
    })

  } catch (error) {
    console.error('Error generating inventory report:', error)
    return NextResponse.json(
      { error: 'Failed to generate inventory report' },
      { status: 500 }
    )
  }
}
