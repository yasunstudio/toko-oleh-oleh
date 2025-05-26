import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
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

    const where = session.user.role === 'ADMIN' 
      ? { id }
      : { id, userId: session.user.id }

    const order = await prisma.order.findFirst({
      where,
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

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)

  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    )
  }
}