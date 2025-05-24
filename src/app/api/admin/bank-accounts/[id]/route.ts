import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bankName, accountName, accountNumber, isActive } = await req.json()

    // Check if account number already exists (excluding current account)
    const existingAccount = await prisma.bankAccount.findFirst({
      where: {
        accountNumber,
        id: { not: params.id }
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Nomor rekening sudah terdaftar' },
        { status: 400 }
      )
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id: params.id },
      data: {
        bankName,
        accountName,
        accountNumber,
        isActive
      }
    })

    return NextResponse.json(bankAccount)

  } catch (error) {
    console.error('Bank account update error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui rekening bank' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if bank account is being used in orders
    const orderCount = await prisma.order.count({
      where: {
        bankAccount: {
          contains: params.id // This might need adjustment based on how you store bank account reference
        }
      }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Rekening bank tidak dapat dihapus karena masih digunakan dalam pesanan' },
        { status: 400 }
      )
    }

    await prisma.bankAccount.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Rekening bank berhasil dihapus' })

  } catch (error) {
    console.error('Bank account delete error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus rekening bank' },
      { status: 500 }
    )
  }
}