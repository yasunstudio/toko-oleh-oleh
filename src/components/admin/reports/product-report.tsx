'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { Download, Package, TrendingUp, AlertTriangle } from 'lucide-react'

interface ProductData {
  bestSellers: Array<{
    name: string
    category: string
    sold: number
    revenue: number
    stock: number
  }>
  worstPerformers: Array<{
    name: string
    category: string
    sold: number
    revenue: number
    stock: number
  }>
  lowStock: Array<{
    name: string
    category: string
    currentStock: number
    minStock: number
    status: 'critical' | 'warning' | 'normal'
  }>
  categoryPerformance: Array<{
    category: string
    products: number
    totalSold: number
    revenue: number
  }>
  metrics: {
    totalProducts: number
    activeProducts: number
    outOfStock: number
    lowStockItems: number
  }
}

interface ProductReportProps {
  refreshTrigger?: number
}

export function ProductReport({ refreshTrigger }: ProductReportProps) {
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchProductData()
  }, [period, refreshTrigger])

  const fetchProductData = async () => {
    try {
      const response = await fetch(`/api/admin/reports/products?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setProductData(data)
      }
    } catch (error) {
      console.error('Error fetching product data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/admin/reports/products/export?period=${period}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `product-report-${period}days.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return <div>Loading product report...</div>
  }

  if (!productData) {
    return <div>Error loading product data</div>
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari Terakhir</SelectItem>
            <SelectItem value="30">30 Hari Terakhir</SelectItem>
            <SelectItem value="90">90 Hari Terakhir</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={exportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Product Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-blue-600">
                  {productData.metrics.totalProducts}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Produk Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {productData.metrics.activeProducts}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Stok Habis</p>
                <p className="text-2xl font-bold text-red-600">
                  {productData.metrics.outOfStock}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {productData.metrics.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performa per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData.categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatPrice(Number(value))} />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.bestSellers.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <p className="text-sm text-green-600">{product.sold} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(product.revenue)}</p>
                    <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worst Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Produk Kurang Laris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.worstPerformers.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <p className="text-sm text-red-600">{product.sold} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(product.revenue)}</p>
                    <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {productData.lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Peringatan Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.lowStock.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{product.name}</h4>
                      <Badge className={getStockStatusColor(product.status)}>
                        {product.status === 'critical' ? 'Kritis' : 
                         product.status === 'warning' ? 'Peringatan' : 'Normal'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">Stok: {product.currentStock}</span>
                      <Progress 
                        value={(product.currentStock / product.minStock) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-sm text-gray-500">Min: {product.minStock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Performa Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-600">Kategori</th>
                  <th className="text-left p-3 font-medium text-gray-600">Jumlah Produk</th>
                  <th className="text-left p-3 font-medium text-gray-600">Total Terjual</th>
                  <th className="text-left p-3 font-medium text-gray-600">Total Pendapatan</th>
                  <th className="text-left p-3 font-medium text-gray-600">Rata-rata per Produk</th>
                </tr>
              </thead>
              <tbody>
                {productData.categoryPerformance.map((category, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{category.category}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-700">{category.products}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-700">{category.totalSold}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-green-600">
                        {formatPrice(category.revenue)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-700">
                        {category.products > 0 
                          ? formatPrice(Math.round(category.revenue / category.products))
                          : formatPrice(0)
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {productData.categoryPerformance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada data performa kategori untuk periode ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Status Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Stok Normal</span>
                </div>
                <span className="font-bold text-green-600">
                  {productData.metrics.totalProducts - productData.metrics.outOfStock - productData.metrics.lowStockItems}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Stok Rendah</span>
                </div>
                <span className="font-bold text-yellow-600">
                  {productData.metrics.lowStockItems}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Stok Habis</span>
                </div>
                <span className="font-bold text-red-600">
                  {productData.metrics.outOfStock}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <span className="font-medium">Tidak Aktif</span>
                </div>
                <span className="font-bold text-gray-600">
                  {productData.metrics.totalProducts - productData.metrics.activeProducts}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/products?filter=low-stock'}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Kelola Produk Stok Rendah
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/products?filter=out-of-stock'}
              >
                <Package className="h-4 w-4 mr-2" />
                Kelola Produk Stok Habis
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/products/new'}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Tambah Produk Baru
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={exportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Laporan Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State for No Data */}
      {productData.bestSellers.length === 0 && productData.worstPerformers.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Data Penjualan</h3>
              <p className="text-sm">
                Belum ada data penjualan produk untuk periode {period} hari terakhir.
                Tambahkan produk dan mulai menjual untuk melihat laporan di sini.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}