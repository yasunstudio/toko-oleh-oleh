'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Product } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Card className="max-w-md w-full bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Produk Tidak Ditemukan
              </CardTitle>
              <p className="text-muted-foreground">
                Produk yang Anda cari tidak tersedia.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="mb-8 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            Edit Produk
          </CardTitle>
          <p className="text-muted-foreground">
            Perbarui informasi produk {product.name}
          </p>
        </CardHeader>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <ProductForm product={product} isEdit />
        </CardContent>
      </Card>
    </div>
  )
}
