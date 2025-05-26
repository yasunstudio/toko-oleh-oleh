'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductImageGallery } from '@/components/product/product-image-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { OrderSummary } from '@/components/product/order-summary'
import { ProductTabs } from '@/components/product/product-tabs'
import { RelatedProducts } from '@/components/product/related-products'
import { StickyAddToCart } from '@/components/product/sticky-add-to-cart'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Product } from '@/types'

interface ProductDetailProps {
  slug: string
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      
      try {
        const response = await fetch(`/api/products/${slug}`)
        
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-[4/3] rounded-lg bg-muted" />
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Produk</BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/categories/${product.category.slug}`}>
                      {product.category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Product Main - 3 Column Layout */}
          <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Images and Gallery */}
              <div className="lg:col-span-5 mx-auto w-full max-w-md lg:max-w-full">
                <ProductImageGallery images={product.images || []} alt={product.name} />
                
                {/* Mobile Order Summary (visible only on mobile) */}
                <div className="block lg:hidden mt-6">
                  <OrderSummary product={product} mobilePriority={true} />
                </div>
              </div>
              
              {/* Column 2: Product Details */}
              <div className="lg:col-span-4 mt-4 lg:mt-0">
                <ProductInfo product={product} />
              </div>
              
              {/* Column 3: Order summary and Benefits (visible only on desktop) */}
              <div className="lg:col-span-3 hidden lg:block">
                <OrderSummary product={product} />
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <ProductTabs product={product} />
          </div>

          {/* Related Products */}
          {product.category && (
            <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6 lg:p-8">
              <RelatedProducts categorySlug={product.category.slug} currentProductId={product.id} />
            </div>
          )}

          {/* Sticky Add to Cart for Mobile */}
          <StickyAddToCart product={product} />
        </div>
      </div>
    </MainLayout>
  )
}
