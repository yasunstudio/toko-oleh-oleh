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
        <Card>
          <CardHeader>
            <CardTitle>Informasi Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="nama@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="08123456789"
              />
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Alamat lengkap"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select onValueChange={(value) => setValue('role', value as 'ADMIN' | 'CUSTOMER')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Pelanggan</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">
                Password {isEdit ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={isEdit ? 'Password baru' : 'Password (min. 6 karakter)'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {!isEdit && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendWelcomeEmail"
                  checked={watch('sendWelcomeEmail')}
                  onCheckedChange={(checked) => setValue('sendWelcomeEmail', checked as boolean)}
                />
                <Label htmlFor="sendWelcomeEmail" className="text-sm">
                  Kirim email selamat datang
                </Label>
              </div>
            )}

            {isEdit && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Perhatian:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
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
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
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