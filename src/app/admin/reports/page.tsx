'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesReport } from '@/components/admin/reports/sales-report'
import { ProductReport } from '@/components/admin/reports/product-report'
import { CustomerReport } from '@/components/admin/reports/customer-report'
import { InventoryReport } from '@/components/admin/reports/inventory-report'
import { FinancialReport } from '@/components/admin/reports/financial-report'
import { TrafficReport } from '@/components/admin/reports/traffic-report'
import { PaymentReport } from '@/components/admin/payment-report'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
import { 
  TrendingUp, 
  Package, 
  Users, 
  Warehouse, 
  DollarSign, 
  BarChart3,
  CreditCard
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
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchReportSummary()
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Trigger refresh for all report components
    setRefreshTrigger(prev => prev + 1)
    // Also refresh the summary
    await fetchReportSummary()
  }

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
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Laporan' }
        ]} 
      />
      
      {/* Header Section - Compact */}
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Laporan & Analitik</h1>
            <p className="text-xs text-muted-foreground">Pantau performa bisnis dan analisa data penjualan</p>
          </div>
          {!isLoading && summary && (
            <div className="text-xs text-muted-foreground">
              {summary.totalOrders} pesanan total
            </div>
          )}
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="text-center text-destructive">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Gagal Memuat Data</h3>
              <p className="text-sm">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Coba Lagi
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {!isLoading && !error && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Total Penjualan
                  </p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{formatPrice(summary.totalSales)}</p>
                  <p className={`text-xs ${getGrowthColor(summary.salesGrowth)}`}>{formatGrowth(summary.salesGrowth)} dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Total Pesanan
                  </p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{summary.totalOrders}</p>
                  <p className={`text-xs ${getGrowthColor(summary.orderGrowth)}`}>{formatGrowth(summary.orderGrowth)} dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Total Pelanggan
                  </p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{summary.totalCustomers}</p>
                  <p className={`text-xs ${getGrowthColor(summary.customerGrowth)}`}>{formatGrowth(summary.customerGrowth)} dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    Total Produk
                  </p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{summary.totalProducts}</p>
                  <p className={`text-xs ${getGrowthColor(summary.productGrowth)}`}>{formatGrowth(summary.productGrowth)} dari bulan lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
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
          <TabsTrigger value="payments" className="flex items-center text-xs lg:text-sm">
            <CreditCard className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Pembayaran</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-3">
          <SalesReport refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="products" className="mt-3">
          <ProductReport refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="customers" className="mt-3">
          <CustomerReport refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="inventory" className="mt-3">
          <InventoryReport refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="financial" className="mt-3">
          <FinancialReport refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="traffic" className="mt-3">
          <TrafficReport refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="payments" className="mt-3">
          <PaymentReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}