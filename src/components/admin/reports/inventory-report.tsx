'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Warehouse, 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Download, 
  Loader2,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'

interface InventoryOverview {
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
  totalInventoryValue: number
  stockMovementTrend: number
}

interface Product {
  id: string
  name: string
  stock: number
  price: number
  category: {
    name: string
  }
}

interface CategoryStock {
  category: string
  totalStock: number
  totalValue: number
  productCount: number
}

interface StockMovement {
  productId: string
  productName: string
  currentStock: number
  totalSold: number
}

interface StockAlert {
  type: 'out_of_stock' | 'low_stock'
  message: string
  severity: 'high' | 'medium'
  product: Product
}

interface InventoryData {
  overview: InventoryOverview
  lowStockProducts: Product[]
  outOfStockProducts: Product[]
  topStockProducts: Product[]
  categoryStockData: CategoryStock[]
  stockMovementData: StockMovement[]
  stockAlerts: StockAlert[]
  period: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface InventoryReportProps {
  refreshTrigger?: number
}

export function InventoryReport({ refreshTrigger }: InventoryReportProps) {
  const [data, setData] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports/inventory?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching inventory data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data inventori',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await fetch(`/api/admin/reports/inventory/export?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `laporan-inventori-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Sukses',
        description: 'Laporan inventori berhasil diekspor'
      })
    } catch (error) {
      console.error('Error exporting inventory report:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengekspor laporan inventori',
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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Habis Stok', color: 'bg-red-100 text-red-800' }
    if (stock <= 10) return { label: 'Stok Rendah', color: 'bg-yellow-100 text-yellow-800' }
    if (stock >= 50) return { label: 'Stok Tinggi', color: 'bg-green-100 text-green-800' }
    return { label: 'Normal', color: 'bg-blue-100 text-blue-800' }
  }

  const getAlertSeverityColor = (severity: string) => {
    return severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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
        <p className="text-gray-500">Gagal memuat data inventori</p>
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
              <Package className="h-4 w-4 mr-2" />
              Total Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalStock.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Unit produk tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.overview.lowStockCount}</div>
            <p className="text-xs text-yellow-600">Produk perlu restok</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              Stok Habis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.overview.outOfStockCount}</div>
            <p className="text-xs text-red-600">Produk tidak tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Nilai Inventori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.overview.totalInventoryValue)}</div>
            <p className="text-xs text-gray-500">Total nilai stok</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pergerakan Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.stockMovementTrend >= 0 ? '+' : ''}
              {data.overview.stockMovementTrend.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Penjualan vs periode sebelumnya</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {data.stockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Peringatan Stok ({data.stockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.stockAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-4 w-4 ${alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-500">{alert.product.category.name}</p>
                    </div>
                  </div>
                  <Badge className={getAlertSeverityColor(alert.severity)}>
                    {alert.severity === 'high' ? 'Tinggi' : 'Sedang'}
                  </Badge>
                </div>
              ))}
              {data.stockAlerts.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  Dan {data.stockAlerts.length - 5} peringatan lainnya...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stok per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalStock' ? `${value} unit` : formatCurrency(Number(value)),
                    name === 'totalStock' ? 'Total Stok' : 'Nilai Inventori'
                  ]}
                />
                <Bar dataKey="totalStock" fill="#8884d8" name="totalStock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Nilai Inventori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryStockData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalValue"
                >
                  {data.categoryStockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Nilai']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Stok Rendah ({data.lowStockProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Produk</th>
                    <th className="text-right py-2">Stok</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.slice(0, 10).map((product) => {
                    const status = getStockStatus(product.stock)
                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.category.name}</p>
                          </div>
                        </td>
                        <td className="py-2 text-right font-medium">{product.stock}</td>
                        <td className="py-2 text-center">
                          <Badge className={status.color}>
                            {status.label}
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

        {/* Top Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Stok Tertinggi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Produk</th>
                    <th className="text-right py-2">Stok</th>
                    <th className="text-right py-2">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topStockProducts.slice(0, 10).map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category.name}</p>
                        </div>
                      </td>
                      <td className="py-2 text-right font-medium">{product.stock}</td>
                      <td className="py-2 text-right">
                        {formatCurrency(product.stock * product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement */}
      {data.stockMovementData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pergerakan Stok Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Produk</th>
                    <th className="text-right py-2">Stok Saat Ini</th>
                    <th className="text-right py-2">Terjual</th>
                    <th className="text-center py-2">Tingkat Penjualan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stockMovementData.map((item) => {
                    const salesRate = item.currentStock > 0 ? (item.totalSold / (item.currentStock + item.totalSold)) * 100 : 100
                    return (
                      <tr key={item.productId} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          <p className="font-medium">{item.productName}</p>
                        </td>
                        <td className="py-2 text-right">{item.currentStock}</td>
                        <td className="py-2 text-right font-medium">{item.totalSold}</td>
                        <td className="py-2 text-center">
                          <Badge className={salesRate > 50 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {salesRate.toFixed(1)}%
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
      )}
    </div>
  )
}
