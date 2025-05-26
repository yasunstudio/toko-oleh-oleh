import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ContactFormData, ContactResponse } from '@/types/contact'

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json({
        success: false,
        message: 'Semua field wajib diisi kecuali nomor telepon'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        message: 'Format email tidak valid'
      }, { status: 400 })
    }

    // Validate message length
    if (body.message.trim().length < 10) {
      return NextResponse.json({
        success: false,
        message: 'Pesan minimal 10 karakter'
      }, { status: 400 })
    }

    // Create contact in database
    const contact = await prisma.contact.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        subject: body.subject.trim(),
        message: body.message.trim(),
        status: 'UNREAD'
      }
    })

    const response: ContactResponse = {
      success: true,
      message: 'Pesan berhasil dikirim',
      data: contact
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Contact API Error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contact.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: contacts,
      total,
      page,
      limit
    })

  } catch (error) {
    console.error('Contact GET API Error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi.'
    }, { status: 500 })
  }
}