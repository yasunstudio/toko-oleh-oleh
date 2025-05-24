'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/product/product-card'
import { ProductFilter } from '@/components/product/product-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Product } from '@/types'

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const currentPage = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          ...(category && { category }),
          ...(search && { search })
        })

        const response = await fetch(`/api/products?${params}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, category, search])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilter />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {search ? `Hasil pencarian: "${search}"` : 'Semua Produk'}
              </h1>
              {data && (
                <p className="text-gray-600">
                  Menampilkan {data.products.length} dari {data.pagination.total} produk
                </p>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : data && data.products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {[...Array(data.pagination.totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString())
                          params.set('page', (i + 1).toString())
                          window.history.pushState(null, '', `?${params.toString()}`)
                          window.location.reload()
                        }}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Tidak ada produk ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}