'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductImageGallery } from '@/components/product/product-image-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { RelatedProducts } from '@/components/product/related-products'
import { Skeleton } from '@/components/ui/skeleton'
import { Product } from '@/types'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
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

    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-square rounded-lg bg-muted" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-muted" />
              <Skeleton className="h-6 w-1/2 bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
              <Skeleton className="h-12 w-1/3 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Produk Tidak Ditemukan</h1>
            <p className="text-muted-foreground">Produk yang Anda cari tidak tersedia.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <a href="/" className="text-muted-foreground hover:text-foreground">Home</a>
          <span className="mx-2 text-muted-foreground">/</span>
          <a href="/products" className="text-muted-foreground hover:text-foreground">Produk</a>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductImageGallery images={product.images || []} alt={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Product Tabs */}
        <ProductTabs product={product} />

        {/* Related Products */}
        {product.category && (
          <RelatedProducts categorySlug={product.category.slug} currentProductId={product.id} />
        )}
      </div>
    </MainLayout>
  )
}