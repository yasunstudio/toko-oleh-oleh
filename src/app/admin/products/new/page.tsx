'use client'

import { ProductForm } from '@/components/admin/product-form'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [session, status, router])
  
  // Show loading state
  if (status === 'loading') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }
  
  // Show unauthorized state if needed
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <span className="text-destructive mb-4">Anda tidak memiliki akses ke halaman ini.</span>
        <Button onClick={() => router.push('/admin/login')}>Login sebagai Admin</Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="mb-8 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">Tambah Produk Baru</CardTitle>
          <p className="text-muted-foreground">Buat produk baru untuk toko</p>
          <p className="text-sm text-green-600 mt-1">
            Logged in as: {session.user.name} ({session.user.role})
          </p>
        </CardHeader>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  )
}