import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('paymentProof') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `payment-${order.id}-${Date.now()}.${file.type.split('/')[1]}`
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)
    
    await writeFile(filePath, buffer)

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        paymentProof: `/uploads/${fileName}`,
        paymentStatus: 'PAID'
      }
    })

    return NextResponse.json(updatedOrder)

  } catch (error) {
    console.error('Payment upload error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupload bukti pembayaran' },
      { status: 500 }
    )
  }
}