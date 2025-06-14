'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { CustomUploadThing } from '@/components/upload/uploadthing-custom'

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Nama situs wajib diisi'),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url('URL tidak valid').optional(),
  contactEmail: z.string().email('Email tidak valid'),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
})

type GeneralSettingsData = z.infer<typeof generalSettingsSchema>

interface Settings {
  siteName: string
  siteDescription?: string
  siteUrl?: string
  siteLogo?: string
  contactEmail: string
  contactPhone?: string
  contactAddress?: string
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
}

export function GeneralSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logo, setLogo] = useState<string>('')
  const [settings, setSettings] = useState<Settings | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<GeneralSettingsData>({
    resolver: zodResolver(generalSettingsSchema)
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/general')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setLogo(data.siteLogo || '')
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleLogoUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      setLogo(urls[0])
      toast({
        title: 'Berhasil',
        description: 'Logo berhasil diupload'
      })
    }
  }

  const handleLogoUploadError = (error: Error) => {
    toast({
      title: 'Gagal',
      description: 'Gagal mengupload logo: ' + error.message,
      variant: 'destructive'
    })
  }

  const removeLogo = () => {
    setLogo('')
  }

  const onSubmit = async (data: GeneralSettingsData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          siteLogo: logo
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengaturan umum berhasil disimpan'
        })
        fetchSettings()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Gagal menyimpan pengaturan',
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
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Pengaturan Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Site Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Nama Situs *</Label>
                  <Input
                    id="siteName"
                    {...register('siteName')}
                    placeholder="Toko Oleh-Oleh"
                  />
                  {errors.siteName && (
                    <p className="text-sm text-destructive mt-1">{errors.siteName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="siteDescription">Deskripsi Situs</Label>
                  <Textarea
                    id="siteDescription"
                    {...register('siteDescription')}
                    placeholder="Platform e-commerce untuk oleh-oleh khas daerah"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="siteUrl">URL Situs</Label>
                  <Input
                    id="siteUrl"
                    {...register('siteUrl')}
                    placeholder="https://tokooleholeh.com"
                  />
                  {errors.siteUrl && (
                    <p className="text-sm text-destructive mt-1">{errors.siteUrl.message}</p>
                  )}
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <div>
                  <Label>Logo Situs</Label>
                  <div className="mt-2">
                    {logo ? (
                      <div className="relative w-48 h-24 border border-border rounded-lg overflow-hidden">
                        <Image
                          src={logo}
                          alt="Site Logo"
                          fill
                          className="object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <CustomUploadThing
                          onUploadComplete={handleLogoUploadComplete}
                          onUploadError={handleLogoUploadError}
                          maxFiles={1}
                          endpoint="imageUploader"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: PNG, JPG. Maksimal 4MB. Ukuran optimal: 200x100px
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Informasi Kontak</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email Kontak *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="info@tokooleholeh.com"
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Telepon Kontak</Label>
                  <Input
                    id="contactPhone"
                    {...register('contactPhone')}
                    placeholder="+62 812-3456-7890"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="contactAddress">Alamat</Label>
                  <Textarea
                    id="contactAddress"
                    {...register('contactAddress')}
                    placeholder="Jl. Raya Malang No. 123, Bekasi, Jawa Barat"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Site Options */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Opsi Situs</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Mode Maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Nonaktifkan situs untuk maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={watch('maintenanceMode')}
                    onCheckedChange={(checked) => setValue('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration">Izinkan Registrasi</Label>
                    <p className="text-sm text-muted-foreground">
                      Biarkan pengguna baru mendaftar
                    </p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={watch('allowRegistration')}
                    onCheckedChange={(checked) => setValue('allowRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Verifikasi Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Wajibkan verifikasi email untuk akun baru
                    </p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={watch('requireEmailVerification')}
                    onCheckedChange={(checked) => setValue('requireEmailVerification', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}