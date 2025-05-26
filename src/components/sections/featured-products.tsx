'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Product } from '@/types'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=6')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Gagal memuat produk unggulan')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-8 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Produk Unggulan
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Pilihan terbaik oleh-oleh khas daerah dengan kualitas premium
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg bg-muted" />
                <Skeleton className="h-3 w-3/4 bg-muted" />
                <Skeleton className="h-2 w-1/2 bg-muted" />
                <Skeleton className="h-6 w-full bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/products">Lihat Semua Produk</Link>
            </Button>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  priority={index < 6}
                />
              ))}
            </div>

            <div className="text-center">
              <Button size="sm" asChild>
                <Link href="/products">
                  Lihat Semua Produk
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Belum ada produk unggulan</p>
            <Button asChild>
              <Link href="/products">Lihat Semua Produk</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}