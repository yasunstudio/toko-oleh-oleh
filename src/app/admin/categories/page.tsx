'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminCategoryCard } from '@/components/admin/admin-category-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search } from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count: {
    products: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <AdminBreadcrumb 
          items={[
            { label: 'Inventori' },
            { label: 'Kategori' }
          ]} 
        />
        
        <div className="bg-card rounded-lg border p-3">
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-3 w-96" />
        </div>
        
        <Card className="bg-card">
          <CardContent className="p-3">
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
          { label: 'Kategori' }
        ]} 
      />
      
      {/* Header Section - Compact */}
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Manajemen Kategori</h1>
            <p className="text-xs text-muted-foreground">Kelola semua kategori produk</p>
          </div>
          <Button asChild>
            <Link href="/admin/categories/new" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Filter - Compact */}
      <Card className="bg-card">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kategori berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.length === 0 ? (
          <Card className="col-span-full bg-card border-2 border-dashed border-muted">
            <CardContent className="text-center py-12">
              <div className="flex flex-col items-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada kategori ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Coba ubah kata kunci pencarian Anda' 
                    : 'Mulai dengan menambahkan kategori pertama'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/admin/categories/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori Pertama
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category) => (
            <AdminCategoryCard key={category.id} category={category} onUpdate={fetchCategories} />
          ))
        )}
      </div>
    </div>
  )
}