'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Star, CheckCircle } from 'lucide-react'
import { Product } from '@/types'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
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

  return (
    <div className="space-y-5 text-foreground">
      {/* Category */}
      <div>
        {product.category ? (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            {product.category.name}
          </Badge>
        ) : (
          <Badge variant="outline" className="border-border text-muted-foreground">Tanpa Kategori</Badge>
        )}
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">{product.name}</h1>
      </div>

      {/* Product ID & SKU */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span>SKU: {product.slug}</span>
        <span className="mx-2">•</span>
        <span>ID: {product.id.substring(0, 8)}</span>
      </div>

      {/* Rating & Sales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground/50'}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2">(4.0)</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">120+</span> terjual
        </div>
      </div>

      <Separator />

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <p className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          {/* You could add original price here if there's a discount */}
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Status:</span>
        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}
          className={`${product.stock > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40' : 'bg-destructive text-destructive-foreground' }`}
        >
          {product.stock > 0 ? `Tersedia (${product.stock})` : 'Habis'}
        </Badge>
      </div>
        
      {product.stock > 0 && product.stock <= 10 && (
        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
          ⚡ Stok terbatas! Hanya tersisa {product.stock} unit
        </p>
      )}

      {/* Product Specifications */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Spesifikasi Produk</h3>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
          {product.weight && (
            <>
              <div className="text-muted-foreground">Berat</div>
              <div className="font-medium">{product.weight} gram</div>
            </>
          )}
          
          <div className="text-muted-foreground">Kondisi</div>
          <div className="font-medium">Baru</div>
          
          <div className="text-muted-foreground">Min. Pemesanan</div>
          <div className="font-medium">1 Pcs</div>
          
          <div className="text-muted-foreground">Kategori</div>
          <div className="font-medium">{product.category?.name || 'Lainnya'}</div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <h3 className="font-semibold text-foreground mb-2">Deskripsi Produk</h3>
        {product.description ? (
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{product.description}</p>
        ) : (
          <p className="text-muted-foreground/70 italic">Tidak ada deskripsi produk</p>
        )}
      </div>

      {/* Product Highlights */}
      <div className="space-y-3 pt-1">
        <h3 className="font-semibold text-foreground">Kelebihan Produk</h3>
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground text-sm sm:text-base">100% asli dan berkualitas tinggi</span>
          </div>
          <div className="flex items-start space-x-2 sm:space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground text-sm sm:text-base">Dikemas dengan aman dan higienis</span>
          </div>
          <div className="flex items-start space-x-2 sm:space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground text-sm sm:text-base">Produk lokal dengan kualitas premium</span>
          </div>
        </div>
      </div>
    </div>
  )
}
