import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PaymentStatus } from '@prisma/client'

interface StatusDistributionItem {
  paymentStatus: PaymentStatus
  _count: {
    paymentStatus: number
  }
}

interface PaymentStatusDistribution {
  status: PaymentStatus
  count: number
  percentage: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get daily revenue data
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        SUM(totalAmount) as revenue,
        COUNT(*) as transactions
      FROM Order 
      WHERE paymentStatus = 'VERIFIED' 
        AND createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    ` as Array<{
      date: string
      revenue: number
      transactions: number
    }>

    // Get payment status distribution
    const statusDistribution = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        paymentStatus: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    const totalPayments = statusDistribution.reduce((sum: number, item: StatusDistributionItem) => sum + item._count.paymentStatus, 0)
    
    const paymentStatusDistribution: PaymentStatusDistribution[] = statusDistribution.map((item: StatusDistributionItem) => ({
      status: item.paymentStatus,
      count: item._count.paymentStatus,
      percentage: Math.round((item._count.paymentStatus / totalPayments) * 100)
    }))

    // Get top banks
    const topBanks = await prisma.$queryRaw`
      SELECT 
        bankAccount as bankName,
        COUNT(*) as transactions,
        SUM(totalAmount) as revenue
      FROM Order 
      WHERE paymentStatus = 'VERIFIED' 
        AND createdAt >= ${startDate}
        AND bankAccount IS NOT NULL
      GROUP BY bankAccount
      ORDER BY revenue DESC
      LIMIT 5
    ` as Array<{
      bankName: string
      transactions: number
      revenue: number
    }>

    // Calculate summary
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: startDate
        }
      }
    })

    const totalTransactions = await prisma.order.count({
      where: {
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: startDate
        }
      }
    })

    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)
    
    const previousRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    const currentTotal = totalRevenue._sum.totalAmount || 0
    const previousTotal = previousRevenue._sum.totalAmount || 0
    const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

    const reportData = {
      dailyRevenue: dailyRevenue.map(item => ({
        date: new Date(item.date).toLocaleDateString('id-ID'),
        revenue: Number(item.revenue),
        transactions: Number(item.transactions)
      })),
      paymentStatusDistribution,
      topBanks: topBanks.map(bank => ({
        bankName: bank.bankName || 'Unknown',
        transactions: Number(bank.transactions),
        revenue: Number(bank.revenue)
      })),
      summary: {
        totalRevenue: currentTotal,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? currentTotal / totalTransactions : 0,
        growth
      }
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching payment report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
