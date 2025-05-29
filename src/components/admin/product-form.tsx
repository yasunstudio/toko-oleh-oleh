'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UploadThingImageUploader } from '@/components/upload/uploadthing-uploader'
import { CustomUploadThing } from '@/components/upload/uploadthing-custom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from "@/hooks/use-toast"
import { X } from 'lucide-react'
import { Product, Category } from '@/types'
import Image from 'next/image'
import { createProductAction } from '@/app/actions'

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().optional(),
  price: z.number().min(1, 'Harga harus lebih dari 0'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  weight: z.number().optional(),
  isActive: z.boolean()
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  isEdit?: boolean
}

export function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>(() => {
    if (!product?.images) return [];
    
    // Handle different image formats
    if (Array.isArray(product.images)) {
      if (typeof product.images[0] === 'string') {
        return product.images as string[];
      } else {
        // Convert ProductImage objects to string URLs
        return product.images.map((img: any) => img.url);
      }
    }
    
    return [];
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      categoryId: product?.category?.id || '',
      weight: product?.weight || 0,
      isActive: product?.isActive ?? true
    }
  })

  // No debugging functions needed

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (images.length === 0) {
      toast({
        title: 'Gambar diperlukan',
        description: 'Upload minimal satu gambar produk',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      // For new products, use the server action
      if (!isEdit) {
        const result = await createProductAction({
          ...data,
          images
        })
        
        if (result.success) {
          toast({
            title: 'Berhasil',
            description: 'Produk berhasil dibuat'
          })
          router.push('/admin/products')
          return
        } else {
          toast({
            title: 'Gagal',
            description: result.error || 'Gagal membuat produk',
            variant: 'destructive'
          })
          return
        }
      }
      
      // For edit mode, use the API
      const url = `/api/admin/products/${product?.id}`
      const method = 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          images
        }),
        credentials: 'include' // Include cookies for authentication
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Produk berhasil diperbarui'
        })
        router.push('/admin/products')
      } else {
        let errorData = { error: 'Unknown error' }
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        
        toast({
          title: 'Gagal',
          description: errorData.error || 'Gagal memperbarui produk',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
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
        {/* Product Info */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Nama Produk *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masukkan nama produk"
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
                placeholder="Deskripsi produk"
                rows={4}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-foreground">Harga (Rp) *</Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock" className="text-foreground">Stok *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  placeholder="0"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.stock && (
                  <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId" className="text-foreground">Kategori *</Label>
                <Select 
                  onValueChange={(value) => setValue('categoryId', value)}
                  defaultValue={product?.category?.id}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="weight" className="text-foreground">Berat (gram)</Label>
                <Input
                  id="weight"
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  placeholder="0"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <Label htmlFor="isActive" className="text-foreground">Produk Aktif</Label>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Gambar Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-foreground">Upload Gambar Produk</Label>
              <CustomUploadThing
                onUploadComplete={(urls) => {
                  setImages(prev => [...prev, ...urls])
                  toast({
                    title: 'Berhasil',
                    description: `${urls.length} gambar berhasil diupload`
                  })
                }}
                onUploadError={(error) => {
                  toast({
                    title: 'Upload gagal',
                    description: error.message,
                    variant: 'destructive'
                  })
                }}
                maxFiles={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maksimal 4 gambar, ukuran 4MB per file. Format: JPG, PNG, WebP.
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={image}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover rounded border border-border group-hover:opacity-80 transition-opacity"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-2">
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
          {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Produk' : 'Buat Produk'}
        </Button>
      </div>
    </form>
  )
}
