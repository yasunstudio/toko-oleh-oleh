'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Order } from '@/types'
import Image from 'next/image'

interface PaymentSectionProps {
  order: Order
  onUpdate: () => void
}

export function PaymentSection({ order, onUpdate }: PaymentSectionProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran file maksimal 5MB',
          variant: 'destructive'
        })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Format file tidak valid',
          description: 'Hanya file gambar yang diperbolehkan',
          variant: 'destructive'
        })
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUploadPayment = async () => {
    if (!selectedFile) {
      toast({
        title: 'Pilih file terlebih dahulu',
        description: 'Pilih bukti pembayaran untuk diupload',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('paymentProof', selectedFile)

      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: 'Berhasil!',
          description: 'Bukti pembayaran berhasil diupload'
        })
        setSelectedFile(null)
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal mengupload bukti pembayaran',
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
      setUploading(false)
    }
  }

  const getPaymentStatusIcon = () => {
    switch (order.paymentStatus) {
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'PAID':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getPaymentStatusMessage = () => {
    switch (order.paymentStatus) {
      case 'PENDING':
        return {
          title: 'Menunggu Pembayaran',
          description: 'Silakan lakukan pembayaran dan upload bukti transfer',
          variant: 'default' as const
        }
      case 'PAID':
        return {
          title: 'Menunggu Verifikasi',
          description: 'Bukti pembayaran sedang diverifikasi admin',
          variant: 'default' as const
        }
      case 'VERIFIED':
        return {
          title: 'Pembayaran Terverifikasi',
          description: 'Pembayaran Anda telah dikonfirmasi. Pesanan akan segera diproses',
          variant: 'default' as const
        }
      case 'REJECTED':
        return {
          title: 'Pembayaran Ditolak',
          description: 'Bukti pembayaran tidak valid. Silakan upload ulang bukti yang benar',
          variant: 'destructive' as const
        }
      default:
        return {
          title: 'Status Tidak Diketahui',
          description: 'Hubungi customer service untuk informasi lebih lanjut',
          variant: 'default' as const
        }
    }
  }

  const paymentStatus = getPaymentStatusMessage()

  return (
    <div className="space-y-6">
      {/* Payment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {getPaymentStatusIcon()}
            <CardTitle>Status Pembayaran</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant={paymentStatus.variant}>
            <AlertDescription>
              <div>
                <p className="font-medium">{paymentStatus.title}</p>
                <p className="text-sm mt-1">{paymentStatus.description}</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'REJECTED') && (
        <Card>
          <CardHeader>
            <CardTitle>Instruksi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Transfer ke Rekening:</h4>
              <div className="text-sm text-blue-700">
                <p>Bank: BCA</p>
                <p>No. Rekening: 1234567890</p>
                <p>Atas Nama: Toko Oleh-Oleh</p>
                <p className="font-bold text-lg mt-2">
                  Jumlah: {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-proof">Upload Bukti Pembayaran</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, maksimal 5MB
                </p>
              </div>

              {selectedFile && (
                <div className="text-sm text-gray-600">
                  File dipilih: {selectedFile.name}
                </div>
              )}

              <Button
                onClick={handleUploadPayment}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Payment Proof */}
      {order.paymentProof && (
        <Card>
          <CardHeader>
            <CardTitle>Bukti Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full max-w-sm mx-auto">
              <Image
                src={order.paymentProof}
                alt="Bukti Pembayaran"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}