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
import { X } from 'lucide-react'
import Image from 'next/image'
import { UploadThingImageUploader } from '@/components/upload/uploadthing-uploader'

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

  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setImage(urls[0])
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil diupload'
      })
    }
  }

  const handleUploadError = (error: Error) => {
    toast({
      title: 'Gagal',
      description: 'Gagal mengupload gambar: ' + error.message,
      variant: 'destructive'
    })
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
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Informasi Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Nama Kategori *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masukkan nama kategori"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">Deskripsi</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Deskripsi kategori"
                rows={4}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Image */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Gambar Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-foreground">Upload Gambar</Label>
              {!image ? (
                <UploadThingImageUploader
                  endpoint="imageUploader"
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              ) : (
                <div className="relative aspect-video">
                  <Image
                    src={image}
                    alt="Category image"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover rounded border border-border"
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
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPG, PNG. Maksimal 4MB
              </p>
            </div>
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
          className="border-border hover:bg-accent hover:text-accent-foreground"
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Kategori' : 'Buat Kategori'}
        </Button>
      </div>
    </form>
  )
}