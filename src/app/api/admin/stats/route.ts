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

    // Get stats in parallel
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      thisMonthOrders
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
           gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
         }
       }
     })
   ])

   return NextResponse.json({
     totalUsers,
     totalProducts,
     totalOrders,
     totalRevenue: totalRevenue._sum.totalAmount || 0,
     pendingOrders,
     thisMonthOrders
   })
 } catch (error) {
   console.error('Error fetching admin stats:', error)
   return NextResponse.json(
     { error: 'Gagal mengambil statistik' },
     { status: 500 }
   )
 }
}