import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import os from 'os'
import fs from 'fs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get system information
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    // Get disk usage (simplified)
    const stats = fs.statSync(process.cwd())
    const diskTotal = 100 * 1024 * 1024 * 1024 // 100GB placeholder
    const diskUsed = 50 * 1024 * 1024 * 1024 // 50GB placeholder

    // Test database connection
    let databaseStatus = 'connected'
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      databaseStatus = 'disconnected'
    }

    const systemInfo = {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: `${os.type()} ${os.arch()}`,
      uptime: process.uptime(),
      memoryUsage: {
        used: usedMem,
        total: totalMem,
        percentage: (usedMem / totalMem) * 100
      },
      diskUsage: {
        used: diskUsed,
        total: diskTotal,
        percentage: (diskUsed / diskTotal) * 100
      },
      databaseStatus,
      lastBackup: new Date().toISOString() // Placeholder
    }

    return NextResponse.json(systemInfo)
  } catch (error) {
    console.error('Error fetching system info:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil informasi sistem' },
      { status: 500 }
    )
  }
}