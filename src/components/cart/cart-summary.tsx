'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CartItem } from '@/types'

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items }: CartSummaryProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const shippingCost = subtotal >= 100000 ? 0 : 15000 // Free shipping above 100k
  const total = subtotal + shippingCost

  const handleCheckout = () => {
    setLoading(true)
    router.push('/checkout')
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Summary */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="truncate mr-2">
                {item.product.name} x {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
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
              Belanja Rp. {formatPrice(100000 - subtotal)} lagi untuk gratis ongkir!
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleCheckout}
          disabled={loading || items.length === 0}
          className="w-full"
          size="lg"
        >
          {loading ? 'Memproses...' : 'Lanjut ke Checkout'}
        </Button>
      </CardFooter>
    </Card>
  )
}