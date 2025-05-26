import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Oleh-Oleh Khas Daerah
            <span className="block text-yellow-300">Berkualitas Tinggi</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-foreground/90">
            Temukan berbagai macam oleh-oleh khas dari seluruh Indonesia. 
            Pesan online, kirim ke seluruh nusantara dengan kualitas terjamin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-background text-foreground hover:bg-muted">
              <Link href="/products">
                Lihat Produk
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-2 border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300 hover:text-primary font-semibold">
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