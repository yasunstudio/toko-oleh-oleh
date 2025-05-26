'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  TrendingUp, 
  UserPlus, 
  UserCheck, 
  Download, 
  Loader2,
  RefreshCw,
  DollarSign
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

interface CustomerOverview {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  retentionRate: number
  customerLifetimeValue: number
  changes: {
    totalCustomers: number
    newCustomers: number
    activeCustomers: number
    retentionRate: number
  }
}

interface CustomerData {
  overview: CustomerOverview
  acquisitionData: Array<{
    date: string
    customers: number
  }>
  topCustomers: Array<{
    id: string
    name: string
    email: string
    orderCount: number
    totalSpent: number
  }>
  segments: Array<{
    segment: string
    count: number
  }>
  period: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface CustomerReportProps {
  refreshTrigger?: number
}

export function CustomerReport({ refreshTrigger }: CustomerReportProps) {
  const [data, setData] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/customers?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customer data')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching customer data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data pelanggan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await fetch(`/api/admin/reports/customers/export?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `laporan-pelanggan-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Sukses',
        description: 'Laporan pelanggan berhasil diekspor'
      })
    } catch (error) {
      console.error('Error exporting customer report:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengekspor laporan pelanggan',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getPercentageColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  useEffect(() => {
    fetchData()
  }, [period, refreshTrigger])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat data pelanggan</p>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
              <SelectItem value="90">90 Hari Terakhir</SelectItem>
              <SelectItem value="365">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <Button 
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Ekspor Excel
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</div>
            <p className={`text-xs ${getPercentageColor(data.overview.changes.totalCustomers)}`}>
              {formatPercentage(data.overview.changes.totalCustomers)} dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Pelanggan Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.newCustomers.toLocaleString()}</div>
            <p className={`text-xs ${getPercentageColor(data.overview.changes.newCustomers)}`}>
              {formatPercentage(data.overview.changes.newCustomers)} dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Pelanggan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeCustomers.toLocaleString()}</div>
            <p className={`text-xs ${getPercentageColor(data.overview.changes.activeCustomers)}`}>
              {formatPercentage(data.overview.changes.activeCustomers)} dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Tingkat retensi pelanggan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Customer LTV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.customerLifetimeValue)}</div>
            <p className="text-xs text-gray-500">Nilai seumur hidup pelanggan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Akuisisi Pelanggan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.acquisitionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                  formatter={(value) => [`${value} pelanggan`, 'Pelanggan Baru']}
                />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Segmentasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.segments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} pelanggan`, 'Jumlah']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Nama</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-right py-2">Jumlah Pesanan</th>
                  <th className="text-right py-2">Total Pengeluaran</th>
                  <th className="text-center py-2">Segmen</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer, index) => {
                  let segment = 'Tidak Aktif'
                  if (customer.orderCount === 1) segment = 'Baru'
                  else if (customer.orderCount >= 2 && customer.orderCount <= 5) segment = 'Reguler'
                  else if (customer.orderCount > 5) segment = 'VIP'

                  const segmentColor = segment === 'VIP' ? 'bg-purple-100 text-purple-800' :
                                     segment === 'Reguler' ? 'bg-blue-100 text-blue-800' :
                                     segment === 'Baru' ? 'bg-green-100 text-green-800' :
                                     'bg-gray-100 text-gray-800'

                  return (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{customer.name}</td>
                      <td className="py-2 text-gray-600">{customer.email}</td>
                      <td className="py-2 text-right">{customer.orderCount}</td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="py-2 text-center">
                        <Badge className={segmentColor}>
                          {segment}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
