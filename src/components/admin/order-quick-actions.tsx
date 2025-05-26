'use client'

import { Button } from '@/components/ui/button'
import { PrintableOrder } from '@/components/admin/printable-order'
import { Printer, Download, ExternalLink } from 'lucide-react'

interface OrderQuickActionsProps {
  orderId: string
  orderNumber: string
  paymentProof?: string | null
  order?: {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    paymentStatus: string
    shippingAddress: string
    notes?: string | null
    createdAt: string
    user: {
      name: string
      email: string
      phone?: string | null
    }
    orderItems: Array<{
      id: string
      product: {
        name: string
      }
      quantity: number
      price: number
    }>
  }
}

export function OrderQuickActions({ 
  orderId, 
  orderNumber, 
  paymentProof,
  order 
}: OrderQuickActionsProps) {
  const handleDownloadPaymentProof = () => {
    if (paymentProof) {
      const link = document.createElement('a')
      link.href = paymentProof
      link.download = `bukti-pembayaran-${orderNumber}.jpg`
      link.click()
    }
  }

  const handleOpenInNewTab = () => {
    window.open(`/admin/orders/${orderId}`, '_blank')
  }

  return (
    <div className="flex flex-wrap gap-2">
      {order ? (
        <PrintableOrder order={order} />
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Cetak
        </Button>
      )}
      {paymentProof && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleDownloadPaymentProof}
        >
          <Download className="h-4 w-4" />
          Unduh Bukti Pembayaran
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleOpenInNewTab}
      >
        <ExternalLink className="h-4 w-4" />
        Buka di Tab Baru
      </Button>
    </div>
  )
}
