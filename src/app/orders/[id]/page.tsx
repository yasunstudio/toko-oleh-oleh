'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/main-layout'
import { OrderDetails } from '@/components/orders/order-details'
import { PaymentSection } from '@/components/orders/payment-section'
import { Skeleton } from '@/components/ui/skeleton'
import { Order } from '@/types'

export default function OrderDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && params.id) {
      fetchOrder()
    }
  }, [session, params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h1>
           <p className="text-gray-600">Pesanan yang Anda cari tidak tersedia.</p>
         </div>
       </div>
     </MainLayout>
   )
 }

 return (
   <MainLayout>
     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <OrderDetails order={order} />
         <PaymentSection order={order} onUpdate={fetchOrder} />
       </div>
     </div>
   </MainLayout>
 )
}