import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { TrafficTracker } from '@/components/traffic-tracker'
import { CookieConsentBanner } from '@/components/ui/cookie-consent-banner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Toko Oleh-Oleh',
  description: 'Toko online untuk oleh-oleh khas daerah',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          {children}
          <Toaster />
          <TrafficTracker />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  )
}