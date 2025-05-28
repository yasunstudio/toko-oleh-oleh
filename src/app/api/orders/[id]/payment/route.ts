import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentProofUrl } = await req.json()

    if (!paymentProofUrl) {
      return NextResponse.json(
        { error: 'URL bukti pembayaran tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update order with payment proof URL from UploadThing
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentProof: paymentProofUrl,
        paymentStatus: 'PAID'
      }
    })

    // Create admin notification for payment proof upload
    try {
      // Create notifications for all admin users
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      })

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            type: 'PAYMENT_STATUS',
            title: 'Bukti Pembayaran Baru',
            message: `Bukti pembayaran untuk pesanan #${order.orderNumber} telah diupload dan menunggu verifikasi.`,
            status: 'UNREAD',
            userId: admin.id,
            orderId: order.id
          }
        })
      }
    } catch (notificationError) {
      console.error('Failed to create payment upload notification:', notificationError)
      // Don't fail the main operation if notification creation fails
    }

    return NextResponse.json(updatedOrder)

  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui bukti pembayaran' },
      { status: 500 }
    )
  }
}