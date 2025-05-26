'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Category {
  id: string
  name: string
  slug: string
  image?: string
  description?: string
  _count: {
    products: number
  }
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeCount=true&limit=4')
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
    <section className="py-10 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Jelajahi Kategori
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai macam oleh-oleh berdasarkan kategori pilihan
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg bg-muted" />
                <Skeleton className="h-3 w-3/4 bg-muted" />
                <Skeleton className="h-2 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <Image
                        src={category.image || '/placeholder-category.jpg'}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-2">
                      <h3 className="font-semibold text-xs mb-1 group-hover:text-primary transition-colors text-foreground line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                        {category.description || 'Berbagai produk berkualitas'}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        {category._count?.products || 0} produk
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Button size="sm" variant="outline" asChild>
                <Link href="/categories">
                  Lihat Semua Kategori
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}