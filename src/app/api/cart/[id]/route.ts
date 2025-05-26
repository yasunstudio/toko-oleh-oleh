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
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { quantity } = await req.json()

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity harus minimal 1' },
        { status: 400 }
      )
    }

    // Check if cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: { product: true }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check stock availability
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: 'Stok tidak mencukupi' },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(updatedItem)

  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Item berhasil dihapus' })

  } catch (error) {
    console.error('Cart delete error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus item' },
      { status: 500 }
    )
  }
}