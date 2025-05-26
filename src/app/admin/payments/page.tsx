'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminPaymentCard } from '@/components/admin/admin-payment-card'
import { BankAccountManager } from '@/components/admin/bank-account-manager'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  CreditCard,
  TrendingUp
} from 'lucide-react'

interface Payment {
  id: string
  orderNumber: string
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED' | 'REJECTED'
  paymentProof?: string
  bankAccount?: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    phone?: string
  }
}

interface PaymentStats {
  totalRevenue: number
  pendingPayments: number
  verifiedPayments: number
  rejectedPayments: number
  todayRevenue: number
  monthlyRevenue: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter
    
    const matchesDate = () => {
      if (dateFilter === 'all') return true
      const paymentDate = new Date(payment.createdAt)
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          return paymentDate.toDateString() === today.toDateString()
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return paymentDate >= weekAgo
        case 'month':
          return paymentDate.getMonth() === today.getMonth() && 
                 paymentDate.getFullYear() === today.getFullYear()
        default:
          return true
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate()
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <div className="mb-4">
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-3 w-96" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Kelola Pembayaran' }
        ]} 
      />
      
      {/* Header Section - Ultra Compact */}
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Manajemen Pembayaran</h1>
            <p className="text-xs text-muted-foreground">Kelola pembayaran dan verifikasi transaksi</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {payments.length} total pembayaran
          </div>
        </div>
      </div>
      {/* Stats Cards - Ultra Compact */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                  <p className="text-lg font-bold text-green-600 mt-0.5">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                  <p className="text-lg font-bold text-yellow-600 mt-0.5">{stats.pendingPayments}</p>
                </div>
                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-3 w-3 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Verified</p>
                  <p className="text-lg font-bold text-blue-600 mt-0.5">{stats.verifiedPayments}</p>
                </div>
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly</p>
                  <p className="text-lg font-bold text-purple-600 mt-0.5">{formatPrice(stats.monthlyRevenue)}</p>
                </div>
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="payments" className="text-foreground">Pembayaran</TabsTrigger>
          <TabsTrigger value="bank-accounts" className="text-foreground">Rekening Bank</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-3 mt-3">
          {/* Filters - Ultra Compact Design */}
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <h3 className="font-medium text-foreground text-sm">Filter & Pencarian</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Cari nomor pesanan, nama, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Status Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Dibayar</SelectItem>
                    <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                    <SelectItem value="REJECTED">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Filter Tanggal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Waktu</SelectItem>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments List - Ultra Compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Daftar Pembayaran ({filteredPayments.length})
              </h2>
            </div>
            {filteredPayments.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-6">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Tidak ada pembayaran yang ditemukan</p>
                    <p className="text-xs text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredPayments.map((payment, index) => (
                  <div 
                    key={payment.id} 
                    className="animate-in fade-in-0 slide-in-from-bottom-2" 
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <AdminPaymentCard 
                      payment={payment} 
                      onUpdate={fetchPayments}
                      onStatsUpdate={fetchStats}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="bank-accounts" className="space-y-3 mt-3">
          <BankAccountManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}