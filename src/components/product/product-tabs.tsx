'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Shield, RotateCcw, Star } from 'lucide-react'
import { Product } from '@/types'

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-muted text-muted-foreground h-12 rounded-xl">
        <TabsTrigger value="description" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium">
          Deskripsi
        </TabsTrigger>
        <TabsTrigger value="specifications" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium">
          Spesifikasi
        </TabsTrigger>
        <TabsTrigger value="shipping" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium">
          Pengiriman
        </TabsTrigger>
        <TabsTrigger value="reviews" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium">
          Ulasan
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="pt-8">
            <div className="prose dark:prose-invert max-w-none prose-p:text-muted-foreground">
              <h3 className="text-xl font-semibold text-foreground mb-4">Detail Produk</h3>
              <p className="leading-relaxed text-base">
                {product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
              </p>
              
              {/* Additional product highlights */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">✨ Keistimewaan Produk</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Produk asli dan berkualitas tinggi</li>
                  <li>• Dibuat dengan resep tradisional turun-temurun</li>
                  <li>• Kemasan higienis dan tahan lama</li>
                  <li>• Cocok sebagai oleh-oleh atau konsumsi pribadi</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="specifications" className="mt-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="pt-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Informasi Produk</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-foreground">Kategori</span>
                    {product.category ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {product.category.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Tidak ada kategori</span>
                    )}
                  </div>
                  
                  {product.weight && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="font-medium text-foreground">Berat</span>
                      <span className="text-muted-foreground">{product.weight} gram</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-foreground">Stok Tersedia</span>
                    <span className="text-muted-foreground">{product.stock} unit</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-foreground">SKU</span>
                    <span className="text-muted-foreground font-mono text-sm">{product.slug}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-foreground">Kondisi</span>
                    <Badge variant="outline" className="border-green-500/40 text-green-700 dark:text-green-400">
                      Baru
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="font-medium text-foreground">Masa Simpan</span>
                    <span className="text-muted-foreground">6-12 bulan</span>
                  </div>
                </div>
              </div>
              
              {/* Storage instructions */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">📋 Petunjuk Penyimpanan</h4>
                <p className="text-sm text-muted-foreground">
                  Simpan di tempat sejuk dan kering, hindari paparan sinar matahari langsung. 
                  Pastikan kemasan tertutup rapat setelah dibuka untuk menjaga kualitas produk.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="shipping" className="mt-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="pt-8">
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Informasi Pengiriman</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Pengiriman Cepat</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Produk akan diproses dan dikirim dalam 1-2 hari kerja setelah pembayaran dikonfirmasi.
                      </p>
                      <p className="text-sm font-medium text-primary">
                        📦 Gratis ongkir untuk pembelian di atas Rp. 100.000
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Garansi Kualitas</h4>
                      <p className="text-sm text-muted-foreground">
                        Produk dijamin fresh dan berkualitas. Jika ada masalah dengan produk, 
                        hubungi customer service kami dalam 24 jam setelah produk diterima.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <RotateCcw className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Kebijakan Pengembalian</h4>
                      <p className="text-sm text-muted-foreground">
                        Pengembalian dapat dilakukan dalam 24 jam setelah produk diterima 
                        dengan kondisi kemasan masih utuh dan produk belum dibuka.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-orange-500/10 rounded-full">
                      <span className="h-6 w-6 text-orange-600 flex items-center justify-center text-lg">📱</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Tracking Pengiriman</h4>
                      <p className="text-sm text-muted-foreground">
                        Nomor resi akan dikirimkan via WhatsApp/SMS untuk memudahkan 
                        tracking status pengiriman produk Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping zones */}
              <div className="bg-muted/30 rounded-lg p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-4">🚚 Area Pengiriman</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Jabodetabek:</span>
                    <p className="text-muted-foreground">1-2 hari kerja</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Jawa:</span>
                    <p className="text-muted-foreground">2-3 hari kerja</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Luar Jawa:</span>
                    <p className="text-muted-foreground">3-5 hari kerja</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews" className="mt-8">
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="pt-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">Ulasan Pelanggan</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < 4 ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground/50'}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-foreground">4.0</span>
                  <span className="text-sm text-muted-foreground">(12 ulasan)</span>
                </div>
              </div>
              
              {/* Reviews summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-foreground w-4">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: rating === 5 ? '60%' : rating === 4 ? '30%' : rating === 3 ? '8%' : '2%' }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {rating === 5 ? '7' : rating === 4 ? '4' : rating === 3 ? '1' : '0'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {/* Sample reviews */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">Sari M.</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Sambal roa-nya enak banget! Rasa ikan roa-nya terasa dan pedasnya pas. 
                      Cocok banget buat makan nasi putih hangat."
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                        ))}
                        <Star className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Budi T.</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Kualitas bagus, kemasan rapi. Pengiriman juga cepat. 
                      Pasti akan pesan lagi!"
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button variant="outline" className="rounded-xl">
                  Lihat Semua Ulasan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}