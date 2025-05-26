'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Check, AlertTriangle, Shield, Award, Package } from 'lucide-react'
import { Product } from '@/types'

interface OrderSummaryProps {
  product: Product;
  mobilePriority?: boolean;
}

export function OrderSummary({ product, mobilePriority = false }: OrderSummaryProps) {
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
    <div className={`space-y-6 ${mobilePriority ? 'mb-24' : ''}`}>
      <Card className="shadow-md border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Price */}
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Harga Satuan</span>
            <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
          </div>
          
          {/* Quantity */}
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Jumlah</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Total Price */}
          <div className="flex justify-between items-center py-2 pt-3">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-xl text-primary">{formatPrice(product.price * quantity)}</span>
          </div>
          
          {/* Availability */}
          <div className="flex items-center gap-2 py-2">
            {product.stock > 0 ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
              {product.stock > 0 ? `Tersedia (${product.stock})` : 'Stok habis'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || loading}
              className={`w-full font-semibold rounded-xl ${mobilePriority ? 'text-sm py-2' : ''}`}
              size={mobilePriority ? "default" : "lg"}
            >
              <ShoppingCart className={`${mobilePriority ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
              {loading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </Button>

            {session && (
              <Button
                variant="outline"
                className={`w-full font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground ${mobilePriority ? 'text-sm py-2' : ''}`}
                size={mobilePriority ? "default" : "lg"}
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
        </CardContent>
      </Card>
      
      {/* Keunggulan Berbelanja */}
      {!mobilePriority && (
        <Card className="shadow-md border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Keunggulan Berbelanja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex gap-3 items-start">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Produk Asli & Berkualitas</p>
                <p className="text-xs text-muted-foreground">Jaminan keaslian dan kualitas terbaik</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Pengiriman Cepat</p>
                <p className="text-xs text-muted-foreground">Dikirim dalam 1-3 hari kerja</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Produk Fresh</p>
                <p className="text-xs text-muted-foreground">Diproduksi dengan standar terjamin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Simplified benefits for mobile view */}
      {mobilePriority && (
        <div className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-lg text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-primary" />
            <span>Produk Asli</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-primary" />
            <span>Pengiriman Cepat</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3 text-primary" />
            <span>Produk Fresh</span>
          </div>
        </div>
      )}
    </div>
  )
}
