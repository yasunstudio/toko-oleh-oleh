import { NextRequest } from 'next/server';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/admin/reports/traffic/update/route';

// Mock untuk cookies yang akan diubah per test
const mockCookiesGet = jest.fn();
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: mockCookiesGet,
  })),
}));
jest.mock('@/lib/db', () => ({
  prisma: {
    visitor: {
      findUnique: jest.fn(({ where: { sessionId } }) => {
        if (sessionId === 'existing-session-id') {
          return { id: 1, sessionId };
        } else if (sessionId === 'non-existent-session-id') {
          return null;
        }
        return null;
      }),
    },
    pageVisit: {
      findFirst: jest.fn(({ where: { visitorId, url } }) => {
        if (visitorId === 1 && url === '/test-page') {
          return { id: 1, url, pageTitle: 'Old Title' };
        }
        return null;
      }),
      update: jest.fn(({ where: { id }, data: { pageTitle } }) => {
        if (id === 1) {
          return { id, pageTitle };
        }
        return null;
      }),
    },
  },
}));

// Mock NextRequest for testing
const createNextRequest = (body: any, cookies: Record<string, string> = {}) => {
  const headers = new Headers();
  Object.entries(cookies).forEach(([key, value]) => {
    headers.append('cookie', `${key}=${value}`);
  });

  return new NextRequest('http://localhost/api/admin/reports/traffic/update', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
};

describe('API /traffic/update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no session ID is found in cookies', async () => {
    console.log('Running test: No session ID in cookies');
    
    // Mock cookies untuk return undefined (tidak ada session cookie)
    mockCookiesGet.mockReturnValue(undefined);
    
    const req = createNextRequest({ url: '/test-page', pageTitle: 'Test Page' });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(400);
    expect(responseBody).toEqual({ error: 'No session ID found in cookies' });
  });

  it('should return 400 if invalid data is provided', async () => {
    console.log('Running test: Invalid data provided');
    
    // Mock cookies untuk return session ID yang valid
    mockCookiesGet.mockReturnValue({ value: 'test-session-id' });
    
    const req = createNextRequest({ url: '', pageTitle: '' });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(400);
    expect(responseBody).toEqual({ error: 'Invalid data received' });
  });

  it('should return 404 if visitor is not found', async () => {
    console.log('Running test: Visitor not found');
    
    // Mock cookies untuk return session ID yang tidak ada di database
    mockCookiesGet.mockReturnValue({ value: 'non-existent-session-id' });
    
    const req = createNextRequest({ url: '/test-page', pageTitle: 'Test Page' });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(404);
    expect(responseBody).toEqual({ error: 'Visitor not found for the provided session ID' });
  });

  it('should return 200 if page title is updated successfully', async () => {
    console.log('Running test: Page title updated successfully');
    
    // Mock cookies untuk return session ID yang ada di database
    mockCookiesGet.mockReturnValue({ value: 'existing-session-id' });
    
    const req = createNextRequest({ url: '/test-page', pageTitle: 'Updated Test Page' });
    const res = await POST(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', responseBody);

    expect(res.status).toBe(200);
    expect(responseBody).toEqual({ success: true });
  });
});
