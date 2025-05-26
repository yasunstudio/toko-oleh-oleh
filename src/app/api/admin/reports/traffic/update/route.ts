import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { url, pageTitle, sessionId } = await request.json()

    if (!url || !pageTitle) {
      return NextResponse.json(
        { error: 'Invalid data: url and pageTitle are required' },
        { status: 400 }
      )
    }

    // Get session ID from request body or header
    const visitorSessionId = sessionId || request.headers.get('X-Session-ID');
    
    if (!visitorSessionId) {
      console.error('❌ No session ID provided in request body or headers')
      return NextResponse.json(
        { error: 'No session ID provided' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for visitor with session ID:', visitorSessionId)

    // Find visitor by session ID
    const visitor = await prisma.visitor.findUnique({
      where: { sessionId: visitorSessionId }
    })

    if (!visitor) {
      console.error('❌ Visitor not found for session ID:', visitorSessionId)
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found visitor:', visitor.id)

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
      console.error('❌ No page visit found for URL:', url)
      return NextResponse.json(
        { error: 'Page visit not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found page visit:', latestVisit.id)

    // Update the page title
    const updatedVisit = await prisma.pageVisit.update({
      where: { id: latestVisit.id },
      data: { pageTitle },
    })

    console.log('✅ Page title updated successfully for visit ID:', latestVisit.id)

    return NextResponse.json({ 
      success: true,
      visitId: updatedVisit.id,
      pageTitle: updatedVisit.pageTitle
    })
  } catch (error) {
    console.error('❌ Error updating page title:', error)
    return NextResponse.json(
      { error: 'Failed to update page title' },
      { status: 500 }
    )
  }
}
