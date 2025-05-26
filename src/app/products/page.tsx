'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/product/product-card'
import { ProductFilter } from '@/components/product/product-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)

  const currentPage = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sort') || 'newest'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '16',
          ...(category && { category }),
          ...(search && { search }),
          ...(sortBy && { sort: sortBy })
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
  }, [currentPage, category, search, sortBy])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page') // Reset to first page when sorting
    window.history.pushState(null, '', `?${params.toString()}`)
    window.location.reload()
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-center"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`lg:w-1/5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6">
              <ProductFilter />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-4/5">
            {/* Header with Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                  {search ? `Hasil pencarian: "${search}"` : 'Semua Produk'}
                </h1>
                {data && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Menampilkan {data.products.length} dari {data.pagination.total} produk</span>
                    {(category || search) && (
                      <div className="flex gap-1">
                        {category && (
                          <Badge variant="secondary" className="text-xs">
                            Kategori: {category}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                    <SelectItem value="name-asc">Nama A-Z</SelectItem>
                    <SelectItem value="name-desc">Nama Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square rounded-lg bg-muted" />
                    <Skeleton className="h-3 w-3/4 bg-muted" />
                    <Skeleton className="h-2 w-1/2 bg-muted" />
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-full bg-muted" />
                      <Skeleton className="h-6 w-full bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data && data.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {data.products.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      priority={index < 8}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination?.totalPages && data.pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Halaman {currentPage} dari {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      {currentPage > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('page', (currentPage - 1).toString())
                            window.history.pushState(null, '', `?${params.toString()}`)
                            window.location.reload()
                          }}
                        >
                          Sebelumnya
                        </Button>
                      )}
                      
                      {/* Page numbers - show max 5 pages */}
                      {(() => {
                        const totalPages = data.pagination.totalPages
                        const current = currentPage
                        let startPage = Math.max(1, current - 2)
                        const endPage = Math.min(totalPages, startPage + 4)
                        
                        if (endPage - startPage < 4) {
                          startPage = Math.max(1, endPage - 4)
                        }
                        
                        const pages = []
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i)
                        }
                        
                        return pages.map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            className="w-10"
                            onClick={() => {
                              const params = new URLSearchParams(searchParams.toString())
                              params.set('page', page.toString())
                              window.history.pushState(null, '', `?${params.toString()}`)
                              window.location.reload()
                            }}
                          >
                            {page}
                          </Button>
                        ))
                      })()}
                      
                      {currentPage < (data?.pagination?.totalPages || 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('page', (currentPage + 1).toString())
                            window.history.pushState(null, '', `?${params.toString()}`)
                            window.location.reload()
                          }}
                        >
                          Selanjutnya
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada produk ditemukan</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Coba ubah filter pencarian atau kata kunci Anda
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.history.pushState(null, '', '/products')
                      window.location.reload()
                    }}
                  >
                    Lihat Semua Produk
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}