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

    const settings = await prisma.setting.findMany({
      where: {
        category: 'payment'
      }
    })

    const settingsObj = settings.reduce((acc: any, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value)
      } catch {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    const defaultSettings = {
      paymentMethods: ['bank_transfer'],
      autoVerifyPayments: false,
      paymentTimeout: 24,
      minimumOrder: 10000,
      maximumOrder: 10000000,
      processingFee: 0,
      processingFeeType: 'fixed',
      currency: 'IDR',
      ...settingsObj
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan pembayaran' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: {
          category_key: {
            category: 'payment',
            key
          }
        },
        update: { value: JSON.stringify(value) },
        create: {
          category: 'payment',
          key,
          value: JSON.stringify(value)
        }
      })
    }

    return NextResponse.json({ message: 'Payment settings updated successfully' })
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan pembayaran' },
      { status: 500 }
    )
  }
}
