import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ContactStatus } from '@/types/contact'

interface ContactParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: ContactParams) {
  try {
    const { id } = await params;
    const contact = await prisma.contact.findUnique({
      where: { id }
    })

    if (!contact) {
      return NextResponse.json({
        success: false,
        message: 'Kontak tidak ditemukan'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contact
    })

  } catch (error) {
    console.error('Contact GET API Error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: ContactParams) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { status, adminReply } = body

    // Validate status if provided
    if (status && !Object.values(ContactStatus).includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Status tidak valid'
      }, { status: 400 })
    }

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
    }
    
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply
      if (adminReply && status !== ContactStatus.REPLIED) {
        updateData.status = ContactStatus.REPLIED
      }
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Kontak berhasil diupdate',
      data: contact
    })

  } catch (error: any) {
    console.error('Contact PATCH API Error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'Kontak tidak ditemukan'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: ContactParams) {
  try {
    const { id } = await params;
    await prisma.contact.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Kontak berhasil dihapus'
    })

  } catch (error: any) {
    console.error('Contact DELETE API Error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'Kontak tidak ditemukan'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 })
  }
}