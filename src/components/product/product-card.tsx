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
}

export function ProductCard({ product }: ProductCardProps) {
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
    if (!session) {
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
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menambahkan ke keranjang',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menambahkan ke keranjang',
        variant: 'destructive'
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={getProductImageUrl()}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-red-500 text-white">
              Stok Habis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          {product.category ? (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Tanpa Kategori
            </Badge>
          )}
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">4.5</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'Tidak ada deskripsi produk'}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-gray-500">
              Stok: {product.stock}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <Link href={`/products/${product.slug}`}>
              Detail
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="flex-1"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Keranjang
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}