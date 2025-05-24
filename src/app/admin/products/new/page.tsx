'use client'

import { ProductForm } from '@/components/admin/product-form'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { testAuthAction } from '@/app/actions'

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
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }
  
  // Show unauthorized state if needed
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
        <Button onClick={() => router.push('/admin/login')}>Login sebagai Admin</Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
        <p className="text-gray-600">Buat produk baru untuk toko</p>
        <p className="text-sm text-green-600 mt-1">
          Logged in as: {session.user.name} ({session.user.role})
        </p>
      </div>

      <ProductForm />
    </div>
  )
}