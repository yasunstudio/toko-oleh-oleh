import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/reports/traffic/duration/route';

// Mock cookies
const mockCookiesGet = jest.fn();
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: mockCookiesGet,
  })),
}));

// Mock database
jest.mock('@/lib/db', () => ({
  prisma: {
    visitor: {
      findUnique: jest.fn(),
    },
    pageVisit: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Import after mocking
const { prisma } = require('@/lib/db');

// Mock NextRequest for testing
const createNextRequest = (body: any) => {
  const headers = new Headers();
  headers.append('content-type', 'application/json');

  return new NextRequest('http://localhost/api/admin/reports/traffic/duration', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

describe('API /traffic/duration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no session ID is found in cookies', async () => {
    console.log('Running test: No session ID in cookies');
    
    // Configure mocks for this test
    mockCookiesGet.mockReturnValue(undefined);
    
    const req = createNextRequest({
      url: '/test-page',
      duration: 45000,
    });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(400);
    expect(responseBody).toEqual({ error: 'No session ID found in cookies' });
  });

  it('should return 404 if visitor is not found', async () => {
    console.log('Running test: Visitor not found');
    
    // Configure mocks for this test
    mockCookiesGet.mockReturnValue({ value: 'nonexistent-session-id' });
    (prisma.visitor.findUnique as jest.Mock).mockResolvedValue(null);
    
    const req = createNextRequest({
      url: '/test-page',
      duration: 45000,
    });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(404);
    expect(responseBody).toEqual({ error: 'Visitor not found for the provided session ID' });
  });

  it('should return 404 if no page visit is found for the URL', async () => {
    console.log('Running test: No page visit found');
    
    // Configure mocks for this test
    mockCookiesGet.mockReturnValue({ value: 'valid-session-id' });
    (prisma.visitor.findUnique as jest.Mock).mockResolvedValue({ id: 1, sessionId: 'valid-session-id' });
    (prisma.pageVisit.findFirst as jest.Mock).mockResolvedValue(null);
    
    const req = createNextRequest({
      url: '/nonexistent-page',
      duration: 45000,
    });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(404);
    expect(responseBody).toEqual({ error: 'No page visit found for the provided URL and visitor' });
  });

  it('should successfully update page duration and set bounce status', async () => {
    console.log('Running test: Successful duration update');
    
    // Configure mocks for this test
    mockCookiesGet.mockReturnValue({ value: 'valid-session-id' });
    (prisma.visitor.findUnique as jest.Mock).mockResolvedValue({ id: 1, sessionId: 'valid-session-id' });
    (prisma.pageVisit.findFirst as jest.Mock).mockResolvedValue({ 
      id: 1, 
      visitorId: 1, 
      url: '/test-page',
      timestamp: new Date()
    });
    (prisma.pageVisit.update as jest.Mock).mockResolvedValue({ 
      id: 1, 
      duration: 45000, 
      bounced: false 
    });
    
    const req = createNextRequest({
      url: '/test-page',
      duration: 45000,
    });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
    
    // Verify that the page visit was updated with correct bounce status
    expect(prisma.pageVisit.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { 
        duration: 45000,
        bounced: false, // Duration > 10 seconds, so not bounced
      },
    });
  });

  it('should mark as bounced for short duration visits', async () => {
    console.log('Running test: Short duration bounce detection');
    
    // Configure mocks for this test
    mockCookiesGet.mockReturnValue({ value: 'valid-session-id' });
    (prisma.visitor.findUnique as jest.Mock).mockResolvedValue({ id: 1, sessionId: 'valid-session-id' });
    (prisma.pageVisit.findFirst as jest.Mock).mockResolvedValue({ 
      id: 1, 
      visitorId: 1, 
      url: '/test-page',
      timestamp: new Date()
    });
    (prisma.pageVisit.update as jest.Mock).mockResolvedValue({ 
      id: 1, 
      duration: 5000, 
      bounced: true 
    });
    
    const req = createNextRequest({
      url: '/test-page',
      duration: 5000, // Less than 10 seconds
    });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
    
    // Verify that the page visit was marked as bounced
    expect(prisma.pageVisit.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { 
        duration: 5000,
        bounced: true, // Duration < 10 seconds, so bounced
      },
    });
  });
});
