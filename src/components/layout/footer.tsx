import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary text-muted-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Toko Oleh-Oleh</h3>
            <p className="text-muted-foreground mb-4">
              Menyediakan oleh-oleh khas daerah dengan kualitas terbaik 
              dan harga terjangkau. Pesan online, kirim ke seluruh Indonesia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Link Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  Produk
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kategori
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span className="text-muted-foreground">+62 812-3456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span className="text-muted-foreground">info@tokooleholeh.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 text-primary" />
                <span className="text-muted-foreground">
                  Jl. Raya Malang No. 123<br />
                  Bekasi, Jawa Barat 17530
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Toko Oleh-Oleh. Semua hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}