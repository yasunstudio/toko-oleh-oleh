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

    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalRevenue,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
      todayRevenue,
      monthlyRevenue
    ] = await Promise.all([
      // Total revenue from verified payments
      prisma.order.aggregate({
        where: {
          paymentStatus: 'VERIFIED',
          status: { not: 'CANCELLED' }
        },
        _sum: { totalAmount: true }
      }),
      
      // Pending payments count
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          paymentProof: { not: null }
        }
      }),
      
      // Verified payments today
      prisma.order.count({
        where: {
          paymentStatus: 'VERIFIED',
          updatedAt: { gte: startOfToday }
        }
      }),
      
      // Rejected payments count
      prisma.order.count({
        where: { paymentStatus: 'REJECTED' }
      }),
      
      // Today's revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'VERIFIED',
          updatedAt: { gte: startOfToday }
        },
        _sum: { totalAmount: true }
      }),
      
      // Monthly revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'VERIFIED',
          createdAt: { gte: startOfMonth }
        },
        _sum: { totalAmount: true }
      })
    ])

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0
    })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil statistik pembayaran' },
      { status: 500 }
    )
  }
}