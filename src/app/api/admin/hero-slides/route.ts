import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all hero slides for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(slides)
  } catch (error) {
    console.error('Error fetching admin hero slides:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data hero slides' },
      { status: 500 }
    )
  }
}

// POST new hero slide
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.description || !data.primaryButtonText || !data.primaryButtonLink) {
      return NextResponse.json(
        { error: 'Field yang wajib diisi belum lengkap' },
        { status: 400 }
      )
    }

    // Get next order number
    const lastSlide = await prisma.heroSlide.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastSlide?.order || 0) + 1

    const slide = await prisma.heroSlide.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description,
        backgroundImage: data.backgroundImage || null,
        backgroundColor: data.backgroundColor || '#3b82f6', // default blue
        textColor: data.textColor || '#ffffff',
        primaryButtonText: data.primaryButtonText,
        primaryButtonLink: data.primaryButtonLink,
        secondaryButtonText: data.secondaryButtonText || null,
        secondaryButtonLink: data.secondaryButtonLink || null,
        order: data.order || nextOrder,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    })

    return NextResponse.json(slide, { status: 201 })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    return NextResponse.json(
      { error: 'Gagal membuat hero slide' },
      { status: 500 }
    )
  }
}
