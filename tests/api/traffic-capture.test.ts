import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/reports/traffic/capture/route';

jest.mock('@/lib/db', () => ({
  prisma: {
    visitor: {
      findUnique: jest.fn(({ where: { sessionId } }) => {
        if (sessionId === 'existing-session-id') {
          return { id: 1, sessionId };
        }
        return null;
      }),
      create: jest.fn((data) => ({
        id: 1,
        sessionId: data.data.sessionId,
        ...data.data,
      })),
      update: jest.fn(({ where, data }) => ({
        id: where.id,
        sessionId: 'existing-session-id',
        lastVisit: data.lastVisit,
      })),
    },
    pageVisit: {
      create: jest.fn((data) => ({
        id: 1,
        ...data.data,
      })),
    },
  },
}));

// Mock NextRequest for testing
const createNextRequest = (body: any, sessionId?: string) => {
  const headers = new Headers();
  headers.append('content-type', 'application/json');
  if (sessionId) {
    headers.append('X-Session-ID', sessionId);
  }

  return new NextRequest('http://localhost/api/admin/reports/traffic/capture', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

describe('API /traffic/capture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no session ID is found in headers', async () => {
    console.log('Running test: No session ID in headers');
    
    const req = createNextRequest({ 
      url: '/test-page', 
      referrer: '',
      userAgent: 'Test User Agent',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(400);
    expect(responseBody).toEqual({ error: 'Session ID is required' });
  });

  it('should create new visitor and page visit if visitor does not exist', async () => {
    console.log('Running test: Create new visitor and page visit');
    
    const req = createNextRequest({ 
      url: '/test-page', 
      referrer: '',
      userAgent: 'Test User Agent',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    }, 'new-session-id');
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
  });

  it('should create page visit for existing visitor', async () => {
    console.log('Running test: Create page visit for existing visitor');
    
    const req = createNextRequest({ 
      url: '/test-page', 
      referrer: '',
      userAgent: 'Test User Agent',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    }, 'existing-session-id');
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
  });

  it('should handle mobile user agent correctly', async () => {
    console.log('Running test: Mobile user agent detection');
    
    const req = createNextRequest({ 
      url: '/test-page', 
      referrer: '',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    }, 'mobile-session-id');
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
  });

  it('should handle invalid timestamp gracefully', async () => {
    console.log('Running test: Invalid timestamp handling');
    
    const req = createNextRequest({ 
      url: '/test-page', 
      referrer: '',
      userAgent: 'Test User Agent',
      ipAddress: '127.0.0.1',
      timestamp: 'invalid-timestamp-string' // Invalid timestamp should fallback to current time
    }, 'invalid-timestamp-session');
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
  });
});
