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
import { useUploadThing } from '@/lib/uploadthing-client'

interface PaymentSectionProps {
  order: Order
  onUpdate: () => void
}

export function PaymentSection({ order, onUpdate }: PaymentSectionProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Initialize UploadThing hook for payment proof uploads
  const { startUpload, isUploading } = useUploadThing("paymentProofUploader", {
    onClientUploadComplete: (res) => {
      // Upload completed successfully
      console.log("Upload completed:", res)
      if (res && res[0]?.url) {
        // Send the cloud URL to our payment API
        handlePaymentProofSubmit(res[0].url)
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error)
      toast({
        title: 'Upload Gagal',
        description: error.message || 'Gagal mengupload bukti pembayaran',
        variant: 'destructive'
      })
      setUploading(false)
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  // Send payment proof URL to our API after successful upload to cloud
  const handlePaymentProofSubmit = async (paymentProofUrl: string) => {
    try {
      const response = await fetch(`/api/orders/${order.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentProofUrl })
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
          description: data.error || 'Gagal menyimpan bukti pembayaran',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan bukti pembayaran',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit to match UploadThing config
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran file maksimal 4MB',
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
      // Upload to UploadThing cloud storage
      await startUpload([selectedFile])
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat upload',
        variant: 'destructive'
      })
      setUploading(false)
    }
  }

  const getPaymentStatusIcon = () => {
    switch (order.paymentStatus) {
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
      case 'PAID':
        return <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      default: // PENDING
        return <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
    }
  }

  const getPaymentStatusMessage = () => {
    switch (order.paymentStatus) {
      case 'PENDING':
        return {
          title: 'Menunggu Pembayaran',
          description: 'Silakan lakukan pembayaran dan upload bukti transfer',
          variant: 'default' as const,
          iconColor: 'text-yellow-500 dark:text-yellow-400'
        }
      case 'PAID':
        return {
          title: 'Menunggu Verifikasi',
          description: 'Bukti pembayaran sedang diverifikasi admin',
          variant: 'default' as const,
          iconColor: 'text-blue-500 dark:text-blue-400'
        }
      case 'VERIFIED':
        return {
          title: 'Pembayaran Terverifikasi',
          description: 'Pembayaran Anda telah dikonfirmasi. Pesanan akan segera diproses',
          variant: 'default' as const, // Consider a 'success' variant if available or custom styled
          iconColor: 'text-green-500 dark:text-green-400'
        }
      case 'REJECTED':
        return {
          title: 'Pembayaran Ditolak',
          description: 'Bukti pembayaran tidak valid. Silakan upload ulang bukti yang benar',
          variant: 'destructive' as const,
          iconColor: 'text-red-500 dark:text-red-400'
        }
      default:
        return {
          title: 'Status Tidak Diketahui',
          description: 'Hubungi customer service untuk informasi lebih lanjut',
          variant: 'default' as const,
          iconColor: 'text-muted-foreground'
        }
    }
  }

  const paymentStatusInfo = getPaymentStatusMessage()

  return (
    <div className="space-y-6">
      {/* Payment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {getPaymentStatusIcon()} 
            <CardTitle className="text-foreground">Status Pembayaran</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant={paymentStatusInfo.variant} className={paymentStatusInfo.variant === 'default' ? `border-${paymentStatusInfo.iconColor.split('-')[1]}-500/40 dark:border-${paymentStatusInfo.iconColor.split('-')[1]}-400/40` : ''}>
            <AlertDescription>
              <div>
                <p className={`font-medium ${paymentStatusInfo.variant === 'destructive' ? 'text-destructive-foreground' : 'text-foreground'}`}>{paymentStatusInfo.title}</p>
                <p className={`text-sm mt-1 ${paymentStatusInfo.variant === 'destructive' ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}>{paymentStatusInfo.description}</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'REJECTED') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Instruksi Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent border border-border rounded-lg p-4">
              <h4 className="font-medium text-accent-foreground mb-2">Transfer ke Rekening:</h4>
              <div className="text-sm text-accent-foreground/80">
                <p>Bank: BCA</p>
                <p>No. Rekening: 1234567890</p>
                <p>Atas Nama: Toko Oleh-Oleh</p>
                <p className="font-bold text-lg mt-2 text-primary">
                  Jumlah: {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-proof" className="text-foreground">Upload Bukti Pembayaran</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1 file:text-primary file:font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: JPG, PNG, maksimal 4MB
                </p>
              </div>

              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  File dipilih: {selectedFile.name}
                </div>
              )}

              <Button
                onClick={handleUploadPayment}
                disabled={!selectedFile || uploading || isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading || isUploading ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Payment Proof */}
      {order.paymentProof && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bukti Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full max-w-sm mx-auto border border-border rounded-lg overflow-hidden">
              <Image
                src={order.paymentProof}
                alt="Bukti Pembayaran"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-contain rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}