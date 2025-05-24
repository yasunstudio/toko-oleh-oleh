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
        category: 'email'
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
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: '',
      fromName: 'Toko Oleh-Oleh',
      welcomeEmailEnabled: true,
      orderConfirmationEnabled: true,
      welcomeEmailSubject: 'Selamat Datang di Toko Oleh-Oleh',
      welcomeEmailTemplate: 'Halo {{name}}, selamat datang di Toko Oleh-Oleh...',
      orderConfirmationSubject: 'Konfirmasi Pesanan #{{orderNumber}}',
      orderConfirmationTemplate: 'Terima kasih {{name}}, pesanan #{{orderNumber}} telah diterima...',
      ...settingsObj
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan email' },
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
            category: 'email',
            key
          }
        },
        update: { value: JSON.stringify(value) },
        create: {
          category: 'email',
          key,
          value: JSON.stringify(value)
        }
      })
    }

    return NextResponse.json({ message: 'Email settings updated successfully' })
  } catch (error) {
    console.error('Error updating email settings:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan email' },
      { status: 500 }
    )
  }
}
