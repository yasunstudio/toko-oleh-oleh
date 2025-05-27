import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  validateTrafficData, 
  sanitizeTrafficData, 
  detectDeviceType,
  detectTrafficSource,
  TRAFFIC_CONFIG
} from '@/lib/traffic-config';

export async function POST(request: NextRequest) {
  try {
    console.log('Traffic capture endpoint called');
    
    // Get session ID from request headers or generate a new one
    let sessionId = request.headers.get('X-Session-ID');
    
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      console.log('Generated new session ID:', sessionId);
    }
    
    const data = await request.json();
    
    // Validate input data
    const validationErrors = validateTrafficData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Sanitize and truncate values
    const sanitizedData = sanitizeTrafficData(data);
    const { url, referrer, userAgent, ipAddress, timestamp } = sanitizedData;
    
    console.log('Processing visit:', { url, sessionId, timestamp });
    
    // Determine device type and traffic source
    const deviceType = detectDeviceType(userAgent || '');
    const trafficSource = detectTrafficSource(referrer);
    
    // Debug: Log what we're trying to create
    console.log('Attempting to create/update visitor with:', {
      sessionId,
      ipAddress,
      userAgent,
      device: deviceType,
      firstVisit: timestamp,
      lastVisit: timestamp,
    });
    
    // Try a simpler approach first - check if visitor exists
    let visitor = await prisma.visitor.findUnique({
      where: { sessionId }
    });
    
    if (!visitor) {
      // Create new visitor
      console.log('Creating new visitor...');
      visitor = await prisma.visitor.create({
        data: {
          sessionId,
          ipAddress,
          userAgent,
          device: deviceType,
          firstVisit: timestamp,
          lastVisit: timestamp,
        }
      });
    } else {
      // Update existing visitor
      console.log('Updating existing visitor...');
      visitor = await prisma.visitor.update({
        where: { sessionId },
        data: {
          lastVisit: timestamp,
          // Update these fields if they've changed
          ...(ipAddress && { ipAddress }),
          ...(userAgent && { userAgent }),
        }
      });
    }

    try {
      // Record page visit
      const pageVisit = await prisma.pageVisit.create({
        data: {
          url: url || '',
          pageTitle: url?.slice(0, TRAFFIC_CONFIG.MAX_TITLE_LENGTH), // We'll update this via client-side JS later
          referrer: referrer || undefined,
          timestamp,
          visitorId: visitor.id,
        },
      });

      console.log('✅ Page visit recorded successfully:', pageVisit.id);

      return NextResponse.json({ 
        success: true, 
        sessionId: sessionId,
        visitorId: visitor.id,
        visitId: pageVisit.id,
        deviceType,
        trafficSource
      });
    } catch (error) {
      console.error('Error creating page visit:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint failed')) {
          return NextResponse.json(
            { error: 'Duplicate page visit detected' },
            { status: 409 }
          );
        }
        if (error.message.includes('Foreign key constraint failed')) {
          return NextResponse.json(
            { error: 'Invalid visitor reference' },
            { status: 400 }
          );
        }
      }
      throw error; // Re-throw for other errors
    }
  } catch (error) {
    console.error('❌ Error capturing traffic data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to capture traffic data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
