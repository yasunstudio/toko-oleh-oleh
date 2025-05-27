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

    const { paymentStatus } = await req.json()

    // Get current order to compare payment status
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { 
        paymentStatus: true, 
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
      data: { paymentStatus },
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

    // Create notification if payment status changed
    if (currentOrder.paymentStatus !== paymentStatus) {
      const paymentMessages = {
        PENDING: 'Pembayaran Anda sedang menunggu verifikasi',
        VERIFIED: 'Pembayaran Anda telah diverifikasi dan dikonfirmasi',
        REJECTED: 'Pembayaran Anda ditolak. Silakan hubungi customer service atau kirim ulang bukti pembayaran yang valid'
      }

      await prisma.notification.create({
        data: {
          userId: currentOrder.userId,
          title: 'Status Pembayaran Diperbarui',
          message: paymentMessages[paymentStatus as keyof typeof paymentMessages] || 'Status pembayaran Anda telah diperbarui',
          type: 'PAYMENT_STATUS',
          orderId: id,
          data: JSON.stringify({
            oldPaymentStatus: currentOrder.paymentStatus,
            newPaymentStatus: paymentStatus,
            orderNumber: currentOrder.orderNumber
          })
        }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui status pembayaran' },
      { status: 500 }
    )
  }
}