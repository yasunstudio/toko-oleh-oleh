import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Truck, HeartHandshake, Award } from 'lucide-react'
import Link from 'next/link'

export function AboutSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Kualitas Terjamin',
      description: 'Semua produk telah melalui seleksi ketat untuk memastikan kualitas terbaik'
    },
    {
      icon: Truck,
      title: 'Pengiriman Cepat',
      description: 'Gratis ongkir untuk pembelian di atas Rp. 100.000 ke seluruh Indonesia'
    },
    {
      icon: HeartHandshake,
      title: 'Mendukung UMKM',
      description: 'Kami bermitra dengan pengrajin lokal untuk mengembangkan ekonomi rakyat'
    },
    {
      icon: Award,
      title: 'Produk Asli',
      description: 'Menjamin keaslian produk oleh-oleh langsung dari daerah asalnya'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami berkomitmen memberikan pengalaman berbelanja terbaik dengan 
            produk berkualitas dan layanan yang memuaskan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Siap Merasakan Cita Rasa Nusantara?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Jelajahi ribuan produk oleh-oleh khas dari berbagai daerah di Indonesia. 
            Pesan sekarang dan nikmati kelezatan yang autentik!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/products">
                Mulai Belanja
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">
                Pelajari Lebih Lanjut
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}