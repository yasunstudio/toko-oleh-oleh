'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Download, Calendar, TrendingUp, AlertTriangle, DollarSign, BarChart3, Printer } from 'lucide-react'

interface PaymentReportData {
  dailyRevenue: Array<{
    date: string
    revenue: number
    transactions: number
  }>
  paymentStatusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  topBanks: Array<{
    bankName: string
    transactions: number
    revenue: number
  }>
  summary: {
    totalRevenue: number
    totalTransactions: number
    averageTransaction: number
    growth: number
  }
}

export function PaymentReport() {
  const [reportData, setReportData] = useState<PaymentReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  const fetchReportData = useCallback(async () => {
    setLoading(true) // Start loading
    try {
      const response = await fetch(`/api/admin/payments/report?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        setReportData(null) // Clear data on error
        console.error('Failed to fetch report data:', response.statusText)
      }
    } catch (error) {
      setReportData(null) // Clear data on error
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const exportToCSV = () => {
    if (!reportData) return

    const csvData = [
      ['Laporan Pembayaran'],
      ['Periode:', `${timeRange} hari terakhir`],
      ['Tanggal Export:', new Date().toLocaleDateString('id-ID')],
      [''],
      ['RINGKASAN'],
      ['Total Pendapatan', formatPrice(reportData.summary.totalRevenue)],
      ['Total Transaksi', reportData.summary.totalTransactions.toString()],
      ['Rata-rata Transaksi', formatPrice(reportData.summary.averageTransaction)],
      ['Pertumbuhan (%)', reportData.summary.growth.toFixed(1) + '%'],
      [''],
      ['PENDAPATAN HARIAN'],
      ['Tanggal', 'Pendapatan', 'Transaksi'],
      ...reportData.dailyRevenue.map(item => [
        item.date,
        item.revenue.toString(),
        item.transactions.toString()
      ]),
      [''],
      ['DISTRIBUSI STATUS PEMBAYARAN'],
      ['Status', 'Jumlah', 'Persentase'],
      ...reportData.paymentStatusDistribution.map(item => [
        item.status,
        item.count.toString(),
        item.percentage.toString() + '%'
      ]),
      [''],
      ['BANK TERPOPULER'],
      ['Bank', 'Transaksi', 'Pendapatan'],
      ...reportData.topBanks.map(bank => [
        bank.bankName,
        bank.transactions.toString(),
        bank.revenue.toString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan-pembayaran-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printReport = () => {
    window.print()
  }

  // Theme-aware colors for charts
  const getChartColors = () => {
    return [
      'hsl(var(--primary))',
      'hsl(var(--secondary))', 
      'hsl(var(--accent))',
      'hsl(var(--muted))',
      'hsl(var(--destructive))'
    ]
  }

  const COLORS = getChartColors()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Laporan Pembayaran</h2>
          <p className="text-muted-foreground">Analisis pembayaran dan pendapatan</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-card">
                <CardContent className="p-6">
                  <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-1/2 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-card">
                <CardHeader>
                  <div className="h-6 w-1/2 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Gagal Memuat Laporan</h2>
        <p className="text-muted-foreground mb-6">
          Tidak dapat mengambil data laporan pembayaran saat ini. Silakan coba lagi.
        </p>
        <Button variant="outline" onClick={fetchReportData} className="border-border hover:bg-accent hover:text-accent-foreground">
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:space-y-4 > * + * { margin-top: 1rem; }
          .print\\:text-black { color: black !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-gray-300 { border-color: #d1d5db !important; }
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:block">
        <div>
          <h2 className="text-2xl font-bold text-foreground print:text-black">Laporan Pembayaran</h2>
          <p className="text-muted-foreground print:text-black">Analisis pembayaran dan pendapatan</p>
          <p className="text-sm text-muted-foreground print:text-black mt-1">
            Periode: {timeRange} hari terakhir | Dicetak: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="flex items-center space-x-2 no-print">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
              <SelectValue placeholder="Pilih rentang waktu" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
              <SelectItem value="90">90 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={printReport} size="sm" className="border-border hover:bg-accent hover:text-accent-foreground">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={exportToCSV} size="sm" className="border-border hover:bg-accent hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <Card className="bg-card print:bg-white print:border-gray-300">
          <CardContent className="p-6 print:p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground print:text-black">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600 print:text-black">
                  {formatPrice(reportData.summary.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 print:hidden" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card print:bg-white print:border-gray-300">
          <CardContent className="p-6 print:p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground print:text-black">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-600 print:text-black">
                  {reportData.summary.totalTransactions}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 print:hidden" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card print:bg-white print:border-gray-300">
          <CardContent className="p-6 print:p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground print:text-black">Rata-rata Transaksi</p>
                <p className="text-2xl font-bold text-purple-600 print:text-black">
                  {formatPrice(reportData.summary.averageTransaction)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600 print:hidden" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card print:bg-white print:border-gray-300">
          <CardContent className="p-6 print:p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground print:text-black">Pertumbuhan</p>
                <p className={`text-2xl font-bold ${reportData.summary.growth >= 0 ? 'text-green-600' : 'text-destructive'} print:text-black`}>
                  {reportData.summary.growth >= 0 ? '+' : ''}{reportData.summary.growth.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${reportData.summary.growth >= 0 ? 'text-green-600' : 'text-destructive'} print:hidden`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
        {/* Revenue Chart */}
        <Card className="bg-card print:bg-white print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-foreground print:text-black">Pendapatan Harian</CardTitle>
          </CardHeader>
          <CardContent className="print:hidden">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.dailyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => formatPrice(Number(value))}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [formatPrice(Number(value)), name === 'revenue' ? 'Pendapatan' : name]}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--popover-foreground))",
                    borderRadius: "8px"
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          
          {/* Print version - table format */}
          <div className="hidden print:block p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Tanggal</th>
                    <th className="text-right p-2">Pendapatan</th>
                    <th className="text-right p-2">Transaksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.dailyRevenue.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.date}</td>
                      <td className="text-right p-2">{formatPrice(item.revenue)}</td>
                      <td className="text-right p-2">{item.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Payment Status Distribution */}
        <Card className="bg-card print:bg-white print:border-gray-300">
          <CardHeader>
            <CardTitle className="text-foreground print:text-black">Distribusi Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="print:hidden">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie
                  data={reportData.paymentStatusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                  label={({ status, percentage, x, y, midAngle, outerRadius, innerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const xPos = x + radius * Math.cos(-midAngle * RADIAN);
                    const yPos = y + radius * Math.sin(-midAngle * RADIAN);
                    
                    // Only show label if percentage is significant enough
                    if (percent * 100 < 5) return null;
                    
                    return (
                      <text 
                        x={xPos} 
                        y={yPos} 
                        fill="hsl(var(--foreground))" 
                        textAnchor={xPos > x ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight={500}
                      >
                        {`${status}`}
                      </text>
                    );
                  }}
                >
                  {reportData.paymentStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--popover-foreground))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: any, name: any) => {
                    const entry = reportData.paymentStatusDistribution.find(d => d.status === name);
                    return [`${value} transaksi (${entry?.percentage || 0}%)`, 'Jumlah'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend for pie chart */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {reportData.paymentStatusDistribution.map((entry, index) => (
                <div key={entry.status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.status} ({entry.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          
          {/* Print version - table format */}
          <div className="hidden print:block p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Status</th>
                    <th className="text-right p-2">Jumlah</th>
                    <th className="text-right p-2">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.paymentStatusDistribution.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.status}</td>
                      <td className="text-right p-2">{item.count}</td>
                      <td className="text-right p-2">{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Banks */}
      <Card className="bg-card print:bg-white print:border-gray-300">
        <CardHeader>
          <CardTitle className="text-foreground print:text-black">Bank Terpopuler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topBanks.length > 0 ? (
              reportData.topBanks.map((bank, index) => (
                <div key={bank.bankName} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors print:bg-white print:border-gray-300 print:hover:bg-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold print:bg-gray-800 print:text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground print:text-black">{bank.bankName}</h4>
                      <p className="text-sm text-muted-foreground print:text-black">{bank.transactions} transaksi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary print:text-black">{formatPrice(bank.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground print:text-black text-center py-4">Tidak ada data bank untuk ditampilkan.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}