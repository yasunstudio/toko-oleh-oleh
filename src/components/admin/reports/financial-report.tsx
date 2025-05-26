'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Download, 
  Loader2,
  RefreshCw,
  Target,
  TrendingDown,
  AlertCircle,
  PieChart,
  BarChart3
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

interface FinancialOverview {
  totalRevenue: number
  totalCOGS: number
  grossProfit: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  netProfitMargin: number
  averageOrderValue: number
  totalPendingAmount: number
  pendingOrdersCount: number
  revenueGrowth: number
  profitMarginGrowth: number
  averageOrderGrowth: number
}

interface DailyFinancialData {
  date: string
  revenue: number
  cogs: number
  profit: number
  profitMargin: number
}

interface MonthlyFinancialData {
  month: string
  revenue: number
}

interface PaymentMethodData {
  method: string
  count: number
  amount: number
  percentage: number
}

interface TopRevenueProduct {
  productId: string
  productName: string
  revenue: number
  quantity: number
}

interface Expense {
  category: string
  amount: number
  description?: string
}

interface PendingPayment {
  id: string
  customerName: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
}

interface FinancialData {
  overview: FinancialOverview
  dailyFinancialData: DailyFinancialData[]
  monthlyFinancialData: MonthlyFinancialData[]
  paymentMethodData: PaymentMethodData[]
  topRevenueProducts: TopRevenueProduct[]
  expenses: Expense[]
  pendingPayments: PendingPayment[]
  period: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface FinancialReportProps {
  refreshTrigger?: number
}

export function FinancialReport({ refreshTrigger }: FinancialReportProps) {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/financial?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching financial data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data keuangan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await fetch(`/api/admin/reports/financial/export?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Sukses',
        description: 'Laporan keuangan berhasil diekspor'
      })
    } catch (error) {
      console.error('Error exporting financial report:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengekspor laporan keuangan',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period, refreshTrigger])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-3 w-3" />
    if (growth < 0) return <TrendingDown className="h-3 w-3" />
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Memuat data keuangan...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Gagal memuat data keuangan</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h2>
          <p className="text-gray-600">Analisis keuangan dan profitabilitas</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
              <SelectItem value="90">90 Hari Terakhir</SelectItem>
              <SelectItem value="365">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Excel
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(data.overview.revenueGrowth)}`}>
              {getGrowthIcon(data.overview.revenueGrowth)}
              <span className="ml-1">{formatPercentage(data.overview.revenueGrowth)} dari periode sebelumnya</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Margin Laba Bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.netProfitMargin.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              Laba bersih: {formatCurrency(data.overview.netProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Pembayaran Tertunda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalPendingAmount)}</div>
            <p className="text-xs text-yellow-600">{data.overview.pendingOrdersCount} transaksi menunggu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Banknote className="h-4 w-4 mr-2" />
              Rata-rata Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.averageOrderValue)}</div>
            <p className={`text-xs flex items-center ${getGrowthColor(data.overview.averageOrderGrowth)}`}>
              {getGrowthIcon(data.overview.averageOrderGrowth)}
              <span className="ml-1">{formatPercentage(data.overview.averageOrderGrowth)} dari periode sebelumnya</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Performa Keuangan Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyFinancialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                />
                <YAxis tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'revenue' ? 'Pendapatan' : name === 'profit' ? 'Laba' : 'COGS'
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stackId="2"
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                  >
                    {data.paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Rincian Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">COGS (Cost of Goods Sold)</span>
                <span className="font-bold">{formatCurrency(data.overview.totalCOGS)}</span>
              </div>
              {data.expenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{expense.category}</span>
                  <span>{formatCurrency(expense.amount)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between items-center font-bold">
                <span>Total Pengeluaran</span>
                <span>{formatCurrency(data.overview.totalExpenses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Products */}
      <Card>
        <CardHeader>
          <CardTitle>Produk Penghasil Pendapatan Tertinggi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Produk</th>
                  <th className="text-right py-2">Pendapatan</th>
                  <th className="text-right py-2">Qty Terjual</th>
                  <th className="text-right py-2">Rata-rata Harga</th>
                </tr>
              </thead>
              <tbody>
                {data.topRevenueProducts.slice(0, 10).map((product, index) => (
                  <tr key={product.productId} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-gray-500">#{index + 1}</p>
                      </div>
                    </td>
                    <td className="py-2 text-right font-medium">{formatCurrency(product.revenue)}</td>
                    <td className="py-2 text-right">{product.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(product.revenue / product.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {data.pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
              Pembayaran Tertunda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Order ID</th>
                    <th className="text-left py-2">Customer</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-center py-2">Status</th>
                    <th className="text-center py-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pendingPayments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-mono text-sm">{payment.id.slice(-8)}</td>
                      <td className="py-2">{payment.customerName}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(payment.totalAmount)}</td>
                      <td className="py-2 text-center">
                        <Badge variant={payment.paymentStatus === 'PENDING' ? 'destructive' : 'secondary'}>
                          {payment.paymentStatus === 'PENDING' ? 'Menunggu Pembayaran' : 'Sudah Bayar'}
                        </Badge>
                      </td>
                      <td className="py-2 text-center text-sm">
                        {new Date(payment.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
