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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detail Pesanan</CardTitle>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Nomor Pesanan</p>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Tanggal Pesanan</p>
              <p className="font-medium">
                {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Pembayaran</p>
              <p className="font-medium text-primary text-lg">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status Pembayaran</p>
              <Badge className={`${order.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                order.paymentStatus === 'PAID' ? 'bg-blue-100 text-blue-800' :
                order.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'}`}>
                {order.paymentStatus === 'PENDING' ? 'Menunggu Pembayaran' :
                 order.paymentStatus === 'PAID' ? 'Sudah Dibayar' :
                 order.paymentStatus === 'VERIFIED' ? 'Terverifikasi' :
                 order.paymentStatus === 'REJECTED' ? 'Ditolak' : order.paymentStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Item Pesanan ({order.orderItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <Image
                  src={item.product.images[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">Penerima</p>
            <p className="font-medium">{order.user.name}</p>
            <p className="text-sm text-gray-600">{order.user.email}</p>
            {order.user.phone && (
              <p className="text-sm text-gray-600">{order.user.phone}</p>
            )}
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Alamat Pengiriman</p>
            <p className="font-medium">{order.shippingAddress}</p>
          </div>
          
          {order.notes && (
            <div>
              <p className="text-gray-600 text-sm">Catatan</p>
              <p className="font-medium">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}