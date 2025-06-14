'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/store/cart-store'
import { CartItem } from '@/types'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items: localItems } = useCartStore()
  const [serverItems, setServerItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchCartItems()
    }
  }, [session, status, router])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setServerItems(data)
        
        if (data.length === 0) {
          router.push('/cart')
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded" />
              <div className="h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const cartItems = session ? serverItems : localItems

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Data Pemesan & Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm cartItems={cartItems} />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderSummary items={cartItems} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}