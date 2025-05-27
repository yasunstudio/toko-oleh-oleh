import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { CustomerNotification } from '@/types'

// GET /api/notifications - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const status = searchParams.get('status') // 'read', 'unread', or undefined for all

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (status === 'read') {
      where.status = 'READ'
    } else if (status === 'unread') {
      where.status = 'UNREAD'
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true
          }
        }
      }
    })

    // Transform to match CustomerNotification interface
    const customerNotifications: CustomerNotification[] = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as 'ORDER_STATUS' | 'PAYMENT_STATUS' | 'GENERAL',
      status: notification.status as 'UNREAD' | 'READ',
      createdAt: notification.createdAt.toISOString(),
      orderId: notification.orderId || undefined,
      orderNumber: notification.order?.orderNumber,
      data: notification.data ? JSON.parse(notification.data) : null
    }))

    return NextResponse.json({
      notifications: customerNotifications,
      total: notifications.length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create notification (for admin use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, title, message, type, orderId, data } = body

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        orderId,
        data: data ? JSON.stringify(data) : null,
        status: 'UNREAD'
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true
          }
        }
      }
    })

    const customerNotification: CustomerNotification = {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as 'ORDER_STATUS' | 'PAYMENT_STATUS' | 'GENERAL',
      status: notification.status as 'UNREAD' | 'READ',
      createdAt: notification.createdAt.toISOString(),
      orderId: notification.orderId || undefined,
      orderNumber: notification.order?.orderNumber,
      data: notification.data ? JSON.parse(notification.data) : null
    }

    return NextResponse.json({ notification: customerNotification })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
