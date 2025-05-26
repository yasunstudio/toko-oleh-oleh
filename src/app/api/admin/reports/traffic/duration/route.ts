import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { url, duration, sessionId } = await request.json()
    
    if (!url || duration === undefined) {
      return NextResponse.json(
        { error: 'Invalid data: url and duration are required' },
        { status: 400 }
      )
    }

    // Get session ID from request body or header
    const visitorSessionId = sessionId || request.headers.get('X-Session-ID');
    
    if (!visitorSessionId) {
      return NextResponse.json(
        { error: 'No session ID provided' },
        { status: 400 }
      )
    }    
    // Find visitor by session ID
    const visitor = await prisma.visitor.findUnique({
      where: { sessionId: visitorSessionId }
    })

    if (!visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      )
    }    
    // Find the latest page visit for this URL and visitor
    const latestVisit = await prisma.pageVisit.findFirst({
      where: {
        visitorId: visitor.id,
        url: url
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    if (!latestVisit) {
      return NextResponse.json(
        { error: 'Page visit not found' },
        { status: 404 }
      )
    }    
    // Determine if this is a bounce (less than 10 seconds)
    const bounced = duration < 10000; // 10 seconds in milliseconds
    
    // Update the page visit duration and bounce status
    const updatedVisit = await prisma.pageVisit.update({
      where: { id: latestVisit.id },
      data: { 
        duration,
        bounced,
      },
    })
    
    return NextResponse.json({ 
      success: true,
      visitId: updatedVisit.id,
      duration: updatedVisit.duration,
      bounced: updatedVisit.bounced
    })
  } catch (error) {
    console.error('❌ Error updating page duration:', error)
    return NextResponse.json(
      { error: 'Failed to update page duration' },
      { status: 500 }
    )
  }
}
