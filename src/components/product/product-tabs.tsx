'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Shield, RotateCcw } from 'lucide-react'
import { Product } from '@/types'

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Deskripsi</TabsTrigger>
        <TabsTrigger value="specifications">Spesifikasi</TabsTrigger>
        <TabsTrigger value="shipping">Pengiriman</TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Kategori</h4>
                  {product.category ? (
                    <Badge variant="secondary">{product.category.name}</Badge>
                  ) : (
                    <span className="text-gray-500">Tidak ada kategori</span>
                  )}
                </div>
                
                {product.weight && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Berat</h4>
                    <p className="text-gray-700">{product.weight} gram</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Stok</h4>
                  <p className="text-gray-700">{product.stock} unit</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">SKU</h4>
                  <p className="text-gray-700">{product.slug}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="shipping" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Pengiriman</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Produk akan dikirim dalam 1-2 hari kerja setelah pembayaran dikonfirmasi.
                    Gratis ongkir untuk pembelian di atas Rp. 100.000.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Garansi Kualitas</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Produk dijamin fresh dan berkualitas. Jika ada masalah dengan produk,
                    hubungi customer service kami.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <RotateCcw className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Kebijakan Pengembalian</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Pengembalian dapat dilakukan dalam 24 jam setelah produk diterima
                    dengan syarat dan ketentuan yang berlaku.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}