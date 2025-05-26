'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Edit,
  ArrowLeft,
  Shield,
  User,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface UserDetail {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER'
  address?: string
  createdAt: string
  updatedAt: string
  _count: {
    orders: number
  }
  orders: {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
  }[]
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchUserDetail()
    }
  }, [params.id])

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user || user._count.orders > 0) {
      toast({
        title: 'Tidak dapat menghapus',
        description: 'Pengguna ini memiliki riwayat pesanan. Tidak dapat dihapus.',
        variant: 'destructive'
      })
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil dihapus'
        })
        router.push('/admin/users')
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus pengguna',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-700'
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-700'
      case 'SHIPPED':
        return 'bg-indigo-500/10 text-indigo-700'
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-700'
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getTotalSpent = () => {
    return user?.orders.reduce((sum, order) => {
      return order.status !== 'CANCELLED' ? sum + order.totalAmount : sum
    }, 0) || 0
  }

  const getCompletedOrders = () => {
    return user?.orders.filter(order => order.status === 'DELIVERED').length || 0
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Card className="max-w-md w-full bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">Pengguna Tidak Ditemukan</CardTitle>
              <p className="text-muted-foreground mb-6">Pengguna yang Anda cari tidak tersedia.</p>
              <Button asChild>
                <Link href="/admin/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Daftar Pengguna
                </Link>
              </Button>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <Card className="mb-8 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Detail Pengguna</CardTitle>
        </CardHeader>
      </Card>
      <Card className="bg-card border-border">
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Detail Pengguna</h1>
                <p className="text-muted-foreground">Informasi lengkap pengguna {user.name}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Pengguna
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-primary text-white text-xl">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold flex items-center text-foreground">
                          {user.name}
                          {user.role === 'ADMIN' && (
                            <Shield className="h-5 w-5 ml-2 text-green-600" />
                          )}
                        </h3>
                        <Badge className={user.role === 'ADMIN' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                          {user.role === 'ADMIN' ? 'Administrator' : 'Pelanggan'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              Bergabung {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {user.address && (
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm text-foreground">{user.address}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              Update terakhir {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm', { locale: id })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Order History */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Riwayat Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Belum ada pesanan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border-border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-foreground">#{order.orderNumber}</h4>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              {formatPrice(order.totalAmount)}
                            </p>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                Detail
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      {user._count.orders > 5 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" asChild>
                            <Link href={`/admin/orders?user=${user.id}`}>
                              Lihat Semua Pesanan ({user._count.orders})
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Stats & Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Statistik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-foreground">Total Pesanan</span>
                    </div>
                    <span className="font-bold text-foreground">{user._count.orders}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-foreground">Pesanan Selesai</span>
                    </div>
                    <span className="font-bold text-foreground">{getCompletedOrders()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-foreground">Total Belanja</span>
                    </div>
                    <span className="font-bold text-primary">{formatPrice(getTotalSpent())}</span>
                  </div>
                </CardContent>
              </Card>
              {/* Quick Actions */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Kirim Email
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profil
                    </Link>
                  </Button>
                  {user.role === 'CUSTOMER' && (
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/admin/orders?user=${user.id}`}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Lihat Semua Pesanan
                      </Link>
                    </Button>
                  )}
                  <Separator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="destructive"
                        disabled={user._count.orders > 0}
                      >
                        Hapus Pengguna
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus pengguna "{user.name}"? 
                          Tindakan ini tidak dapat dibatalkan.
                          {user._count.orders > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                              Pengguna ini memiliki {user._count.orders} pesanan dan tidak dapat dihapus.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteUser}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleting || user._count.orders > 0}
                        >
                          {deleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {user._count.orders > 0 && (
                    <p className="text-xs text-red-600 text-center">
                      Tidak dapat menghapus pengguna dengan riwayat pesanan
                    </p>
                  )}
                </CardContent>
              </Card>
              {/* Account Status */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Status Akun</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Status</span>
                      <Badge className="bg-green-500/10 text-green-700">
                        Aktif
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Verifikasi Email</span>
                      <Badge className="bg-green-500/10 text-green-700">
                        Terverifikasi
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Level Customer</span>
                      <Badge variant="outline" className={getTotalSpent() > 1000000 ? 'bg-yellow-500/10 text-yellow-700' : getTotalSpent() > 500000 ? 'bg-muted text-muted-foreground' : 'bg-blue-500/10 text-blue-700'}>
                        {getTotalSpent() > 1000000 ? 'Premium' : getTotalSpent() > 500000 ? 'Silver' : 'Regular'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}