import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Truck, HeartHandshake, Award, Users, Globe } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Kualitas Terjamin',
      description: 'Semua produk telah melalui seleksi ketat untuk memastikan kualitas terbaik dari sumber aslinya.'
    },
    {
      icon: Truck,
      title: 'Pengiriman Terpercaya',
      description: 'Sistem pengiriman yang aman dan cepat ke seluruh Indonesia dengan packaging khusus.'
    },
    {
      icon: HeartHandshake,
      title: 'Mendukung UMKM',
      description: 'Kami bermitra langsung dengan pengrajin dan UMKM lokal untuk mengembangkan ekonomi rakyat.'
    },
    {
      icon: Award,
      title: 'Produk Autentik',
      description: 'Menjamin keaslian produk oleh-oleh langsung dari daerah asalnya dengan sertifikat halal.'
    },
    {
      icon: Users,
      title: 'Komunitas Terpercaya',
      description: 'Dipercaya oleh ribuan pelanggan di seluruh Indonesia dengan rating kepuasan tinggi.'
    },
    {
      icon: Globe,
      title: 'Jangkauan Nasional',
      description: 'Melayani pengiriman ke seluruh wilayah Indonesia dari Sabang sampai Merauke.'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Pelanggan Puas' },
    { number: '500+', label: 'Produk Tersedia' },
    { number: '34', label: 'Provinsi Terjangkau' },
    { number: '100+', label: 'Mitra UMKM' }
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 text-white border-0 rounded-none shadow-none">
        <CardContent className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Tentang Toko Oleh-Oleh</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Menghubungkan cita rasa nusantara dengan kemudahan berbelanja online
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Story Section */}
      <Card className="rounded-none border-0 border-b border-border">
        <CardContent className="py-16 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Cerita Kami</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Toko Oleh-Oleh lahir dari kecintaan terhadap kekayaan kuliner nusantara. 
                    Kami memahami betapa sulitnya mendapatkan oleh-oleh khas daerah yang 
                    autentik ketika berada jauh dari kampung halaman.
                  </p>
                  <p>
                    Sejak 2020, kami berkomitmen untuk menjembatani kerinduan akan cita rasa 
                    kampung halaman dengan kemudahan teknologi modern. Bermitra dengan ratusan 
                    UMKM di seluruh Indonesia, kami menghadirkan produk-produk berkualitas 
                    langsung dari tangan pengrajin terpilih.
                  </p>
                  <p>
                    Setiap produk yang kami jual bukan hanya sekedar makanan, tetapi juga 
                    cerita, tradisi, dan warisan budaya yang ingin kami lestarikan untuk 
                    generasi mendatang.
                  </p>
                </div>
              </div>
              <div className="relative aspect-square">
                <Image
                  src="/uploads/about-story.jpg"
                  alt="Cerita Toko Oleh-Oleh"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="rounded-none border-0 border-b dark:border-gray-700">
        <CardContent className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pencapaian Kami</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Dengan dukungan pelanggan setia, kami terus berkembang dan memberikan 
                yang terbaik untuk Indonesia
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center bg-card border-0 shadow-none">
                  <CardContent className="py-8">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="rounded-none border-0 border-b border-border">
        <CardContent className="py-16 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Mengapa Memilih Kami?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Komitmen kami untuk memberikan pengalaman berbelanja terbaik
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-card border-0">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Section */}
      <Card className="rounded-none border-0 border-b dark:border-gray-700">
        <CardContent className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Visi & Misi Kami</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-card border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-4">Visi</h3>
                  <p className="text-muted-foreground">
                    Menjadi platform e-commerce terdepan untuk oleh-oleh nusantara yang 
                    menghubungkan kekayaan kuliner daerah dengan seluruh masyarakat Indonesia 
                    dan dunia.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-4">Misi</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Melestarikan warisan kuliner nusantara</li>
                    <li>• Memberdayakan UMKM dan pengrajin lokal</li>
                    <li>• Menyediakan produk berkualitas dengan harga terjangkau</li>
                    <li>• Memberikan pengalaman berbelanja yang mudah dan terpercaya</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-primary dark:bg-primary/90 text-white rounded-none border-0 shadow-none">
        <CardContent className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Bergabunglah dengan Komunitas Kami</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Mulai jelajahi kekayaan cita rasa nusantara dan dukung ekonomi lokal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Mulai Berbelanja</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact" className="text-white border-white hover:bg-white hover:text-primary dark:hover:bg-gray-100">
                  Hubungi Kami
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  )
}