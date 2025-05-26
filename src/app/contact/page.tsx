import React from 'react'
import ContactForm from '@/components/contact/contact-form'
import { ContactInfo } from '@/components/contact/contact-info'
import { MainLayout } from '@/components/layout/main-layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hubungi Kami - Toko Oleh-Oleh',
  description: 'Hubungi Toko Oleh-Oleh untuk pertanyaan, saran, atau bantuan. Kami siap membantu Anda dengan layanan terbaik.',
  keywords: 'kontak, hubungi kami, customer service, toko oleh-oleh, bantuan',
}

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Hubungi Kami
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kami senang mendengar dari Anda! Jangan ragu untuk menghubungi kami 
              untuk pertanyaan, saran, atau bantuan apapun yang Anda butuhkan.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 sm:px-0">
            {/* Contact Form */}
            <div className="order-2 lg:order-1 w-full">
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="order-1 lg:order-2 w-full">
              <ContactInfo />
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                Informasi Penting
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Respon Cepat</h3>
                  <p className="text-sm text-muted-foreground">
                    Kami akan merespons pesan Anda dalam waktu maksimal 1x24 jam
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Layanan Terpercaya</h3>
                  <p className="text-sm text-muted-foreground">
                    Tim customer service berpengalaman siap membantu Anda
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8V4l4 4z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Dukungan Lengkap</h3>
                  <p className="text-sm text-muted-foreground">
                    Bantuan untuk pemesanan, pengiriman, dan layanan lainnya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}