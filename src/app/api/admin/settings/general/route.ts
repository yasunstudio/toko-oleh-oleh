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

    // Get settings from database or return defaults
    const settings = await prisma.setting.findMany({
      where: {
        category: 'general'
      }
    })

    // Convert to object format
    const settingsObj = settings.reduce((acc: Record<string, any>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    // Return with defaults if no settings exist
    const defaultSettings = {
      siteName: 'Toko Oleh-Oleh',
      siteDescription: 'Platform e-commerce untuk oleh-oleh khas daerah',
      siteUrl: 'http://localhost:3000',
      siteLogo: '',
      contactEmail: 'info@tokooleholeh.com',
      contactPhone: '+62 812-3456-7890',
      contactAddress: 'Jl. Raya Malang No. 123, Bekasi, Jawa Barat',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
      ...settingsObj
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Error fetching general settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan umum' },
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

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: {
          category_key: {
            category: 'general',
            key
          }
        },
        update: { value: JSON.stringify(value) },
        create: {
          category: 'general',
          key,
          value: JSON.stringify(value)
        }
      })
    }

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating general settings:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan umum' },
      { status: 500 }
    )
  }
}