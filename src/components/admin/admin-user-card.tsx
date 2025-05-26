'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Edit, 
  Trash2,
  Shield,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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

interface AdminUserCardProps {
  user: User
  onUpdate: () => void
}

export function AdminUserCard({ user, onUpdate }: AdminUserCardProps) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState(false)

  const handleRoleUpdate = async (newRole: string) => {
    if (newRole === user.role) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Role pengguna berhasil diperbarui'
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui role',
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
      setUpdating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (user._count.orders > 0) {
      toast({
        title: 'Tidak dapat menghapus',
        description: 'Pengguna ini memiliki riwayat pesanan. Tidak dapat dihapus.',
        variant: 'destructive'
      })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengguna berhasil dihapus'
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus pengguna',
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
      setUpdating(false)
    }
  }

  const getRoleBadgeStyle = (role: string): { variant: 'outline'; className: string } | { variant: 'secondary' } => {
    if (role === 'ADMIN') {
      return { variant: 'outline', className: 'text-green-600 border-green-500 bg-green-500/10 font-medium' }
    } else {
      return { variant: 'outline', className: 'text-blue-600 border-blue-500 bg-blue-500/10 font-medium' }
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className="bg-card text-foreground">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold flex items-center text-foreground">
                {user.name}
                {user.role === 'ADMIN' && (
                  <Shield className="h-4 w-4 ml-2 text-green-600" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge {...getRoleBadgeStyle(user.role)}>
              {user.role === 'ADMIN' ? 'Administrator' : 'Pelanggan'}
            </Badge>
            {user._count.orders > 0 && (
              <Badge variant="outline" className="border-border text-muted-foreground">
                {user._count.orders} pesanan
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-6">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.phone}</span>
              </div>
            )}
            
            {user.address && (
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="line-clamp-2 text-foreground">{user.address}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                Bergabung {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: id })}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user._count.orders} total pesanan</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                Terakhir update {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm', { locale: id })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Role:</span>
            <Select 
              value={user.role} 
              onValueChange={handleRoleUpdate}
              disabled={updating}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Pelanggan</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive/90 border-destructive/50 hover:border-destructive/70"
                  disabled={user._count.orders > 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Hapus Pengguna</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Apakah Anda yakin ingin menghapus pengguna "{user.name}"? 
                    Tindakan ini tidak dapat dibatalkan.
                    {user._count.orders > 0 && (
                      <span className="block mt-2 text-destructive font-medium">
                        Pengguna ini memiliki {user._count.orders} pesanan dan tidak dapat dihapus.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteUser}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={updating || user._count.orders > 0}
                  >
                    {updating ? 'Menghapus...' : 'Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}