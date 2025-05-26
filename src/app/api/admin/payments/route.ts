import { NextResponse } from 'next/server'
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

    const payments = await prisma.order.findMany({
      where: {
        paymentProof: { not: null }
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        paymentProof: true,
        bankAccount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format bank account information
    const paymentsWithBankInfo = await Promise.all(
      payments.map(async (payment) => {
        let formattedBankAccount = payment.bankAccount

        // If bankAccount looks like an ID (starts with c), fetch the bank account details
        if (payment.bankAccount && payment.bankAccount.startsWith('c') && !payment.bankAccount.includes('-')) {
          try {
            const bankAccount = await prisma.bankAccount.findUnique({
              where: { id: payment.bankAccount }
            })
            if (bankAccount) {
              formattedBankAccount = `${bankAccount.bankName} - ${bankAccount.accountNumber} (${bankAccount.accountName})`
            }
          } catch {
            // If bank account not found, keep original value
            console.warn(`Bank account not found for ID: ${payment.bankAccount}`)
          }
        }

        return {
          ...payment,
          bankAccount: formattedBankAccount
        }
      })
    )

    return NextResponse.json(paymentsWithBankInfo)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    )
  }
}