import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET single hero slide
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;
    const slide = await prisma.heroSlide.findUnique({
      where: { id }
    })

    if (!slide) {
      return NextResponse.json({ error: 'Hero slide tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(slide)
  } catch (error) {
    console.error('Error fetching hero slide:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data hero slide' },
      { status: 500 }
    )
  }
}

// PUT update hero slide
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id } = await params;
    
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        backgroundImage: data.backgroundImage,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        primaryButtonText: data.primaryButtonText,
        primaryButtonLink: data.primaryButtonLink,
        secondaryButtonText: data.secondaryButtonText,
        secondaryButtonLink: data.secondaryButtonLink,
        order: data.order,
        isActive: data.isActive
      }
    })

    return NextResponse.json(slide)
  } catch (error) {
    console.error('Error updating hero slide:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate hero slide' },
      { status: 500 }
    )
  }
}

// DELETE hero slide
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;
    await prisma.heroSlide.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Hero slide berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting hero slide:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus hero slide' },
      { status: 500 }
    )
  }
}
