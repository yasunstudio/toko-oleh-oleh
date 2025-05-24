'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">#{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-sm text-gray-600">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-sm text-gray-600">{order.user.phone}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-lg text-primary">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-sm text-gray-600">
              {order.orderItems.length} item
            </p>
          </div>
        </div>

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
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary hover:underline"
          >
            {expanded ? 'Sembunyikan detail' : 'Lihat detail'}
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <>
            <Separator />
            
            {/* Detailed Items */}
            <div className="space-y-3">
              <h4 className="font-medium">Item Pesanan:</h4>
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

            {/* Shipping Address */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <h4 className="font-medium">Alamat Pengiriman:</h4>
              </div>
              <p className="text-sm text-gray-700 ml-6">{order.shippingAddress}</p>
              {order.notes && (
                <>
                  <h4 className="font-medium">Catatan:</h4>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </>
              )}
            </div>

            {/* Payment Proof */}
            {order.paymentProof && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <h4 className="font-medium">Bukti Pembayaran:</h4>
                  </div>
                  <div className="relative w-48 h-32">
                    <Image
                      src={order.paymentProof}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-cover rounded border"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/orders/${order.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Detail
            </Link>
          </Button>
          
          <Select 
            value={order.status} 
            onValueChange={handleStatusUpdate}
            disabled={updating}
          >
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Dibayar</SelectItem>
              <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}