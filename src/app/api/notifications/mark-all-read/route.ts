import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update all unread notifications for the user
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        status: 'UNREAD'
      },
      data: {
        status: 'READ'
      }
    })

    return NextResponse.json({ 
      success: true,
      updatedCount: result.count,
      message: `Marked ${result.count} notifications as read`
    })

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}
