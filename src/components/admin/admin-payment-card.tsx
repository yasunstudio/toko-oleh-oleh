'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Eye, 
  Check, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  CreditCard,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Payment {
  id: string
  orderNumber: string
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED' | 'REJECTED'
  paymentProof?: string
  bankAccount?: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    phone?: string
  }
}

interface AdminPaymentCardProps {
  payment: Payment
  onUpdate: () => void
  onStatsUpdate: () => void
}

export function AdminPaymentCard({ payment, onUpdate, onStatsUpdate }: AdminPaymentCardProps) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)

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
      PENDING: 'Menunggu Pembayaran',
      PAID: 'Sudah Dibayar',
      VERIFIED: 'Terverifikasi',
      REJECTED: 'Ditolak'
    }
    return statusMap[status] || status
  }

  const handleVerifyPayment = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'verify' })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pembayaran berhasil diverifikasi'
        })
        onUpdate()
        onStatsUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memverifikasi pembayaran',
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

  const handleRejectPayment = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Alasan diperlukan',
        description: 'Masukkan alasan penolakan pembayaran',
        variant: 'destructive'
      })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'reject',
          reason: rejectReason
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pembayaran berhasil ditolak'
        })
        setShowRejectDialog(false)
        setRejectReason('')
        onUpdate()
        onStatsUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menolak pembayaran',
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
            <h3 className="text-lg font-semibold">#{payment.orderNumber}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(payment.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={getStatusColor(payment.paymentStatus)}>
              {getStatusText(payment.paymentStatus)}
            </Badge>
            <p className="text-lg font-bold text-primary">
              {formatPrice(payment.totalAmount)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">{payment.user.name}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>{payment.user.email}</span>
                </div>
                {payment.user.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{payment.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Rekening:</span>
            <span className="font-medium">{payment.bankAccount || 'Tidak ada info'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Update terakhir:</span>
            <span className="font-medium">
              {format(new Date(payment.updatedAt), 'dd/MM/yyyy HH:mm', { locale: id })}
            </span>
          </div>
        </div>

        {/* Payment Proof */}
        {payment.paymentProof && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Bukti Pembayaran:</h4>
            <div className="relative w-48 h-32">
              <Image
                src={payment.paymentProof}
                alt="Bukti Pembayaran"
                fill
                className="object-cover rounded border cursor-pointer"
                onClick={() => window.open(payment.paymentProof, '_blank')}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {payment.paymentProof && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Bukti
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bukti Pembayaran #{payment.orderNumber}</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-96">
                  <Image
                    src={payment.paymentProof}
                    alt="Bukti Pembayaran"
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {payment.paymentStatus === 'PAID' && (
            <>
              <Button 
                size="sm" 
                onClick={handleVerifyPayment}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {updating ? 'Memverifikasi...' : 'Verifikasi'}
              </Button>
              
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tolak Pembayaran</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rejectReason">Alasan Penolakan</Label>
                      <Textarea
                        id="rejectReason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Masukkan alasan mengapa pembayaran ditolak..."
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRejectDialog(false)}
                      >
                        Batal
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleRejectPayment}
                        disabled={updating || !rejectReason.trim()}
                      >
                        {updating ? 'Menolak...' : 'Tolak Pembayaran'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}