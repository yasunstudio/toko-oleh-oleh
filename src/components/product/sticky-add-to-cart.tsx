'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Product } from '@/types'

interface StickyAddToCartProps {
  product: Product
}

export function StickyAddToCart({ product }: StickyAddToCartProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(price)
    } catch (error) {
      return `Rp ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (loading) return
    
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

    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      })

      if (response.ok) {
        addItem(product, quantity)
        toast({
          title: 'Berhasil!',
          description: `${quantity} ${product.name} ditambahkan ke keranjang`
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
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Hide the sticky cart if product is out of stock
  // We already hide this on larger screens with the lg:hidden class
  if (product.stock === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50 lg:hidden">
      <div className="max-w-screen-sm mx-auto">
        <div className="flex items-center space-x-4">
          {/* Price */}
          <div className="flex-1">
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{product.name}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Keranjang'}
          </Button>
        </div>
      </div>
    </div>
  )
}
