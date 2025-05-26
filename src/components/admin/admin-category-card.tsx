'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Eye } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count: {
    products: number
  }
}

interface AdminCategoryCardProps {
  category: Category
  onUpdate: () => void
}

export function AdminCategoryCard({ category, onUpdate }: AdminCategoryCardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (category._count.products > 0) {
      toast({
        title: 'Tidak dapat menghapus',
        description: 'Kategori ini masih memiliki produk. Hapus produk terlebih dahulu.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Kategori berhasil dihapus'
        })
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus kategori',
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
    <Card className="group bg-card">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <Image
          src={category.image || '/placeholder-category.jpg'}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground">
          {category.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {category.description || 'Tidak ada deskripsi'}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {category._count.products} produk
          </Badge>
          <span className="text-xs text-muted-foreground">
            /{category.slug}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/products?category=${category.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Lihat
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/admin/categories/${category.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:text-destructive/90"
                disabled={category._count.products > 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Hapus Kategori</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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