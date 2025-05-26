import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function POST(
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

    const { action, reason } = await req.json()

    if (!['verify', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action tidak valid' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Status pembayaran tidak valid untuk verifikasi' },
        { status: 400 }
      )
    }

    interface UpdateData {
      paymentStatus: PaymentStatus
      status?: OrderStatus
      rejectionReason?: string
    }

    let updateData: UpdateData = {
      paymentStatus: 'PENDING' as PaymentStatus
    }

    if (action === 'verify') {
      updateData = {
        paymentStatus: PaymentStatus.VERIFIED,
        status: order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status
      }
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Alasan penolakan diperlukan' },
          { status: 400 }
        )
      }
      updateData = {
        paymentStatus: PaymentStatus.REJECTED,
        // Could add a notes field to store rejection reason
        // notes: reason
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    // Here you could add email notification logic
    // await sendPaymentStatusEmail(updatedOrder)

    return NextResponse.json({
      message: `Pembayaran berhasil ${action === 'verify' ? 'diverifikasi' : 'ditolak'}`,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Gagal memverifikasi pembayaran' },
      { status: 500 }
    )
  }
}