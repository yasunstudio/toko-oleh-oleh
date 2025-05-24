'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Eye } from 'lucide-react'
import { Product, ProductImage } from '@/types'
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

interface AdminProductCardProps {
  product: Product
  onUpdate: () => void
}

export function AdminProductCard({ product, onUpdate }: AdminProductCardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(price)
    } catch (error) {
      console.error('Error formatting price:', error)
      return `Rp${price.toString()}`
    }
  }

  // Get product image URL safely
  const getProductImageUrl = (): string => {
    try {
      if (!product.images || product.images.length === 0) {
        return '/placeholder.jpg'
      }
      
      const firstImage = product.images[0]
      if (typeof firstImage === 'string') {
        return firstImage
      } else if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
        return firstImage.url
      }
      
      return '/placeholder.jpg'
    } catch (error) {
      console.error('Error getting product image:', error)
      return '/placeholder.jpg'
    }
  }

  const handleToggleActive = async (isActive: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Produk ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui status produk',
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

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Produk berhasil dihapus'
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus produk',
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

  // Safety checks
  if (!product) {
    return null
  }

  return (
    <Card className="group">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={getProductImageUrl()}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!product.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-red-500 text-white">
              Non-Aktif
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          {product.category ? (
            <Badge variant="secondary">
              {product.category.name}
            </Badge>
          ) : (
            <Badge variant="outline">
              Tanpa Kategori
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'Tidak ada deskripsi'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-gray-500">
              Stok: {product.stock}
              {product.stock < 10 && (
                <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-600">
                  Rendah
                </Badge>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Aktif</span>
            <Switch
              checked={product.isActive}
              onCheckedChange={handleToggleActive}
              disabled={loading}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/products/${product.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Lihat
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Menghapus...' : 'Hapus'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}