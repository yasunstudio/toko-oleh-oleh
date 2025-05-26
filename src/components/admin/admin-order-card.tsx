'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useToast } from "@/hooks/use-toast"
// import { toast } from '@/components/ui/use-toast'
import { Order } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Eye, User, MapPin, CreditCard } from 'lucide-react'

interface AdminOrderCardProps {
  order: Order
  onUpdate: () => void
}

type BadgeStyle = {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export function AdminOrderCard({ order, onUpdate }: AdminOrderCardProps) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  // Helper function to safely get product image URL
  const getProductImageUrl = (images: any[] | undefined | null): string => {
    try {
      if (!images || !Array.isArray(images) || images.length === 0) {
        return '/placeholder.jpg'
      }
      
      const firstImage = images[0]
      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
        return firstImage
      } else if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage && firstImage.url) {
        return firstImage.url
      }
      
      return '/placeholder.jpg'
    } catch (error) {
      console.error('Error processing product image:', error, images)
      return '/placeholder.jpg'
    }
  }

  const getStatusBadgeStyle = (status: string): BadgeStyle => {
    switch (status) {
      case 'PENDING':
        return { variant: 'outline', className: 'text-yellow-700 border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400' }
      case 'CONFIRMED':
        return { variant: 'outline', className: 'text-blue-700 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:text-blue-400' }
      case 'PROCESSING':
        return { variant: 'outline', className: 'text-purple-700 border-purple-400 bg-purple-50 dark:bg-purple-950 dark:text-purple-400' }
      case 'SHIPPED':
        return { variant: 'outline', className: 'text-indigo-700 border-indigo-400 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400' }
      case 'DELIVERED':
        return { variant: 'outline', className: 'text-green-700 border-green-400 bg-green-50 dark:bg-green-950 dark:text-green-400' }
      case 'CANCELLED':
        return { variant: 'destructive', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' }
      default:
        return { variant: 'secondary' }
    }
  }

  const getPaymentStatusBadgeStyle = (status: string): BadgeStyle => {
    switch (status) {
      case 'PENDING':
        return { variant: 'outline', className: 'text-yellow-700 border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400' }
      case 'PAID':
        return { variant: 'outline', className: 'text-blue-700 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:text-blue-400' }
      case 'VERIFIED':
        return { variant: 'outline', className: 'text-green-700 border-green-400 bg-green-50 dark:bg-green-950 dark:text-green-400' }
      case 'REJECTED':
        return { variant: 'destructive', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' }
      default:
        return { variant: 'secondary' }
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Status pesanan berhasil diperbarui'
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui status',
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
      setUpdating(false)
    }
  }

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: newStatus })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Status pembayaran berhasil diperbarui'
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui status pembayaran',
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
      setUpdating(false)
    }
  }

  return (
    <Card className="bg-card text-foreground border-border hover:shadow-md transition-all duration-200 hover:border-primary/20 hover:-translate-y-0.5">
      <CardContent className="p-3">
        {/* Header Row - Ultra Compact */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === 'DELIVERED' ? 'bg-green-500' :
                  order.status === 'SHIPPED' ? 'bg-indigo-500' :
                  order.status === 'PROCESSING' ? 'bg-purple-500' :
                  order.status === 'CONFIRMED' ? 'bg-blue-500' :
                  order.status === 'CANCELLED' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></div>
                <h3 className="text-base font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  #{order.orderNumber}
                </h3>
              </div>
              <Badge {...getStatusBadgeStyle(order.status)} className="text-xs font-medium px-1.5 py-0.5">
                {order.status}
              </Badge>
              <Badge {...getPaymentStatusBadgeStyle(order.paymentStatus)} className="text-xs font-medium px-1.5 py-0.5">
                {order.paymentStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-base text-primary">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.orderItems.length} item
            </p>
          </div>
        </div>

        {/* Customer & Items Row - More Compact */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
          <div className="flex items-center space-x-2 flex-1">
            <div className="p-1 bg-primary/10 rounded-full">
              <User className="h-3 w-3 text-primary flex-shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-xs truncate">{order.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{order.user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5">
            <div className="flex -space-x-0.5">
              {order.orderItems.slice(0, 3).map((item, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={getProductImageUrl(item.product.images) || '/placeholder.jpg'}
                    alt={item.product.name || 'Product'}
                    width={24}
                    height={24}
                    className="rounded-full border border-background object-cover transition-all duration-200 group-hover:scale-125 group-hover:z-10 group-hover:shadow-lg"
                    style={{ width: '24px', height: '24px' }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    {item.product.name}
                  </div>
                </div>
              ))}
              {order.orderItems.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border border-background flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{order.orderItems.length - 3}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
            >
              {expanded ? 'Tutup' : 'Detail'}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-2 mb-2">
            {/* Detailed Items */}
            <div className="bg-muted/30 rounded-lg p-2">
              <h4 className="font-medium text-foreground text-xs mb-1.5">Item Pesanan:</h4>
              <div className="space-y-1.5">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Image
                      src={getProductImageUrl(item.product.images) || '/placeholder.jpg'}
                      alt={item.product.name || 'Product'}
                      width={32}
                      height={32}
                      className="rounded object-cover border border-border"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground text-xs">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-muted/30 rounded-lg p-2">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <h4 className="font-medium text-foreground text-xs">Alamat Pengiriman:</h4>
              </div>
              <p className="text-xs text-muted-foreground">{order.shippingAddress}</p>
              {order.notes && (
                <>
                  <h4 className="font-medium text-foreground text-xs mt-1.5 mb-1">Catatan:</h4>
                  <p className="text-xs text-muted-foreground">{order.notes}</p>
                </>
              )}
            </div>

            {/* Payment Proof */}
            {order.paymentProof && (
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <h4 className="font-medium text-foreground text-xs">Bukti Pembayaran:</h4>
                </div>
                <div className="relative w-24 h-16">
                  <Image
                    src={order.paymentProof}
                    alt="Bukti Pembayaran"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover rounded border border-border"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Ultra Compact */}
        <div className="flex flex-wrap gap-1.5 sm:flex-nowrap">
          <Button variant="outline" size="sm" asChild className="h-7 text-xs px-2 flex-shrink-0">
            <Link href={`/admin/orders/${order.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Detail
            </Link>
          </Button>
          
          <Select 
            value={order.status} 
            onValueChange={handleStatusUpdate}
            disabled={updating}
          >
            <SelectTrigger className={`w-28 h-7 text-xs flex-shrink-0 ${updating ? 'opacity-50' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
              <SelectItem value="PROCESSING">Diproses</SelectItem>
              <SelectItem value="SHIPPED">Dikirim</SelectItem>
              <SelectItem value="DELIVERED">Selesai</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={order.paymentStatus} 
            onValueChange={handlePaymentStatusUpdate}
            disabled={updating}
          >
            <SelectTrigger className={`w-28 h-7 text-xs flex-shrink-0 ${updating ? 'opacity-50' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Dibayar</SelectItem>
              <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          
          {updating && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}