import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bankAccounts)
  } catch (error) {
    console.error('Error fetching bank accounts:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data rekening bank' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bankName, accountName, accountNumber, isActive } = await req.json()

    // Check if account number already exists
    const existingAccount = await prisma.bankAccount.findFirst({
      where: { accountNumber }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Nomor rekening sudah terdaftar' },
        { status: 400 }
      )
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(bankAccount, { status: 201 })

  } catch (error) {
    console.error('Bank account creation error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat rekening bank' },
      { status: 500 }
    )
  }
}