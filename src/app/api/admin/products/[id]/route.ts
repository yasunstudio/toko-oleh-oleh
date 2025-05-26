import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, price, stock, categoryId, images, weight, isActive } = body

    // Handle images separately - first get existing images
    const { id } = await params;
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete all existing images
    await prisma.productImage.deleteMany({
      where: { productId: id }
    })

    // Update product with new data
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseInt(price),
        stock: parseInt(stock),
        categoryId,
        weight: weight ? parseInt(weight) : null,
        isActive,
        // Create new images
        images: {
          create: images.map((url: string) => ({
            url
          }))
        }
      },
      include: {
        category: true,
        images: true
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    const { id } = await params;
    const product = await prisma.product.update({
      where: { id },
      data: body,
      include: {
        category: true
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('Product patch error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params;
    // Check if product is used in any orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Produk tidak dapat dihapus karena sudah ada dalam pesanan' },
        { status: 400 }
      )
    }

    // Delete cart items first
    await prisma.cartItem.deleteMany({
      where: { productId: id }
    });

    // Delete product
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Produk berhasil dihapus' })

  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}