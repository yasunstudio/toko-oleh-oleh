import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection and get basic stats
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(), 
      prisma.order.count()
    ])

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      stats: {
        totalUsers,
        totalProducts,
        totalOrders
      }
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
