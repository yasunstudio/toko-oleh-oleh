'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { CategoryForm } from '@/components/admin/category-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export default function EditCategoryPage() {
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCategory = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/categories/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
      }
    } catch (error) {
      console.error('Error fetching category:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchCategory()
    }
  }, [params.id, fetchCategory])

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Card className="max-w-md w-full bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Kategori Tidak Ditemukan
              </CardTitle>
              <p className="text-muted-foreground">
                Kategori yang Anda cari tidak tersedia.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="mb-8 bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            Edit Kategori
          </CardTitle>
          <p className="text-muted-foreground">
            Perbarui informasi kategori {category.name}
          </p>
        </CardHeader>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <CategoryForm category={category} isEdit />
        </CardContent>
      </Card>
    </div>
  )
}