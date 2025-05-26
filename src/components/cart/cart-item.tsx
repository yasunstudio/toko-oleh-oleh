'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cart-store'
import { useToast } from "@/hooks/use-toast"
// import { toast } from '@/hooks/use-toast'
import { Trash2, Plus, Minus } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onUpdate: () => void
}

export function CartItem({ item, onUpdate }: CartItemProps) {
  const { toast } = useToast()
  const { updateQuantity, removeItem } = useCartStore()
  const [loading, setLoading] = useState(false)

  // Helper function to get the image URL
  const getProductImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return '/placeholder.jpg' // Ensure placeholder is used if no images
    // Check if the first image is a string (direct URL) or an object with a URL property
    const firstImage = images[0]
    if (typeof firstImage === 'string') return firstImage
    return firstImage?.url || '/placeholder.jpg' // Default to placeholder if URL is missing
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (response.ok) {
        updateQuantity(item.product.id, newQuantity)
        onUpdate()
        toast({
          title: 'Berhasil',
          description: 'Jumlah item diperbarui'
        })
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui jumlah',
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

  const handleRemove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        removeItem(item.product.id)
        onUpdate()
        toast({
          title: 'Berhasil',
          description: 'Item dihapus dari keranjang'
        })
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus item',
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
    <div className="flex items-center space-x-4 py-4 border-b border-border last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Image
          src={getProductImageUrl(item.product.images)}
          alt={item.product.name}
          width={80}
          height={80}
          className="rounded object-cover border border-border"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          Stok tersedia: {item.product.stock}
        </p>
        <p className="text-lg font-semibold text-primary mt-2">
          {formatPrice(item.product.price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityUpdate(item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
          className="h-8 w-8 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min="1"
          max={item.product.stock}
          value={item.quantity}
          onChange={(e) => {
            const newQuantity = parseInt(e.target.value) || 1
            // Basic validation before calling update
            if (newQuantity >= 1 && newQuantity <= item.product.stock) {
              handleQuantityUpdate(newQuantity)
            }
          }}
          onBlur={(e) => { // Ensure value is reset if invalid on blur
            const currentVal = parseInt(e.target.value);
            if (isNaN(currentVal) || currentVal < 1) {
              handleQuantityUpdate(1); 
            } else if (currentVal > item.product.stock) {
              handleQuantityUpdate(item.product.stock);
            }
          }}
          className="w-16 h-8 text-center bg-background border-border text-foreground"
          disabled={loading}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityUpdate(item.quantity + 1)}
          disabled={loading || item.quantity >= item.product.stock}
          className="h-8 w-8 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleRemove}
        disabled={loading}
        className="h-8 w-8 text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}