'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Upload, X, Palette, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

const heroSlideSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  subtitle: z.string().optional(),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  backgroundColor: z.string().optional(),
  textColor: z.string().min(1, 'Warna teks wajib diisi'),
  primaryButtonText: z.string().min(1, 'Teks tombol utama wajib diisi'),
  primaryButtonLink: z.string().min(1, 'Link tombol utama wajib diisi'),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  order: z.number().min(1, 'Urutan minimal 1'),
  isActive: z.boolean()
})

type HeroSlideFormData = z.infer<typeof heroSlideSchema>

interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string
  backgroundImage: string | null
  backgroundColor: string | null
  textColor: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string | null
  secondaryButtonLink: string | null
  order: number
  isActive: boolean
}

interface HeroSlideFormProps {
  slide?: HeroSlide | null
  onSuccess: () => void
  onCancel: () => void
}

export function HeroSlideForm({ slide, onSuccess, onCancel }: HeroSlideFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string>(slide?.backgroundImage || '')
  const [uploading, setUploading] = useState(false)
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>(
    slide?.backgroundImage ? 'image' : 'color'
  )

  const isEdit = !!slide

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<HeroSlideFormData>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      title: slide?.title || '',
      subtitle: slide?.subtitle || '',
      description: slide?.description || '',
      backgroundColor: slide?.backgroundColor || '#3b82f6',
      textColor: slide?.textColor || '#ffffff',
      primaryButtonText: slide?.primaryButtonText || 'Lihat Produk',
      primaryButtonLink: slide?.primaryButtonLink || '/products',
      secondaryButtonText: slide?.secondaryButtonText || '',
      secondaryButtonLink: slide?.secondaryButtonLink || '',
      order: slide?.order || 1,
      isActive: slide?.isActive !== undefined ? slide.isActive : true
    }
  })

  const watchedValues = watch()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'File harus berupa gambar',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Ukuran file maksimal 5MB',
        variant: 'destructive'
      })
      return
    }

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
        setBackgroundImage(data.urls[0])
        toast({
          title: 'Berhasil',
          description: 'Gambar background berhasil diupload'
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
    setBackgroundImage('')
  }

  const onSubmit: SubmitHandler<HeroSlideFormData> = async (data) => {
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/hero-slides/${slide?.id}` : '/api/admin/hero-slides'
      const method = isEdit ? 'PUT' : 'POST'

      const payload = {
        ...data,
        backgroundImage: backgroundType === 'image' ? backgroundImage : null,
        backgroundColor: backgroundType === 'color' ? data.backgroundColor : null,
        subtitle: data.subtitle || null,
        secondaryButtonText: data.secondaryButtonText || null,
        secondaryButtonLink: data.secondaryButtonLink || null
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Hero slide ${isEdit ? 'diperbarui' : 'dibuat'} dengan sukses`
        })
        onSuccess()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Terjadi kesalahan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Masukkan judul slide"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              {...register('subtitle')}
              placeholder="Masukkan subtitle (opsional)"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Masukkan deskripsi slide"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Button Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pengaturan Tombol</h3>
            
            {/* Primary Button */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryButtonText">Teks Tombol Utama *</Label>
                <Input
                  id="primaryButtonText"
                  {...register('primaryButtonText')}
                  placeholder="Lihat Produk"
                  className={errors.primaryButtonText ? 'border-red-500' : ''}
                />
                {errors.primaryButtonText && (
                  <p className="text-sm text-red-500 mt-1">{errors.primaryButtonText.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="primaryButtonLink">Link Tombol Utama *</Label>
                <Input
                  id="primaryButtonLink"
                  {...register('primaryButtonLink')}
                  placeholder="/products"
                  className={errors.primaryButtonLink ? 'border-red-500' : ''}
                />
                {errors.primaryButtonLink && (
                  <p className="text-sm text-red-500 mt-1">{errors.primaryButtonLink.message}</p>
                )}
              </div>
            </div>

            {/* Secondary Button */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secondaryButtonText">Teks Tombol Kedua</Label>
                <Input
                  id="secondaryButtonText"
                  {...register('secondaryButtonText')}
                  placeholder="Jelajahi Kategori"
                />
              </div>
              <div>
                <Label htmlFor="secondaryButtonLink">Link Tombol Kedua</Label>
                <Input
                  id="secondaryButtonLink"
                  {...register('secondaryButtonLink')}
                  placeholder="/categories"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pengaturan</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Urutan</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  {...register('order', { valueAsNumber: true })}
                  className={errors.order ? 'border-red-500' : ''}
                />
                {errors.order && (
                  <p className="text-sm text-red-500 mt-1">{errors.order.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isActive"
                  checked={watchedValues.isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Background & Preview */}
        <div className="space-y-6">
          {/* Background Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pengaturan Background</h3>
            
            {/* Background Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={backgroundType === 'color' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('color')}
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Warna
              </Button>
              <Button
                type="button"
                variant={backgroundType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('image')}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Gambar
              </Button>
            </div>

            {/* Background Color */}
            {backgroundType === 'color' && (
              <div>
                <Label htmlFor="backgroundColor">Warna Background</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="backgroundColor"
                    type="color"
                    {...register('backgroundColor')}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    {...register('backgroundColor')}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Background Image */}
            {backgroundType === 'image' && (
              <div>
                <Label>Gambar Background</Label>
                {backgroundImage ? (
                  <div className="relative">
                    <Image
                      src={backgroundImage}
                      alt="Background preview"
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Klik untuk upload gambar background
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG hingga 5MB
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="mt-2"
                    />
                  </div>
                )}
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-2">Mengupload...</p>
                )}
              </div>
            )}

            {/* Text Color */}
            <div>
              <Label htmlFor="textColor">Warna Teks</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="textColor"
                  type="color"
                  {...register('textColor')}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  {...register('textColor')}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <Card className="overflow-hidden">
              <div
                className="relative h-64 flex items-center justify-center p-6"
                style={{
                  backgroundColor: backgroundType === 'color' ? watchedValues.backgroundColor : undefined,
                  backgroundImage: backgroundType === 'image' && backgroundImage 
                    ? `url(${backgroundImage})` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {backgroundType === 'image' && backgroundImage && (
                  <div className="absolute inset-0 bg-black/50" />
                )}
                <div className="relative text-center">
                  <h2 
                    className="text-xl font-bold mb-2"
                    style={{ color: watchedValues.textColor }}
                  >
                    {watchedValues.title || 'Judul Slide'}
                  </h2>
                  {watchedValues.subtitle && (
                    <p 
                      className="text-sm mb-2 text-yellow-300"
                    >
                      {watchedValues.subtitle}
                    </p>
                  )}
                  <p 
                    className="text-sm mb-4 opacity-90"
                    style={{ color: watchedValues.textColor }}
                  >
                    {watchedValues.description || 'Deskripsi slide'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" className="bg-background text-foreground">
                      {watchedValues.primaryButtonText || 'Tombol Utama'}
                    </Button>
                    {watchedValues.secondaryButtonText && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-yellow-300 text-yellow-300"
                      >
                        {watchedValues.secondaryButtonText}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
        </Button>
      </div>
    </form>
  )
}
