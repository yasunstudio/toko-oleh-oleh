'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Order } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  // Helper function to safely get product image URL
  const getProductImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return '/placeholder.jpg'
    
    const firstImage = images[0]
    if (typeof firstImage === 'string') {
      return firstImage
    } else if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
      return firstImage.url
    }
    
    return '/placeholder.jpg'
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/40'
      case 'CONFIRMED':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/40'
      case 'PROCESSING':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/40'
      case 'SHIPPED':
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/40'
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40'
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/40'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/40'
      case 'PAID':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/40'
      case 'VERIFIED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40'
      case 'REJECTED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/40'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'Menunggu',
      CONFIRMED: 'Dikonfirmasi',
      PROCESSING: 'Diproses',
      SHIPPED: 'Dikirim',
      DELIVERED: 'Selesai',
      CANCELLED: 'Dibatalkan'
    }
    return statusMap[status] || status
  }

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'Menunggu Pembayaran',
      PAID: 'Sudah Dibayar',
      VERIFIED: 'Terverifikasi',
      REJECTED: 'Ditolak'
    }
    return statusMap[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Detail Pesanan</CardTitle>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nomor Pesanan</p>
              <p className="font-medium text-foreground">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Pesanan</p>
              <p className="font-medium text-foreground">
                {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Pembayaran</p>
              <p className="font-medium text-primary text-lg">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status Pembayaran</p>
              <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                {getPaymentStatusText(order.paymentStatus)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Item Pesanan ({order.orderItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <Image
                  src={getProductImageUrl(item.product.images)}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded object-cover border border-border"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            
            <Separator className="bg-border" />
            
            <div className="flex justify-between font-bold text-lg text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Informasi Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Penerima</p>
            <p className="font-medium text-foreground">{order.user.name}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
            {order.user.phone && (
              <p className="text-sm text-muted-foreground">{order.user.phone}</p>
            )}
          </div>
          
          <div>
            <p className="text-muted-foreground text-sm">Alamat Pengiriman</p>
            <p className="font-medium text-foreground">{order.shippingAddress}</p>
          </div>
          
          {order.notes && (
            <div>
              <p className="text-muted-foreground text-sm">Catatan</p>
              <p className="font-medium text-foreground">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}