'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesReport } from '@/components/admin/reports/sales-report'
import { ProductReport } from '@/components/admin/reports/product-report'
import { CustomerReport } from '@/components/admin/reports/customer-report'
import { InventoryReport } from '@/components/admin/reports/inventory-report'
import { FinancialReport } from '@/components/admin/reports/financial-report'
import { TrafficReport } from '@/components/admin/reports/traffic-report'
import { 
  TrendingUp, 
  Package, 
  Users, 
  Warehouse, 
  DollarSign, 
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface ReportSummary {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  salesGrowth: number
  orderGrowth: number
  customerGrowth: number
  productGrowth: number
}

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('sales')

  useEffect(() => {
    fetchReportSummary()
  }, [])

  const fetchReportSummary = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/reports/summary')
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        setError('Gagal memuat ringkasan laporan')
      }
    } catch (err) {
      console.error('Error fetching report summary:', err)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600">Analisis mendalam tentang performa bisnis Anda</p>
        </div>
        <button
          onClick={fetchReportSummary}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Gagal Memuat Data</h3>
              <p className="text-sm">{error}</p>
              <button 
                onClick={fetchReportSummary}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {!isLoading && !error && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(summary.totalSales)}</div>
              <p className={`text-xs ${getGrowthColor(summary.salesGrowth)}`}>
                {formatGrowth(summary.salesGrowth)} dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Total Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
              <p className={`text-xs ${getGrowthColor(summary.orderGrowth)}`}>
                {formatGrowth(summary.orderGrowth)} dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCustomers}</div>
              <p className={`text-xs ${getGrowthColor(summary.customerGrowth)}`}>
                {formatGrowth(summary.customerGrowth)} dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Total Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProducts}</div>
              <p className={`text-xs ${getGrowthColor(summary.productGrowth)}`}>
                {formatGrowth(summary.productGrowth)} dari bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="sales" className="flex items-center text-xs lg:text-sm">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Penjualan</span>
            <span className="sm:hidden">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center text-xs lg:text-sm">
            <Package className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Produk</span>
            <span className="sm:hidden">Produk</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center text-xs lg:text-sm">
            <Users className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Pelanggan</span>
            <span className="sm:hidden">User</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center text-xs lg:text-sm">
            <Warehouse className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Inventori</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center text-xs lg:text-sm">
            <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Keuangan</span>
            <span className="sm:hidden">Money</span>
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center text-xs lg:text-sm">
            <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Traffic</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="mt-6">
          <SalesReport />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ProductReport />
        </TabsContent>
        
        <TabsContent value="customers" className="mt-6">
          <CustomerReport />
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-6">
          <InventoryReport />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-6">
          <FinancialReport />
        </TabsContent>
        
        <TabsContent value="traffic" className="mt-6">
          <TrafficReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}