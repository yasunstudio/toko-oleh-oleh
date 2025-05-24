'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CategoryForm } from '@/components/admin/category-form'
import { Skeleton } from '@/components/ui/skeleton'

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

  useEffect(() => {
    if (params.id) {
      fetchCategory()
    }
  }, [params.id])

  const fetchCategory = async () => {
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
  }

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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Kategori Tidak Ditemukan</h1>
          <p className="text-gray-600">Kategori yang Anda cari tidak tersedia.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Kategori</h1>
        <p className="text-gray-600">Perbarui informasi kategori {category.name}</p>
      </div>

      <CategoryForm category={category} isEdit />
    </div>
  )
}