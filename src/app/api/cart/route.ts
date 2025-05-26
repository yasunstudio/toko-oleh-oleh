import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
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

    return NextResponse.json(cartItems)

  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data keranjang' },
      { status: 500 }
    )
  }
}

// POST add item to cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId, quantity = 1 } = await req.json()

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Stok tersedia: ${product.stock}` },
        { status: 400 }
      )
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: `Stok tidak mencukupi. Stok tersedia: ${product.stock}, di keranjang: ${existingCartItem.quantity}` },
          { status: 400 }
        )
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity
        },
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
    }

    return NextResponse.json(cartItem, { status: 201 })

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Gagal menambahkan ke keranjang' },
      { status: 500 }
    )
  }
}