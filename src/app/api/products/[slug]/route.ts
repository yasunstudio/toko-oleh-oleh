import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true
      },
      include: {
        category: {
          select: { name: true, slug: true }
        },
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
