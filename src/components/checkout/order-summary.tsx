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
    <Card className="sticky top-4 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <Image
                  src={getProductImageUrl(item.product.images)}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded object-cover border border-border"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {item.product.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-medium text-primary">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-border" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({items.length} item)</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span className={shippingCost === 0 ? 'text-primary font-medium' : 'text-foreground'}>
              {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
            </span>
          </div>
          {subtotal > 0 && subtotal < 100000 && (
            <p className="text-xs text-muted-foreground">
              Gratis ongkir untuk pembelian di atas {formatPrice(100000)}
            </p>
          )}
        </div>

        <Separator className="bg-border" />

        <div className="flex justify-between font-bold text-lg">
          <span className="text-foreground">Total Pembayaran</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}