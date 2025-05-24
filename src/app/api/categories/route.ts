import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeCount = searchParams.get('includeCount') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const categories = await prisma.category.findMany({
      ...(includeCount && {
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      orderBy: { name: 'asc' },
      ...(limit && { take: limit })
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    )
  }
}