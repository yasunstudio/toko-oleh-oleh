'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Plus, Minus, Star, Truck } from 'lucide-react'
import { Product } from '@/types'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return 'Rp 0'
    
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(price)
    } catch (error) {
      console.error('Error formatting price:', error)
      return `Rp ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async (): Promise<boolean> => {
    if (loading) return false // Prevent double clicks
    
    if (!session) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan login terlebih dahulu untuk menambahkan produk ke keranjang',
        variant: 'destructive'
      })
      router.push('/auth/login')
      return false
    }

    if (product.stock === 0) {
      toast({
        title: 'Stok Habis',
        description: 'Produk ini sedang tidak tersedia',
        variant: 'destructive'
      })
      return false
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
        // Validate product before adding to cart
        if (!product || !product.id) {
          toast({
            title: 'Error',
            description: 'Data produk tidak valid',
            variant: 'destructive'
          })
          return false
        }

        addItem(product, quantity)

        toast({
          title: 'Berhasil!',
          description: `${quantity} ${product.name} ditambahkan ke keranjang`
        })
        return true
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menambahkan ke keranjang',
          variant: 'destructive'
        })
        return false
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Category & Rating */}
      <div className="flex items-center justify-between">
        {product.category ? (
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{product.category.name}</Badge>
        ) : (
          <Badge variant="outline" className="border-border text-muted-foreground">Tanpa Kategori</Badge>
        )}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground/50'}`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-2">(4.0)</span> {/* Assuming static rating */}
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>

      {/* Price */}
      <div className="space-y-2">
        <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
        {product.weight && (
          <p className="text-sm text-muted-foreground">Berat: {product.weight} gram</p>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground">Stok:</span>
        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}
          className={`${product.stock > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40' : 'bg-destructive text-destructive-foreground' }`}
        >
          {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
        </Badge>
      </div>

      {/* Description */}
      <div>
        {product.description ? (
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        ) : (
          <p className="text-muted-foreground/70 italic">Tidak ada deskripsi produk</p>
        )}
      </div>

      {/* Quantity Selector */}
      {product.stock > 0 && (
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-foreground">Jumlah</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="border-border hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-20 text-center bg-background border-border focus:border-primary"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="border-border hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="space-y-4">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {loading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
        </Button>

        {session && (
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={async () => {
              await handleAddToCart()
              router.push('/cart')
            }}
            disabled={product.stock === 0 || loading}
          >
            Beli Sekarang
          </Button>
        )}
      </div>

      {/* Shipping Info */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Truck className="h-4 w-4 text-primary" />
          <span>Gratis ongkir untuk pembelian di atas Rp. 100.000</span>
        </div>
      </div>
    </div>
  )
}