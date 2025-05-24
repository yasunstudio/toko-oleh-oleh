import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id }
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

    let updateData: any = {}

    if (action === 'verify') {
      updateData = {
        paymentStatus: 'VERIFIED',
        status: order.status === 'PENDING' ? 'CONFIRMED' : order.status
      }
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Alasan penolakan diperlukan' },
          { status: 400 }
        )
      }
      updateData = {
        paymentStatus: 'REJECTED',
        // Could add a notes field to store rejection reason
        // notes: reason
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
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