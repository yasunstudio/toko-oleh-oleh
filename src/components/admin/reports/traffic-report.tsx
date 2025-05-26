'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart3, 
  Eye, 
  Users, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Globe,
  FileText,
  Smartphone
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface TrafficOverview {
  totalPageviews: number
  totalVisitors: number
  avgSessionDuration: number
  bounceRate: number
  pageviewsGrowth: number
  visitorsGrowth: number
  sessionGrowth: number
  bounceRateGrowth: number
}

interface DailyData {
  date: string
  value: number
}

interface PopularPage {
  page: string
  title: string
  visits: number
  avgTime: number
}

interface TrafficSource {
  source: string
  visits: number
  percentage: number
}

interface DeviceData {
  device: string
  percentage: number
}

interface TrafficData {
  overview: TrafficOverview
  dailyData: {
    pageviews: DailyData[]
    visitors: DailyData[]
  }
  popularPages: PopularPage[]
  trafficSources: TrafficSource[]
  deviceData: DeviceData[]
  period: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface TrafficReportProps {
  refreshTrigger?: number
}

export function TrafficReport({ refreshTrigger }: TrafficReportProps) {
  const [data, setData] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/traffic?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch traffic data')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching traffic data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data traffic',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [period, toast, refreshTrigger])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value}%`
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? 
      <TrendingUp className="h-3 w-3 text-green-600" /> : 
      <TrendingDown className="h-3 w-3 text-red-600" />
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Failed to load traffic data</p>
          <Button onClick={fetchData} variant="outline" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Traffic Report</h2>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 hari terakhir</SelectItem>
              <SelectItem value="30">30 hari terakhir</SelectItem>
              <SelectItem value="90">90 hari terakhir</SelectItem>
              <SelectItem value="365">1 tahun terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Total Pageviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalPageviews)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(data.overview.pageviewsGrowth)}`}>
              {getGrowthIcon(data.overview.pageviewsGrowth)}
              <span className="ml-1">{formatPercentage(data.overview.pageviewsGrowth)} dari periode sebelumnya</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Unique Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalVisitors)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(data.overview.visitorsGrowth)}`}>
              {getGrowthIcon(data.overview.visitorsGrowth)}
              <span className="ml-1">{formatPercentage(data.overview.visitorsGrowth)} dari periode sebelumnya</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Avg. Session Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.overview.avgSessionDuration)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(data.overview.sessionGrowth)}`}>
              {getGrowthIcon(data.overview.sessionGrowth)}
              <span className="ml-1">{formatPercentage(data.overview.sessionGrowth)} dari periode sebelumnya</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.bounceRate}%</div>
            <p className={`text-xs flex items-center ${getGrowthColor(data.overview.bounceRateGrowth)}`}>
              {getGrowthIcon(data.overview.bounceRateGrowth)}
              <span className="ml-1">{formatPercentage(data.overview.bounceRateGrowth)} dari periode sebelumnya</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Traffic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={data.dailyData.pageviews.map((pageview) => {
                  const visitors = data.dailyData.visitors.find(v => v.date === pageview.date)
                  return {
                    date: pageview.date,
                    pageviews: pageview.value,
                    visitors: visitors ? visitors.value : 0
                  }
                })}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === 'pageviews' ? 'Pageviews' : 'Visitors'
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                />
                <Area 
                  type="monotone" 
                  dataKey="pageviews" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                  name="Pageviews"
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                  name="Visitors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 md:col-span-1">
                <PieChart width={160} height={160}>
                  <Pie
                    data={data.trafficSources}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="visits"
                    nameKey="source"
                  >
                    {data.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="col-span-3 md:col-span-2">
                <div className="space-y-3">
                  {data.trafficSources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{source.source}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{formatNumber(source.visits)}</span>
                        <span className="text-xs text-gray-500">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 md:col-span-1">
                <PieChart width={160} height={160}>
                  <Pie
                    data={data.deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="percentage"
                    nameKey="device"
                  >
                    {data.deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="col-span-3 md:col-span-2">
                <div className="space-y-4">
                  {data.deviceData.map((device, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <span className="text-sm font-medium">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{
                            width: `${device.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Popular Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Page</th>
                  <th className="text-right py-2">Visits</th>
                  <th className="text-right py-2">Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                {data.popularPages.map((page, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{page.title}</p>
                        <p className="text-sm text-gray-500">{page.page}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium">{formatNumber(page.visits)}</td>
                    <td className="py-3 text-right">{formatTime(page.avgTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
