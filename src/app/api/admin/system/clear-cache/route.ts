import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear various caches
    // This is a placeholder - implement actual cache clearing logic
    // For example: Redis cache, file cache, etc.
    
    // If using Redis:
    // await redis.flushall()
    
    // If using file cache:
    // Clear temporary files, etc.

    return NextResponse.json({ message: 'Cache cleared successfully' })
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Gagal membersihkan cache' },
      { status: 500 }
    )
  }
}