import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Always filter by user ID for "My Orders" - even for admins
    // Admins should use /api/admin/orders to see all orders
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    )
  }
}

// POST create new order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { shippingAddress, notes, bankAccount } = await req.json()

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang kosong' },
        { status: 400 }
      )
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok ${item.product.name} tidak mencukupi` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    )

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          totalAmount,
          shippingAddress,
          notes,
          bankAccount,
          status: 'PENDING',
          paymentStatus: 'PENDING'
        }
      })

      // Create order items
      await tx.orderItem.createMany({
        data: cartItems.map(item => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      })

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id }
      })

      // Create admin notification for new order
      const adminUsers = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      })

      // Notify all admin users about the new order
      for (const admin of adminUsers) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: 'Pesanan Baru Masuk',
            message: `Pesanan baru ${orderNumber} dari customer perlu dikonfirmasi`,
            type: 'ORDER_STATUS',
            orderId: newOrder.id,
            data: JSON.stringify({
              orderNumber,
              customerName: session.user.name,
              totalAmount,
              status: 'PENDING'
            })
          }
        })
      }

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}