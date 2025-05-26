'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminUserCard } from '@/components/admin/admin-user-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, UserPlus, Users, Shield, Ban } from 'lucide-react'
import Link from 'next/link'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER'
  address?: string
  createdAt: string
  updatedAt: string
  _count: {
    orders: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getUserStats = () => {
    const total = users.length
    const customers = users.filter(u => u.role === 'CUSTOMER').length
    const admins = users.filter(u => u.role === 'ADMIN').length
    const activeCustomers = users.filter(u => u.role === 'CUSTOMER' && u._count.orders > 0).length
    
    return { total, customers, admins, activeCustomers }
  }

  const stats = getUserStats()

  if (loading) {
    return (
      <div className="p-3 space-y-3">
        <AdminBreadcrumb 
          items={[
            { label: 'Pelanggan' }
          ]} 
        />
        
        <div className="bg-card rounded-lg border p-3">
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-3 w-96" />
        </div>
        
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-3">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Search Filter Loading */}
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
        
        {/* Users List Loading */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Pelanggan' }
        ]} 
      />
      
      {/* Header Section - Compact */}
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Manajemen Pengguna</h1>
            <p className="text-xs text-muted-foreground">Kelola akun pengguna sistem</p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Ultra Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{stats.total}</p>
              </div>
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin</p>
                <p className="text-xl font-bold text-green-600 mt-0.5">{stats.admins}</p>
              </div>
              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</p>
                <p className="text-xl font-bold text-blue-600 mt-0.5">{stats.customers}</p>
              </div>
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-3 w-3 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Aktif</p>
                <p className="text-xl font-bold text-purple-600 mt-0.5">{stats.activeCustomers}</p>
              </div>
              <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Ban className="h-3 w-3 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter - Compact */}
      <Card className="bg-card">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <Card className="bg-card border-2 border-dashed border-muted">
            <CardContent className="text-center py-12">
              <div className="flex flex-col items-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada pengguna ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Coba ubah kata kunci pencarian Anda' 
                    : 'Mulai dengan menambahkan pengguna pertama'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link href="/admin/users/new">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Tambah Pengguna Pertama
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <AdminUserCard key={user.id} user={user} onUpdate={fetchUsers} />
          ))
        )}
      </div>
    </div>
  )
}