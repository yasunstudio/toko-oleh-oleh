import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/reports/traffic/route';

// Mock database
jest.mock('@/lib/db', () => ({
  prisma: {
    pageVisit: {
      findMany: jest.fn(),
    },
    visitor: {
      findMany: jest.fn(),
    },
  },
}));

// Import after mocking
const { prisma } = require('@/lib/db');

// Mock NextRequest for testing
const createNextRequest = (searchParams?: Record<string, string>) => {
  const url = new URL('http://localhost/api/admin/reports/traffic');
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return new NextRequest(url.toString(), {
    method: 'GET',
  });
};

describe('API /traffic (main route)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return traffic data with default 30-day period', async () => {
    console.log('Running test: Default 30-day period');
    
    const mockPageVisits = [
      {
        id: 1,
        url: '/page1',
        pageTitle: 'Page 1',
        referrer: '',
        timestamp: new Date('2025-05-20T10:00:00Z'),
        visitorId: 1,
        duration: 30000,
        bounced: false,
      },
      {
        id: 2,
        url: '/page2',
        pageTitle: 'Page 2',
        referrer: 'https://google.com',
        timestamp: new Date('2025-05-21T10:00:00Z'),
        visitorId: 2,
        duration: 5000,
        bounced: true,
      },
    ];

    const mockVisitors = [
      {
        id: 1,
        sessionId: 'session1',
        device: 'DESKTOP',
        pageVisits: [mockPageVisits[0]],
      },
      {
        id: 2,
        sessionId: 'session2',
        device: 'MOBILE',
        pageVisits: [mockPageVisits[1]],
      },
    ];

    // Configure mocks for current period
    (prisma.pageVisit.findMany as jest.Mock)
      .mockResolvedValueOnce(mockPageVisits) // Current period page visits
      .mockResolvedValueOnce([]); // Previous period page visits (empty)
    
    (prisma.visitor.findMany as jest.Mock)
      .mockResolvedValueOnce(mockVisitors) // Current period visitors
      .mockResolvedValueOnce([]); // Previous period visitors (empty)
    
    const req = createNextRequest();
    const res = await GET(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(responseBody, null, 2));

    expect(res.status).toBe(200);
    expect(responseBody).toHaveProperty('overview');
    expect(responseBody).toHaveProperty('dailyData');
    expect(responseBody).toHaveProperty('popularPages');
    expect(responseBody).toHaveProperty('trafficSources');
    expect(responseBody).toHaveProperty('deviceData');
    expect(responseBody.period).toBe('30');

    // Check overview metrics
    expect(responseBody.overview.totalPageviews).toBe(2);
    expect(responseBody.overview.totalVisitors).toBe(2);
    expect(responseBody.overview.bounceRate).toBe(50.0); // 1 out of 2 bounced
    expect(responseBody.overview.avgSessionDuration).toBe(17500); // (30000 + 5000) / 2

    // Check device data
    expect(responseBody.deviceData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ device: 'Desktop', percentage: 50.0 }),
        expect.objectContaining({ device: 'Mobile', percentage: 50.0 }),
      ])
    );
  });

  it('should return traffic data with custom 7-day period', async () => {
    console.log('Running test: Custom 7-day period');
    
    const mockPageVisits = [
      {
        id: 1,
        url: '/home',
        pageTitle: 'Home',
        referrer: 'https://facebook.com',
        timestamp: new Date('2025-05-23T10:00:00Z'),
        visitorId: 1,
        duration: 45000,
        bounced: false,
      },
    ];

    const mockVisitors = [
      {
        id: 1,
        sessionId: 'session1',
        device: 'TABLET',
        pageVisits: [mockPageVisits[0]],
      },
    ];

    // Configure mocks
    (prisma.pageVisit.findMany as jest.Mock)
      .mockResolvedValueOnce(mockPageVisits) // Current period
      .mockResolvedValueOnce([]); // Previous period (empty)
    
    (prisma.visitor.findMany as jest.Mock)
      .mockResolvedValueOnce(mockVisitors) // Current period
      .mockResolvedValueOnce([]); // Previous period (empty)
    
    const req = createNextRequest({ period: '7' });
    const res = await GET(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(responseBody, null, 2));

    expect(res.status).toBe(200);
    expect(responseBody.period).toBe('7');
    expect(responseBody.overview.totalPageviews).toBe(1);
    expect(responseBody.overview.totalVisitors).toBe(1);
    expect(responseBody.overview.bounceRate).toBe(0.0); // No bounces
    
    // Check traffic sources
    expect(responseBody.trafficSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'Social Media', visits: 1, percentage: 100.0 }),
      ])
    );

    // Check device data
    expect(responseBody.deviceData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ device: 'Tablet', percentage: 100.0 }),
      ])
    );
  });

  it('should handle empty data correctly', async () => {
    console.log('Running test: Empty data handling');
    
    // Configure mocks to return empty arrays
    (prisma.pageVisit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.visitor.findMany as jest.Mock).mockResolvedValue([]);
    
    const req = createNextRequest();
    const res = await GET(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(responseBody, null, 2));

    expect(res.status).toBe(200);
    expect(responseBody.overview.totalPageviews).toBe(0);
    expect(responseBody.overview.totalVisitors).toBe(0);
    expect(responseBody.overview.bounceRate).toBe(0);
    expect(responseBody.overview.avgSessionDuration).toBe(0);
    expect(responseBody.popularPages).toEqual([]);
    expect(responseBody.trafficSources).toEqual([]);
    expect(responseBody.deviceData).toEqual([]);
  });

  it('should calculate growth metrics correctly with previous period data', async () => {
    console.log('Running test: Growth metrics calculation');
    
    const currentPageVisits = [
      {
        id: 1,
        url: '/page1',
        pageTitle: 'Page 1',
        referrer: '',
        timestamp: new Date('2025-05-20T10:00:00Z'),
        visitorId: 1,
        duration: 30000,
        bounced: false,
      },
      {
        id: 2,
        url: '/page2',
        pageTitle: 'Page 2',
        referrer: '',
        timestamp: new Date('2025-05-21T10:00:00Z'),
        visitorId: 2,
        duration: 40000,
        bounced: false,
      },
    ];

    const previousPageVisits = [
      {
        id: 3,
        url: '/page1',
        pageTitle: 'Page 1',
        referrer: '',
        timestamp: new Date('2025-05-10T10:00:00Z'),
        visitorId: 3,
        duration: 20000,
        bounced: false,
      },
    ];

    const currentVisitors = [
      { id: 1, sessionId: 'session1', device: 'DESKTOP', pageVisits: [currentPageVisits[0]] },
      { id: 2, sessionId: 'session2', device: 'MOBILE', pageVisits: [currentPageVisits[1]] },
    ];

    const previousVisitors = [
      { id: 3, sessionId: 'session3', device: 'DESKTOP', pageVisits: [previousPageVisits[0]] },
    ];

    // Configure mocks
    (prisma.pageVisit.findMany as jest.Mock)
      .mockResolvedValueOnce(currentPageVisits) // Current period
      .mockResolvedValueOnce(previousPageVisits); // Previous period
    
    (prisma.visitor.findMany as jest.Mock)
      .mockResolvedValueOnce(currentVisitors) // Current period
      .mockResolvedValueOnce(previousVisitors); // Previous period
    
    const req = createNextRequest();
    const res = await GET(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body overview:', responseBody.overview);

    expect(res.status).toBe(200);
    
    // Check growth calculations
    // Pageviews: 2 current vs 1 previous = 100% growth
    expect(responseBody.overview.pageviewsGrowth).toBe(100.0);
    
    // Visitors: 2 current vs 1 previous = 100% growth
    expect(responseBody.overview.visitorsGrowth).toBe(100.0);
    
    // Session duration: current avg = 35000, previous avg = 20000 = 75% growth
    expect(responseBody.overview.sessionGrowth).toBe(75.0);
  });

  it('should categorize traffic sources correctly', async () => {
    console.log('Running test: Traffic source categorization');
    
    const mockPageVisits = [
      {
        id: 1,
        url: '/page1',
        pageTitle: 'Page 1',
        referrer: 'https://google.com/search?q=test',
        timestamp: new Date('2025-05-20T10:00:00Z'),
        visitorId: 1,
        duration: 30000,
        bounced: false,
      },
      {
        id: 2,
        url: '/page2',
        pageTitle: 'Page 2',
        referrer: 'https://facebook.com/share',
        timestamp: new Date('2025-05-21T10:00:00Z'),
        visitorId: 2,
        duration: 25000,
        bounced: false,
      },
      {
        id: 3,
        url: '/page3',
        pageTitle: 'Page 3',
        referrer: '', // Direct traffic
        timestamp: new Date('2025-05-22T10:00:00Z'),
        visitorId: 3,
        duration: 20000,
        bounced: false,
      },
      {
        id: 4,
        url: '/page4',
        pageTitle: 'Page 4',
        referrer: 'https://example.com/link',
        timestamp: new Date('2025-05-23T10:00:00Z'),
        visitorId: 4,
        duration: 15000,
        bounced: false,
      },
    ];

    const mockVisitors = mockPageVisits.map((visit, index) => ({
      id: index + 1,
      sessionId: `session${index + 1}`,
      device: 'DESKTOP',
      pageVisits: [visit],
    }));

    // Configure mocks
    (prisma.pageVisit.findMany as jest.Mock)
      .mockResolvedValueOnce(mockPageVisits) // Current period
      .mockResolvedValueOnce([]); // Previous period (empty)
    
    (prisma.visitor.findMany as jest.Mock)
      .mockResolvedValueOnce(mockVisitors) // Current period
      .mockResolvedValueOnce([]); // Previous period (empty)
    
    const req = createNextRequest();
    const res = await GET(req);

    const responseBody = await res.json();
    console.log('Response status:', res.status);
    console.log('Traffic sources:', responseBody.trafficSources);

    expect(res.status).toBe(200);
    
    // Check traffic source categorization
    const sources = responseBody.trafficSources;
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'Organic Search', visits: 1, percentage: 25.0 }),
        expect.objectContaining({ source: 'Social Media', visits: 1, percentage: 25.0 }),
        expect.objectContaining({ source: 'Direct', visits: 1, percentage: 25.0 }),
        expect.objectContaining({ source: 'Referral', visits: 1, percentage: 25.0 }),
      ])
    );
  });
});
