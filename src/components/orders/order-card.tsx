'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Order } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface OrderCardProps {
  order: Order
  onUpdate: () => void
}

export function OrderCard({ order, onUpdate }: OrderCardProps) {
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
      // Handle null, undefined, or empty arrays
      if (!images || !Array.isArray(images) || images.length === 0) {
        return '/placeholder.jpg'
      }
      
      const firstImage = images[0]
      
      // Handle different image data types
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
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/40' // Or use Badge variant="destructive"
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
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/40' // Or use Badge variant="destructive"
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">
              Pesanan #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
              {getPaymentStatusText(order.paymentStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Items Preview */}
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {order.orderItems.slice(0, 3).map((item, index) => (
                <Image
                  key={index}
                  src={getProductImageUrl(item.product.images) || '/placeholder.jpg'}
                  alt={item.product.name || 'Product'}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-background object-cover"
                  style={{ width: 'auto', height: 'auto' }}
                />
              ))}
              {order.orderItems.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{order.orderItems.length - 3}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {order.orderItems.length} item • {formatPrice(order.totalAmount)}
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-primary hover:underline"
              >
                {expanded ? 'Sembunyikan detail' : 'Lihat detail'}
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          {expanded && (
            <>
              <Separator />
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={getProductImageUrl(item.product.images) || '/placeholder.jpg'}
                      alt={item.product.name || 'Product'}
                      width={50}
                      height={50}
                      className="rounded object-cover border border-border"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-foreground">Alamat Pengiriman:</h4>
                <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                {order.notes && (
                  <>
                    <h4 className="font-medium mb-2 mt-4 text-foreground">Catatan:</h4>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${order.id}`}>
                Detail Pesanan
              </Link>
            </Button>
            
            {order.paymentStatus === 'PENDING' && (
              <Button size="sm" asChild>
                <Link href={`/orders/${order.id}/payment`}>
                  Upload Bukti Bayar
                </Link>
              </Button>
            )}
            
            {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
              <Button variant="destructive" size="sm" onClick={() => console.log('Cancel order clicked - implement me')}>
                Batalkan Pesanan
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}