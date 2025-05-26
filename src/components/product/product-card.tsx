'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart-store'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Star, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Product, ProductImage } from '@/types'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  priority?: boolean // For LCP optimization on above-the-fold images
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  const { addItem } = useCartStore()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

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

  const handleAddToCart = async () => {
    if (isAddingToCart) return // Prevent double clicks
    
    if (!session) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan login terlebih dahulu untuk menambahkan produk ke keranjang',
        variant: 'destructive'
      })
      router.push('/auth/login')
      return
    }

    if (product.stock === 0) {
      toast({
        title: 'Stok Habis',
        description: 'Produk ini sedang tidak tersedia',
        variant: 'destructive'
      })
      return
    }

    setIsAddingToCart(true)

    try {
      // Add to server cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      if (response.ok) {
        // Validate product before adding to cart
        if (!product || !product.id) {
          toast({
            title: 'Error',
            description: 'Data produk tidak valid',
            variant: 'destructive'
          })
          return
        }

        // Format images to ensure they match the ProductImage type
        const formattedImages: ProductImage[] = Array.isArray(product.images) 
          ? product.images.map(img => {
              // Handle both string[] and ProductImage[]
              if (typeof img === 'string') {
                return { id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, url: img }
              } else {
                return img
              }
            })
          : []
        
        // Add to local cart store with properly formatted product
        addItem({
          ...product,
          images: formattedImages
        })

        toast({
          title: 'Berhasil!',
          description: 'Produk ditambahkan ke keranjang'
        })
      } else {
        const data = await response.json()
        if (response.status === 401) {
          toast({
            title: 'Session Berakhir',
            description: 'Silakan login kembali',
            variant: 'destructive'
          })
          router.push('/auth/login')
        } else {
          toast({
            title: 'Gagal',
            description: data.error || 'Gagal menambahkan ke keranjang',
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        variant: 'destructive'
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
      <div className="relative aspect-square overflow-hidden rounded-t-lg border-b border-border">
        <Image
          src={getProductImageUrl()}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 dark:bg-background/70 flex items-center justify-center">
            <Badge variant="destructive" className="text-destructive-foreground">
              Stok Habis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-2">
        <div className="flex items-start justify-between mb-1">
          {product.category ? (
            <Badge variant="secondary" className="text-xs text-secondary-foreground bg-secondary">
              {product.category.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              Tanpa Kategori
            </Badge>
          )}
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-500 dark:text-yellow-400" />
            <span className="text-xs text-muted-foreground ml-1">4.5</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-xs mb-1 hover:text-primary transition-colors line-clamp-2 text-foreground">
            {product.name}
          </h3>
        </Link>

        <p className="text-muted-foreground text-xs mb-1 line-clamp-1">
          {product.description || 'Tidak ada deskripsi produk'}
        </p>

        <div className="flex flex-col">
          <p className="text-sm font-bold text-primary mb-1">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-muted-foreground">
            Stok: {product.stock}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <div className="flex flex-col gap-1 w-full">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-7"
          >
            <Link href={`/products/${product.slug}`}>
              Detail
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="text-xs h-7"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 mr-1" />
                Keranjang
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}