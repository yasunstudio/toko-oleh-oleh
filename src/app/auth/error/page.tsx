'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Ada masalah dengan konfigurasi authentication.'
      case 'AccessDenied':
        return 'Akses ditolak. Anda tidak memiliki permission untuk mengakses halaman ini.'
      case 'Verification':
        return 'Token verifikasi tidak valid atau sudah expired.'
      case 'Default':
        return 'Terjadi kesalahan saat proses authentication.'
      default:
        return 'Terjadi kesalahan yang tidak diketahui.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Silakan coba kembali atau hubungi administrator jika masalah berlanjut.
            </p>
            {error && (
              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                Error: {error}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Coba Login Lagi
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
