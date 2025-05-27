import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { status } = await req.json()

    // Get current order to compare status
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { 
        status: true, 
        userId: true, 
        orderNumber: true,
        user: { select: { name: true } }
      }
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        orderItems: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      }
    })

    // Create notification if status changed
    if (currentOrder.status !== status) {
      const statusMessages = {
        PENDING: 'Pesanan Anda sedang menunggu konfirmasi',
        CONFIRMED: 'Pesanan Anda telah dikonfirmasi dan sedang diproses',
        PROCESSING: 'Pesanan Anda sedang disiapkan',
        SHIPPED: 'Pesanan Anda telah dikirim',
        DELIVERED: 'Pesanan Anda telah sampai di tujuan',
        CANCELLED: 'Pesanan Anda telah dibatalkan'
      }

      await prisma.notification.create({
        data: {
          userId: currentOrder.userId,
          title: 'Status Pesanan Diperbarui',
          message: statusMessages[status as keyof typeof statusMessages] || 'Status pesanan Anda telah diperbarui',
          type: 'ORDER_STATUS',
          orderId: id,
          data: JSON.stringify({
            oldStatus: currentOrder.status,
            newStatus: status,
            orderNumber: currentOrder.orderNumber
          })
        }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui pesanan' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        paymentProof: true,
        bankAccount: true,
        shippingAddress: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}