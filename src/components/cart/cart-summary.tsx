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
  // Free shipping above 100k, or if subtotal is 0 (empty cart)
  const shippingCost = subtotal > 0 && subtotal < 100000 ? 15000 : 0
  const total = subtotal + shippingCost

  const handleCheckout = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      router.push('/checkout')
      // setLoading(false); // Usually setLoading(false) would be in a .finally() or after await
    }, 1000)
  }

  return (
    <Card className="sticky top-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Summary */}
        {items.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm items-center">
                <span className="truncate mr-2 text-foreground">
                  {item.product.name} <span className="text-muted-foreground">x {item.quantity}</span>
                </span>
                <span className="font-medium text-foreground whitespace-nowrap">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Keranjang Anda kosong.</p>
        )}

        {items.length > 0 && <Separator />}

        {/* Price Breakdown */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span className={shippingCost === 0 ? 'text-primary font-medium' : 'text-foreground'}>
              {shippingCost === 0 && subtotal > 0 ? 'GRATIS' : formatPrice(shippingCost)}
            </span>
          </div>
          {subtotal > 0 && subtotal < 100000 && (
            <p className="text-xs text-muted-foreground pt-1">
              Belanja Rp {formatPrice(100000 - subtotal)} lagi untuk gratis ongkir!
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span className="text-foreground">Total</span>
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
          {loading ? (
            <>
              {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
              Memproses...
            </>
          ) : (
            'Lanjut ke Checkout'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}