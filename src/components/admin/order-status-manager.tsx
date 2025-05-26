'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Truck,
  Package
} from 'lucide-react'

interface OrderStatusManagerProps {
  orderId: string
  orderNumber: string
  currentStatus: string
  currentPaymentStatus: string
  onUpdate?: () => void
}

export function OrderStatusManager({ 
  orderId, 
  orderNumber,
  currentStatus, 
  currentPaymentStatus,
  onUpdate 
}: OrderStatusManagerProps) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-3 w-3" />
      case 'CONFIRMED':
        return <CheckCircle className="h-3 w-3" />
      case 'PROCESSING':
        return <Package className="h-3 w-3" />
      case 'SHIPPED':
        return <Truck className="h-3 w-3" />
      case 'DELIVERED':
        return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400'
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
      case 'PROCESSING':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400'
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400'
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400'
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
      case 'VERIFIED':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400'
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setStatus(newStatus)
        toast({
          title: 'Berhasil',
          description: `Status pesanan #${orderNumber} berhasil diperbarui`
        })
        onUpdate?.()
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

  const handlePaymentStatusUpdate = async (newPaymentStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      })

      if (response.ok) {
        setPaymentStatus(newPaymentStatus)
        toast({
          title: 'Berhasil',
          description: `Status pembayaran #${orderNumber} berhasil diperbarui`
        })
        onUpdate?.()
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
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 bg-blue-100 dark:bg-blue-950 rounded">
            <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium text-sm text-foreground">Kelola Status</h3>
        </div>

        <div className="space-y-3">
          {/* Current Status Display */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getStatusIcon(status)}
                <span className="text-xs font-medium">Status Pesanan</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs ${getStatusBadgeStyle(status)}`}>
              {status}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getStatusIcon(paymentStatus)}
                <span className="text-xs font-medium">Status Pembayaran</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs ${getStatusBadgeStyle(paymentStatus)}`}>
              {paymentStatus}
            </Badge>
          </div>

          {/* Status Update Controls */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select 
                value={status} 
                onValueChange={handleStatusUpdate}
                disabled={updating}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Update Status Pesanan" />
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
            </div>

            <div className="flex gap-2">
              <Select 
                value={paymentStatus} 
                onValueChange={handlePaymentStatusUpdate}
                disabled={updating}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Update Status Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Dibayar</SelectItem>
                  <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {updating && (
            <div className="flex items-center justify-center p-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-xs text-muted-foreground">Memperbarui...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
