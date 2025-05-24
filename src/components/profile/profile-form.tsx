'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  role: 'ADMIN' | 'CUSTOMER'
}

interface ProfileFormProps {
  profile: UserProfile
  onUpdate: () => void
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone || '',
      address: profile.address || '',
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Profile berhasil diperbarui'
        })
        onUpdate()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Gagal memperbarui profile',
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Email tidak dapat diubah. Hubungi admin jika perlu mengubah email.
        </p>
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

      <Button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  )
}