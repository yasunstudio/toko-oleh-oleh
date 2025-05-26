'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  thisMonthOrders: number
  recentOrders: any[]
  topProducts: any[]
}

interface QuickStat {
  title: string
  value: string | number
  change?: number
  icon: any
  trend?: 'up' | 'down'
  color: string
  description?: string
}

export function QuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const data: AdminStats = await response.json()
        
        // Format revenue to Indonesian Rupiah
        const formatRupiah = (value: number) => {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
        }
        
        setStats([
          {
            title: 'Total Penjualan',
            value: formatRupiah(data.totalRevenue),
            icon: DollarSign,
            color: 'text-green-600',
            description: 'Revenue bulan ini'
          },
          {
            title: 'Pesanan Baru',
            value: data.thisMonthOrders,
            icon: ShoppingCart,
            color: 'text-orange-600',
            description: `${data.pendingOrders} menunggu proses`
          },
          {
            title: 'Produk Aktif',
            value: data.totalProducts,
            icon: Package,
            color: 'text-blue-600',
            description: 'Produk tersedia'
          },
          {
            title: 'Total Pelanggan',
            value: data.totalUsers,
            icon: Users,
            color: 'text-purple-600',
            description: 'Pelanggan terdaftar'
          }
        ])
        setLoading(false)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Gagal memuat statistik')
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-primary/20"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {stat.title}
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </div>
            </div>
          </CardContent>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
        </Card>
      ))}
    </div>
  )
}
