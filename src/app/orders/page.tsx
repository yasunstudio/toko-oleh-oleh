'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { OrderCard } from '@/components/orders/order-card'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Order } from '@/types'
import Link from 'next/link'

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchOrders()
    }
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4 bg-muted" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pesanan Saya</h1>
          <Button asChild>
            <Link href="/products">Lanjut Belanja</Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Belum Ada Pesanan</h2>
              <p className="text-muted-foreground mb-6">
                Anda belum memiliki pesanan. Mari mulai berbelanja!
              </p>
              <Button asChild>
                <Link href="/products">Mulai Belanja</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}