'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { UserForm } from '@/components/admin/user-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER'
  address?: string
}

export default function EditUserPage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
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
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Card className="max-w-md w-full bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Pengguna Tidak Ditemukan
              </CardTitle>
              <p className="text-muted-foreground">
                Pengguna yang Anda cari tidak tersedia.
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
            Edit Pengguna
          </CardTitle>
          <p className="text-muted-foreground">
            Perbarui informasi pengguna {user.name}
          </p>
        </CardHeader>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <UserForm user={user} isEdit />
        </CardContent>
      </Card>
    </div>
  )
}