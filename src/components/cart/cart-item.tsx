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
    if (!images || images.length === 0) return '/placeholder.jpg'
    if (typeof images[0] === 'string') return images[0]
    return images[0]?.url || '/placeholder.jpg'
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
    <div className="flex items-center space-x-4 py-4 border-b last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Image
          src={getProductImageUrl(item.product.images)}
          alt={item.product.name}
          width={80}
          height={80}
          className="rounded object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="text-lg font-medium text-gray-900 hover:text-primary"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-gray-500 mt-1">
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
          size="sm"
          onClick={() => handleQuantityUpdate(item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
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
            handleQuantityUpdate(newQuantity)
          }}
          className="w-16 text-center"
          disabled={loading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityUpdate(item.quantity + 1)}
          disabled={loading || item.quantity >= item.product.stock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRemove}
        disabled={loading}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}