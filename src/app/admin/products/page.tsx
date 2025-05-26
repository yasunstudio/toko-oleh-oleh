'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminProductCard } from '@/components/admin/admin-product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  SortAsc, 
  SortDesc, 
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { Product, Category } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'

type SortOption = 'name' | 'price' | 'stock' | 'createdAt'
type SortOrder = 'asc' | 'desc'
type StatusFilter = 'all' | 'active' | 'inactive' | 'lowStock' | 'outOfStock'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data || [])
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleRefresh = () => {
    fetchProducts()
  }

  // Advanced filtering and sorting logic using useMemo for performance
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))

      // Category filter
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter

      // Status filter
      let matchesStatus = true
      switch (statusFilter) {
        case 'active':
          matchesStatus = product.isActive
          break
        case 'inactive':
          matchesStatus = !product.isActive
          break
        case 'lowStock':
          matchesStatus = product.stock > 0 && product.stock < 10
          break
        case 'outOfStock':
          matchesStatus = product.stock === 0
          break
        default:
          matchesStatus = true
      }

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder])

  const getProductStats = () => {
    const total = products.length
    const active = products.filter(p => p.isActive).length
    const inactive = products.filter(p => !p.isActive).length
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length
    const outOfStock = products.filter(p => p.stock === 0).length
    
    return { total, active, inactive, lowStock, outOfStock }
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const stats = getProductStats()

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <AdminBreadcrumb 
          items={[
            { label: 'Inventori' },
            { label: 'Produk' }
          ]} 
        />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Filter Controls Loading */}
        <Card className="mb-6 bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Products Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="bg-card">
              <Skeleton className="aspect-square w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Skeleton className="h-6 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Inventori' },
          { label: 'Produk' }
        ]} 
      />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manajemen Produk</h1>
          <p className="text-xs text-muted-foreground">Kelola semua produk toko</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Link>
        </Button>
      </div>
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-card hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Total Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredAndSortedProducts.length} ditampilkan
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((stats.active / stats.total) * 100).toFixed(1)}% dari total
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Non-Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.inactive}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((stats.inactive / stats.total) * 100).toFixed(1)}% dari total
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <div className="text-xs text-muted-foreground mt-1">
              &lt; 10 unit tersisa
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Stok Habis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Perlu restok
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Advanced Search & Filter Controls */}
      <Card className="mb-6 bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk berdasarkan nama, kategori, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-Aktif</SelectItem>
                    <SelectItem value="lowStock">Stok Rendah</SelectItem>
                    <SelectItem value="outOfStock">Stok Habis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Tanggal Dibuat</SelectItem>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="price">Harga</SelectItem>
                    <SelectItem value="stock">Stok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                className="shrink-0"
                title={`Urutan: ${sortOrder === 'asc' ? 'Naik' : 'Turun'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="shrink-0"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="px-3 py-1">
                  Pencarian: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Kategori: {categories.find(c => c.id === categoryFilter)?.name}
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Status: {statusFilter === 'active' ? 'Aktif' : 
                          statusFilter === 'inactive' ? 'Non-Aktif' :
                          statusFilter === 'lowStock' ? 'Stok Rendah' : 'Stok Habis'}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Products Grid - Changed to 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedProducts.length === 0 ? (
          <Card className="col-span-full bg-card border-2 border-dashed border-muted">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada produk ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Coba ubah filter pencarian Anda' 
                  : 'Mulai dengan menambahkan produk pertama'}
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/admin/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk Pertama
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedProducts.map((product: Product) => (
            <AdminProductCard key={product.id} product={product} onUpdate={fetchProducts} />
          ))
        )}
      </div>
    </div>
  )
}