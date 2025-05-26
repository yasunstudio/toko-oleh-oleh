import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)
    
    // Get pageview data from database
    const pageVisits = await prisma.pageVisit.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    const previousPageVisits = await prisma.pageVisit.findMany({
      where: {
        timestamp: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    })
    
    // Get visitor data
    const visitors = await prisma.visitor.findMany({
      where: {
        pageVisits: {
          some: {
            timestamp: {
              gte: startDate,
              lte: now
            }
          }
        }
      },
      include: {
        pageVisits: {
          where: {
            timestamp: {
              gte: startDate,
              lte: now
            }
          }
        }
      }
    })

    const previousVisitors = await prisma.visitor.findMany({
      where: {
        pageVisits: {
          some: {
            timestamp: {
              gte: previousStartDate,
              lt: startDate
            }
          }
        }
      }
    })

    // Create daily pageviews data
    const pageviewData = generateDailyDataFromVisits(pageVisits, startDate, now)
    const totalPageviews = pageVisits.length
    const previousTotalPageviews = previousPageVisits.length
    const pageviewsGrowth = calculateGrowth(totalPageviews, previousTotalPageviews)
    
    // Create daily visitors data
    const visitorsByDay = new Map()
    
    pageVisits.forEach(visit => {
      const dateStr = visit.timestamp.toISOString().split('T')[0]
      if (!visitorsByDay.has(dateStr)) {
        visitorsByDay.set(dateStr, new Set())
      }
      visitorsByDay.get(dateStr).add(visit.visitorId)
    })
    
    const visitorData = Array.from(visitorsByDay.entries()).map(([date, visitorIds]) => ({
      date,
      value: visitorIds.size
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    const totalVisitors = visitors.length
    const previousTotalVisitors = previousVisitors.length
    const visitorsGrowth = calculateGrowth(totalVisitors, previousTotalVisitors)
    
    // Calculate average session duration
    const sessionsWithDuration = pageVisits.filter(visit => visit.duration !== null && visit.duration !== undefined)
    const totalDuration = sessionsWithDuration.reduce((sum, visit) => sum + (visit.duration || 0), 0)
    const avgSessionDuration = sessionsWithDuration.length > 0 
      ? Math.round(totalDuration / sessionsWithDuration.length) 
      : 0
    
    // Calculate previous average session duration
    const previousSessionsWithDuration = previousPageVisits.filter(visit => visit.duration !== null && visit.duration !== undefined)
    const previousTotalDuration = previousSessionsWithDuration.reduce((sum, visit) => sum + (visit.duration || 0), 0)
    const prevAvgSessionDuration = previousSessionsWithDuration.length > 0 
      ? Math.round(previousTotalDuration / previousSessionsWithDuration.length) 
      : 0
    
    const sessionGrowth = calculateGrowth(avgSessionDuration, prevAvgSessionDuration)
    
    // Calculate bounce rate
    const totalBounces = pageVisits.filter(visit => visit.bounced).length
    const bounceRate = pageVisits.length > 0 
      ? parseFloat(((totalBounces / pageVisits.length) * 100).toFixed(1)) 
      : 0
    
    const previousTotalBounces = previousPageVisits.filter(visit => visit.bounced).length
    const prevBounceRate = previousPageVisits.length > 0 
      ? parseFloat(((previousTotalBounces / previousPageVisits.length) * 100).toFixed(1)) 
      : 0
    
    const bounceRateGrowth = calculateGrowth(prevBounceRate, bounceRate) // Notice reversed to make negative bounce rate a positive metric
    
    // Get popular pages
    const pageStats = new Map()
    
    pageVisits.forEach(visit => {
      const pageUrl = visit.url
      const pageTitle = visit.pageTitle || pageUrl
      
      if (!pageStats.has(pageUrl)) {
        pageStats.set(pageUrl, {
          page: pageUrl,
          title: pageTitle,
          visits: 0,
          totalTime: 0,
          avgTime: 0
        })
      }
      
      const stats = pageStats.get(pageUrl)
      stats.visits++
      if (visit.duration) {
        stats.totalTime += visit.duration
      }
    })
    
    // Calculate average time for each page
    for (const stats of pageStats.values()) {
      stats.avgTime = stats.visits > 0 ? Math.round(stats.totalTime / stats.visits) : 0
    }
    
    const popularPages = Array.from(pageStats.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 7)
    
    // Calculate traffic sources
    const sourcesMap = new Map()
    
    pageVisits.forEach(visit => {
      let source = 'Direct'
      if (visit.referrer) {
        if (visit.referrer.includes('google.com')) source = 'Organic Search'
        else if (visit.referrer.includes('facebook.com') || visit.referrer.includes('instagram.com') || visit.referrer.includes('twitter.com')) source = 'Social Media'
        else if (visit.referrer.includes('mail')) source = 'Email'
        else source = 'Referral'
      }
      
      if (!sourcesMap.has(source)) {
        sourcesMap.set(source, { source, visits: 0, percentage: 0 })
      }
      
      sourcesMap.get(source).visits++
    })
    
    const trafficSources = Array.from(sourcesMap.values())
    
    // Calculate percentages
    const totalSourceVisits = trafficSources.reduce((sum, source) => sum + source.visits, 0)
    trafficSources.forEach(source => {
      source.percentage = parseFloat(((source.visits / (totalSourceVisits || 1)) * 100).toFixed(1))
    })
    
    // Calculate device data
    const deviceCounts = {
      'MOBILE': 0,
      'DESKTOP': 0,
      'TABLET': 0,
      'UNKNOWN': 0
    }
    
    // Count unique visitors by device type
    visitors.forEach(visitor => {
      deviceCounts[visitor.device]++
    })
    
    const totalDevices = Object.values(deviceCounts).reduce((sum, count) => sum + (count as number), 0)
    
    const deviceData = [
      { 
        device: 'Mobile', 
        percentage: parseFloat(((deviceCounts.MOBILE / (totalDevices || 1)) * 100).toFixed(1)) 
      },
      { 
        device: 'Desktop', 
        percentage: parseFloat(((deviceCounts.DESKTOP / (totalDevices || 1)) * 100).toFixed(1)) 
      },
      { 
        device: 'Tablet', 
        percentage: parseFloat(((deviceCounts.TABLET / (totalDevices || 1)) * 100).toFixed(1)) 
      }
    ].filter(item => item.percentage > 0)
    
    // Add unknown devices if there are any and they're significant enough
    if (deviceCounts.UNKNOWN > 0 && deviceCounts.UNKNOWN / totalDevices > 0.01) {
      deviceData.push({ 
        device: 'Unknown', 
        percentage: parseFloat(((deviceCounts.UNKNOWN / totalDevices) * 100).toFixed(1)) 
      })
    }
    
    return NextResponse.json({
      overview: {
        totalPageviews,
        totalVisitors,
        avgSessionDuration,
        bounceRate,
        pageviewsGrowth,
        visitorsGrowth,
        sessionGrowth,
        bounceRateGrowth
      },
      dailyData: {
        pageviews: pageviewData,
        visitors: visitorData
      },
      popularPages,
      trafficSources,
      deviceData,
      period
    })
  } catch (error) {
    console.error('Error generating traffic data:', error)
    return NextResponse.json(
      { error: 'Failed to generate traffic data' },
      { status: 500 }
    )
  }
}

// Utility functions
function generateDailyDataFromVisits(visits: Array<{ timestamp: Date; url: string }>, startDate: Date, endDate: Date) {
  // Create a map to count visits by day
  const dailyCounts = new Map();
  
  // Initialize with all dates in range (to ensure we have entries for days with zero views)
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];
    dailyCounts.set(dateString, 0);
  }
  
  // Count visits for each day
  visits.forEach(visit => {
    const dateString = visit.timestamp.toISOString().split('T')[0];
    dailyCounts.set(dateString, (dailyCounts.get(dateString) || 0) + 1);
  });
  
  // Convert to array and sort by date
  return Array.from(dailyCounts.entries())
    .map(([date, count]) => ({ date, value: count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}
