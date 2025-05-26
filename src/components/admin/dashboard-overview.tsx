'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuickStats } from '@/components/admin/quick-stats'
import { 
  Plus, 
  ArrowRight, 
  Calendar, 
  Clock,
  Bell,
  Users,
  ShoppingCart,
  Package,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface DashboardInsights {
  pendingOrders: number
  lowStockProducts: number
  readyToShip: number
  recentActivities: Array<{
    action: string
    time: string
    type: 'order' | 'user' | 'alert' | 'system'
  }>
}

export function AdminDashboardOverview() {
  const [insights, setInsights] = useState<DashboardInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-insights')
        if (response.ok) {
          const data = await response.json()
          setInsights(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])
  const quickActions = [
    {
      title: 'Tambah Produk Baru',
      description: 'Tambahkan produk ke katalog toko',
      href: '/admin/products/new',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Kelola Pesanan',
      description: 'Lihat dan proses pesanan masuk',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: 'Update Hero Slides',
      description: 'Perbarui banner promosi',
      href: '/admin/hero-slides',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Kelola Pelanggan',
      description: 'Lihat data dan aktivitas pelanggan',
      href: '/admin/users',
      icon: Users,
      color: 'bg-orange-500'
    }
  ]

  const recentActivities = insights?.recentActivities || [
    {
      action: 'Memuat aktivitas terkini...',
      time: '',
      type: 'system' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Selamat Datang di Admin Dashboard! 👋
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Kelola toko oleh-oleh Anda dengan mudah dan efisien
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          Statistik Cepat
        </h2>
        <QuickStats />
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Plus className="mr-2 h-5 w-5 text-primary" />
              Aksi Cepat
            </CardTitle>
            <CardDescription>
              Akses fitur-fitur penting dengan sekali klik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="flex items-center p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group cursor-pointer">
                  <div className={`p-2 rounded-lg ${action.color} text-white mr-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Aktivitas Terkini
            </CardTitle>
            <CardDescription>
              Pantau aktivitas terbaru di toko Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'order' ? 'bg-green-500' :
                  activity.type === 'alert' ? 'bg-red-500' :
                  activity.type === 'user' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  {activity.time && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {activity.time}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/notifications">
                <Bell className="w-4 h-4 mr-2" />
                Lihat Semua Aktivitas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Jadwal Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Pesanan Menunggu</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : insights?.pendingOrders || 0}
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Perlu diproses segera</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <h3 className="font-medium text-orange-900 dark:text-orange-100">Stok Rendah</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {loading ? '...' : insights?.lowStockProducts || 0}
              </p>
              <p className="text-xs text-orange-600/80 dark:text-orange-400/80">Produk perlu restok</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-900 dark:text-green-100">Siap Kirim</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : insights?.readyToShip || 0}
              </p>
              <p className="text-xs text-green-600/80 dark:text-green-400/80">Pesanan siap dikirim</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
