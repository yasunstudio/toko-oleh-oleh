'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminOrderCard } from '@/components/admin/admin-order-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter } from 'lucide-react'
import { Order } from '@/types'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
import { Button } from '@/components/ui/button'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  // Keyboard shortcuts for quick filters
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setStatusFilter('PENDING')
            break
          case '2':
            e.preventDefault()
            setPaymentFilter('PENDING')
            break
          case '0':
            e.preventDefault()
            setStatusFilter('all')
            setPaymentFilter('all')
            setSearchTerm('')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const getOrderStats = () => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'PENDING').length
    const processing = orders.filter(o => o.status === 'PROCESSING').length
    const completed = orders.filter(o => o.status === 'DELIVERED').length
    
    return { total, pending, processing, completed }
  }

  const stats = getOrderStats()

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
          { label: 'Kelola Pesanan' }
        ]} 
      />
      
      {/* Header Section - Ultra Compact */}
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Manajemen Pesanan</h1>
            <p className="text-xs text-muted-foreground">Kelola semua pesanan pelanggan</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.total} total pesanan
          </div>
        </div>
      </div>

      {/* Stats Cards - Ultra Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{stats.total}</p>
              </div>
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-yellow-600 mt-0.5">{stats.pending}</p>
              </div>
              <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Proses</p>
                <p className="text-xl font-bold text-blue-600 mt-0.5">{stats.processing}</p>
              </div>
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Selesai</p>
                <p className="text-xl font-bold text-green-600 mt-0.5">{stats.completed}</p>
              </div>
              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <SelectValue placeholder="Status Pesanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                <SelectItem value="PROCESSING">Diproses</SelectItem>
                <SelectItem value="SHIPPED">Dikirim</SelectItem>
                <SelectItem value="DELIVERED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Status Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pembayaran</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Dibayar</SelectItem>
                <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Bar - More Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 rounded-lg p-2 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-foreground">Quick:</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setStatusFilter('PENDING')}
            className="h-6 text-xs px-2"
            title="Keyboard shortcut: Cmd/Ctrl + 1"
          >
            Pending
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPaymentFilter('PENDING')}
            className="h-6 text-xs px-2"
            title="Keyboard shortcut: Cmd/Ctrl + 2"
          >
            Bayar Pending
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setStatusFilter('all')
              setPaymentFilter('all')
              setSearchTerm('')
            }}
            className="h-6 text-xs px-2"
            title="Keyboard shortcut: Cmd/Ctrl + 0"
          >
            Reset
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {filteredOrders.length}/{orders.length} pesanan
        </div>
      </div>

      {/* Orders List - Ultra Compact */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Daftar Pesanan ({filteredOrders.length})
          </h2>
        </div>
        {filteredOrders.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Tidak ada pesanan yang ditemukan</p>
                <p className="text-xs text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="animate-in fade-in-0 slide-in-from-bottom-2" 
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <AdminOrderCard order={order} onUpdate={fetchOrders} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}