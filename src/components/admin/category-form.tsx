'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  description: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

interface CategoryFormProps {
  category?: Category
  isEdit?: boolean
}

export function CategoryForm({ category, isEdit = false }: CategoryFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string>(category?.image || '')
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    }
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('images', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setImage(data.urls[0])
        toast({
          title: 'Berhasil',
          description: 'Gambar berhasil diupload'
        })
      } else {
        toast({
          title: 'Gagal',
          description: 'Gagal mengupload gambar',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat upload',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImage('')
  }

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/categories/${category?.id}` : '/api/admin/categories'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          image
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Kategori berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`
        })
        router.push('/admin/categories')
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || `Gagal ${isEdit ? 'memperbarui' : 'membuat'} kategori`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masukkan nama kategori"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Deskripsi kategori"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Image */}
        <Card>
          <CardHeader>
            <CardTitle>Gambar Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image">Upload Gambar</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG. Maksimal 5MB
              </p>
            </div>

            {image && (
              <div className="relative aspect-video">
                <Image
                  src={image}
                  alt="Category image"
                  fill
                  className="object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {uploading && (
              <div className="text-center text-sm text-gray-600">
                Mengupload gambar...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Kategori' : 'Buat Kategori'}
        </Button>
      </div>
    </form>
  )
}