'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  Globe
} from 'lucide-react'

export function ContactInfo() {
  const contactDetails = [
    {
      icon: MapPin,
      title: 'Alamat Kantor',
      content: 'Jl. Raya Indonesia No. 123\nJakarta Pusat, DKI Jakarta 10110',
      iconColor: 'text-blue-500 dark:text-blue-400' // Updated
    },
    {
      icon: Phone,
      title: 'Telepon',
      content: '+62 21 1234 5678\n+62 812 3456 7890',
      iconColor: 'text-green-500 dark:text-green-400' // Updated
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@tokooleholeh.com\nsupport@tokooleholeh.com',
      iconColor: 'text-purple-500 dark:text-purple-400' // Updated
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      content: 'Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 15:00\nMinggu: Tutup',
      iconColor: 'text-orange-500 dark:text-orange-400' // Updated
    }
  ]

  const socialMedia = [
    {
      icon: MessageCircle,
      name: 'WhatsApp',
      value: '+62 812 3456 7890',
      link: 'https://wa.me/6281234567890'
    },
    {
      icon: Globe,
      name: 'Website',
      value: 'www.tokooleholeh.com',
      link: 'https://tokooleholeh.com'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactDetails.map((detail, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-foreground">
                <div className={`p-2 rounded-lg bg-muted mr-3`}>
                  <detail.icon className={`h-5 w-5 ${detail.iconColor}`} />
                </div>
                {detail.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {detail.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Contact */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Kontak Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200 group"
              >
                <social.icon className="h-6 w-6 text-primary mr-3" />
                <div>
                  <p className="font-medium text-foreground group-hover:text-accent-foreground">{social.name}</p>
                  <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">{social.value}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Lokasi Kami</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613507864!3d-6.194741395493371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x6b45e67356080477!2sJl.%20Thamrin%2C%20Menteng%2C%20Kota%20Jakarta%20Pusat%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sen!2sid!4v1635749471516!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Toko Oleh-Oleh"
            ></iframe>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Kami berlokasi di pusat kota Jakarta, mudah diakses dengan transportasi umum maupun kendaraan pribadi.
          </p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Pertanyaan Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2 text-foreground">Bagaimana cara memesan produk?</h4>
              <p className="text-muted-foreground text-sm">
                Anda dapat memesan melalui website kami atau menghubungi langsung via WhatsApp. 
                Tim kami akan membantu proses pemesanan hingga pengiriman.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2 text-foreground">Apakah ada garansi untuk produk?</h4>
              <p className="text-muted-foreground text-sm">
                Semua produk makanan kami dijamin kualitas dan kesegarannya. 
                Jika ada masalah, kami akan mengganti atau mengembalikan uang Anda.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2 text-foreground">Berapa lama proses pengiriman?</h4>
              <p className="text-muted-foreground text-sm">
                Untuk Jakarta dan sekitarnya 1-2 hari kerja, luar kota 3-5 hari kerja tergantung lokasi tujuan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}