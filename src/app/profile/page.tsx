'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { ProfileForm, ChangePasswordForm } from '@/components/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { User, Lock, ShoppingBag } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  role: 'ADMIN' | 'CUSTOMER'
  createdAt: string
  _count: {
    orders: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchProfile()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <div className="lg:col-span-2">
               <Skeleton className="h-96" />
             </div>
           </div>
         </div>
       </div>
     </MainLayout>
   )
 }

 if (!profile) {
   return (
     <MainLayout>
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="text-center">
           <h1 className="text-2xl font-bold mb-4 text-foreground">Profile Tidak Ditemukan</h1>
           <p className="text-muted-foreground">Terjadi kesalahan saat memuat profile Anda.</p>
         </div>
       </div>
     </MainLayout>
   )
 }

 return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">Profile Saya</CardTitle>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card">
              <CardContent className="p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-2 text-foreground">{profile.name}</h2>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <Badge className={profile.role === 'ADMIN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}>
                  {profile.role === 'ADMIN' ? 'Administrator' : 'Pelanggan'}
                </Badge>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Pesanan</span>
                    <span className="font-medium text-foreground">{profile._count.orders}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bergabung</span>
                    <span className="font-medium text-foreground">
                      {new Date(profile.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Profile Management */}
          <div className="lg:col-span-2">
            <Card className="bg-card">
              <CardContent>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted">
                    <TabsTrigger value="profile" className="flex items-center text-foreground">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex items-center text-foreground">
                      <Lock className="h-4 w-4 mr-2" />
                      Password
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center text-foreground">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Pesanan
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="mt-6">
                    <Card className="shadow-none border-0 bg-card">
                      <CardHeader>
                        <CardTitle className="text-foreground">Edit Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ProfileForm profile={profile} onUpdate={fetchProfile} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="password" className="mt-6">
                    <Card className="shadow-none border-0 bg-card">
                      <CardHeader>
                        <CardTitle className="text-foreground">Ubah Password</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChangePasswordForm />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="orders" className="mt-6">
                    <Card className="shadow-none border-0 bg-card">
                      <CardHeader>
                        <CardTitle className="text-foreground">Riwayat Pesanan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Anda memiliki {profile._count.orders} pesanan
                          </p>
                          <Button asChild>
                            <Link href="/orders">Lihat Semua Pesanan</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}