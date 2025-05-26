import { NextRequest, NextResponse } from 'next/server';

// Create a simple UUID function instead of importing the uuid library
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// We're simplifying the middleware to avoid using libraries that cause issues in Edge Runtime

// Cookie name for tracking session
const SESSION_COOKIE = 'visitor_session_id';
// How long to keep the session cookie (30 days)
const SESSION_DURATION = 30 * 24 * 60 * 60;
// Admin and API paths to ignore
const IGNORE_PATHS = [
  '/api/',
  '/favicon.ico',
  '/_next/',
  '/images/',
  '/fonts/',
];

// Function to determine if we should track this request
function shouldTrackRequest(url: string): boolean {
  const path = new URL(url).pathname;

  // Ignore certain paths, but allow `/auth/login`
  if (IGNORE_PATHS.some(ignorePath => path.startsWith(ignorePath)) && path !== '/auth/login') {
    return false;
  }

  // Only track GET requests to pages
  return true;
}


// These functions are now handled in the API route
// We've moved the database operations out of the middleware
// to avoid Edge Runtime compatibility issues with Prisma

export async function trackPageVisit(req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();
  
  console.log('Traffic middleware called for:', req.url);
  
  // Check if we should track this request
  if (!shouldTrackRequest(req.url)) {
    console.log('Not tracking request:', req.url);
    return response;
  }
  
  console.log('Tracking request:', req.url);
  
  try {
    // Check for analytics consent cookie
    const consentCookie = req.cookies.get('cookie-consent')?.value;
    let hasAnalyticsConsent = false;
    
    if (consentCookie) {
      try {
        const consent = JSON.parse(consentCookie);
        hasAnalyticsConsent = consent.analytics === true;
      } catch {
        console.log('Could not parse consent cookie');
      }
    }
    
    // Get existing session ID from cookies or create a new one
    let sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    
    console.log('Traffic middleware - existing sessionId:', sessionId);
    console.log('Analytics consent:', hasAnalyticsConsent);
    
    if (!sessionId) {
      sessionId = generateUUID();
      console.log('Traffic middleware - generated new sessionId:', sessionId);
      
      // Set the session cookie
      console.log('Setting session cookie:', {
        name: SESSION_COOKIE,
        value: sessionId,
        maxAge: SESSION_DURATION,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });

      response.cookies.set({
        name: SESSION_COOKIE,
        value: sessionId,
        maxAge: SESSION_DURATION,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        // Add Partitioned attribute for Chrome's Privacy Sandbox
        partitioned: process.env.NODE_ENV === 'production',
      });

      console.log('Session cookie set successfully:', response.cookies.get(SESSION_COOKIE));
    }
    
    // Only track if user has given analytics consent
    if (hasAnalyticsConsent) {
      // Store tracking data in a custom header to be processed by a dedicated API route
      // This avoids Prisma connection issues in middleware
      const url = new URL(req.url);
      const referrer = req.headers.get('referer') || '';
      const userAgent = req.headers.get('user-agent') || '';
      const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
      
      // Log the tracking data
      console.log('Middleware - Session ID:', sessionId);
      console.log('Middleware - Referrer:', referrer);
      console.log('Middleware - User Agent:', userAgent);
      console.log('Middleware - IP Address:', ipAddress);
      
      // Make a non-blocking request to our tracking API
      // We don't wait for this to complete to avoid slowing down the response
      try {
        // Create headers object correctly
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-Session-ID', sessionId);
        
        fetch(`${url.origin}/api/admin/reports/traffic/capture`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            url: url.pathname,
            referrer,
            userAgent,
            ipAddress: ipAddress.split(',')[0], // Use first IP if multiple
            timestamp: new Date().toISOString(),
          }),
        }).catch(e => {
          // Silently fail - we don't want tracking errors to affect the user experience
          console.error('Error sending tracking data:', e);
        });
      } catch (fetchError) {
        // Also catch any synchronous errors from fetch setup
        console.error('Error in tracking fetch:', fetchError);
      }
    } else {
      console.log('Analytics tracking skipped - no user consent');
    }
    
    return response;
  } catch (error) {
    console.error('Error in traffic tracker middleware:', error);
    return response;
  }
}
