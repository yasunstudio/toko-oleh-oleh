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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-blue-100 text-blue-800'
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
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
            <CardTitle className="text-lg">
              Pesanan #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
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
                  src={item.product.images[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white object-cover"
                />
              ))}
              {order.orderItems.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                  +{order.orderItems.length - 3}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">
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
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Alamat Pengiriman:</h4>
                <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                {order.notes && (
                  <>
                    <h4 className="font-medium mb-2 mt-4">Catatan:</h4>
                    <p className="text-sm text-gray-700">{order.notes}</p>
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
              <Button variant="destructive" size="sm">
                Batalkan Pesanan
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}