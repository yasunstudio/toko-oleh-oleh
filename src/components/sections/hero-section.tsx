import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Oleh-Oleh Khas Daerah
            <span className="block text-yellow-300">Berkualitas Tinggi</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Temukan berbagai macam oleh-oleh khas dari seluruh Indonesia. 
            Pesan online, kirim ke seluruh nusantara dengan kualitas terjamin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100">
              <Link href="/products">
                Lihat Produk
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/categories">
                Jelajahi Kategori
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}