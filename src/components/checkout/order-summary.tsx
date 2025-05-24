'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CartItem } from '@/types'
import Image from 'next/image'

interface OrderSummaryProps {
  items: CartItem[]
}

export function OrderSummary({ items }: OrderSummaryProps) {
  // Helper function to get the image URL
  const getProductImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return '/placeholder.jpg'
    if (typeof images[0] === 'string') return images[0]
    return images[0]?.url || '/placeholder.jpg'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const shippingCost = subtotal >= 100000 ? 0 : 15000
  const total = subtotal + shippingCost

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <Image
                  src={getProductImageUrl(item.product.images)}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-medium text-primary">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({items.length} item)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ongkos Kirim</span>
            <span className={shippingCost === 0 ? 'text-green-600' : ''}>
              {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
            </span>
          </div>
          {subtotal < 100000 && (
            <p className="text-xs text-gray-500">
              Gratis ongkir untuk pembelian di atas {formatPrice(100000)}
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total Pembayaran</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}