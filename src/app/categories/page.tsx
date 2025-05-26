'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeCount=true')
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Semua Kategori</h1>
          <p className="text-muted-foreground">Jelajahi berbagai kategori produk oleh-oleh khas daerah</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-card">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={category.image || '/placeholder-category.jpg'}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {category.description || 'Berbagai produk berkualitas'}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {category._count?.products || 0} produk
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Belum ada kategori tersedia</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}