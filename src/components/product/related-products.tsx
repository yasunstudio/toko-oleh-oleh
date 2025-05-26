'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Product } from '@/types'

interface RelatedProductsProps {
  categorySlug: string
  currentProductId: string
}

export function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRelatedProducts()
  }, [categorySlug, currentProductId])

  const fetchRelatedProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/products?category=${categorySlug}&limit=4&exclude=${currentProductId}`
      )
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      } else {
        setError('Gagal memuat produk terkait.')
        console.error('Error fetching related products: Response not OK')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil produk terkait. Silakan coba lagi nanti.')
      console.error('Error fetching related products:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 bg-muted mb-2" />
            <Skeleton className="h-4 w-64 bg-muted" />
          </div>
          <Skeleton className="h-10 w-24 bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square rounded-xl bg-muted" />
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
              <Skeleton className="h-8 w-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Produk Terkait</h2>
            <p className="text-muted-foreground mt-1">Produk lain yang mungkin Anda suka</p>
          </div>
        </div>
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Produk Terkait</h2>
          <p className="text-muted-foreground mt-1">Produk lain yang mungkin Anda suka</p>
        </div>
        <Button variant="outline" className="rounded-xl">
          Lihat Semua
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}