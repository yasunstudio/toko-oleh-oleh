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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

const createUserSchema = (isEdit: boolean) => z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: isEdit 
    ? z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal(''))
    : z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'CUSTOMER']),
  sendWelcomeEmail: z.boolean().optional()
})

type UserFormData = z.infer<ReturnType<typeof createUserSchema>>

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER'
  address?: string
}

interface UserFormProps {
  user?: User
  isEdit?: boolean
}

export function UserForm({ user, isEdit = false }: UserFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema(isEdit)),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      role: user?.role || 'CUSTOMER',
      sendWelcomeEmail: !isEdit
    }
  })

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/users/${user?.id}` : '/api/admin/users'
      const method = isEdit ? 'PATCH' : 'POST'

      // Don't send empty password on edit
      if (isEdit && !data.password) {
        delete data.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Pengguna berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`
        })
        router.push('/admin/users')
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || `Gagal ${isEdit ? 'memperbarui' : 'membuat'} pengguna`,
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
        {/* Personal Information */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Informasi Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Nama Lengkap *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masukkan nama lengkap"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="nama@example.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-foreground">No. Telepon</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="08123456789"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-foreground">Alamat</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Alamat lengkap"
                rows={3}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Pengaturan Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="role" className="text-foreground">Role *</Label>
              <Select 
                onValueChange={(value) => setValue('role', value as 'ADMIN' | 'CUSTOMER')}
                defaultValue={watch('role')}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="CUSTOMER">Pelanggan</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                Password {isEdit ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={isEdit ? 'Password baru' : 'Password (min. 6 karakter)'}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {!isEdit && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="sendWelcomeEmail"
                  checked={watch('sendWelcomeEmail')}
                  onCheckedChange={(checked) => setValue('sendWelcomeEmail', checked as boolean)}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor="sendWelcomeEmail" className="text-sm font-medium text-foreground">
                  Kirim email selamat datang
                </Label>
              </div>
            )}

            {isEdit && (
              <div className="bg-accent/50 border border-border rounded-lg p-4">
                <h4 className="font-medium text-accent-foreground mb-2">Perhatian:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mengubah email akan memerlukan verifikasi ulang</li>
                  <li>• Mengubah role akan mempengaruhi akses pengguna</li>
                  <li>• Password kosong = tidak mengubah password</li>
                </ul>
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
          {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Pengguna' : 'Buat Pengguna'}
        </Button>
      </div>
    </form>
  )
}