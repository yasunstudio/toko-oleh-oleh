'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Mail, Send, AlertTriangle } from 'lucide-react'

interface EmailSettingsData {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  fromEmail: string
  fromName: string
  emailEnabled: boolean
  welcomeEmailEnabled: boolean
  orderEmailEnabled: boolean
  paymentEmailEnabled: boolean
  welcomeEmailSubject: string
  welcomeEmailTemplate: string
  orderConfirmationSubject: string
  orderConfirmationTemplate: string
}

export function EmailSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [settings, setSettings] = useState<EmailSettingsData | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<EmailSettingsData>()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/email')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
    }
  }

  const testEmailConnection = async () => {
    setTestLoading(true)
    try {
      const response = await fetch('/api/admin/settings/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          smtpHost: watch('smtpHost'),
          smtpPort: watch('smtpPort'),
          smtpUser: watch('smtpUser'),
          smtpPassword: watch('smtpPassword'),
          smtpSecure: watch('smtpSecure'),
          fromEmail: watch('fromEmail')
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Koneksi email berhasil ditest'
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Test koneksi email gagal',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat test email',
        variant: 'destructive'
      })
    } finally {
      setTestLoading(false)
    }
  }

  const onSubmit = async (data: EmailSettingsData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengaturan email berhasil disimpan'
        })
        fetchSettings()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Gagal menyimpan pengaturan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">
            Pengaturan Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary text-secondary-foreground rounded-lg">
              <div>
                <Label htmlFor="emailEnabled">Aktifkan Email</Label>
                <p className="text-sm text-secondary-foreground/80">
                  Nonaktifkan untuk mematikan semua email otomatis
                </p>
              </div>
              <Switch
                id="emailEnabled"
                checked={watch('emailEnabled')}
                onCheckedChange={(checked) => setValue('emailEnabled', checked)}
              />
            </div>

            {/* SMTP Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  {...register('smtpHost')}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  {...register('smtpPort', { valueAsNumber: true })}
                  placeholder="587"
                />
              </div>

              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  {...register('smtpUser')}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  {...register('smtpPassword')}
                  placeholder="App Password"
                />
              </div>

              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  {...register('fromEmail')}
                  placeholder="noreply@tokooleholeh.com"
                />
              </div>

              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  {...register('fromName')}
                  placeholder="Toko Oleh-Oleh"
                />
              </div>
            </div>

            {/* SSL/TLS */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smtpSecure">Gunakan SSL/TLS</Label>
                <p className="text-sm text-gray-600">
                  Aktifkan untuk koneksi yang aman
                </p>
              </div>
              <Switch
                id="smtpSecure"
                checked={watch('smtpSecure')}
                onCheckedChange={(checked) => setValue('smtpSecure', checked)}
              />
            </div>

            {/* Test Connection */}
            <div className="flex items-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testEmailConnection}
                disabled={testLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                {testLoading ? 'Testing...' : 'Test Koneksi'}
              </Button>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Pastikan menggunakan App Password untuk Gmail
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Template Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email Types */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="welcomeEmailEnabled">Email Selamat Datang</Label>
                  <p className="text-sm text-muted-foreground">
                    Kirim email ke pengguna baru yang mendaftar
                  </p>
                </div>
                <Switch
                  id="welcomeEmailEnabled"
                  checked={watch('welcomeEmailEnabled')}
                  onCheckedChange={(checked) => setValue('welcomeEmailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderEmailEnabled">Email Konfirmasi Pesanan</Label>
                  <p className="text-sm text-muted-foreground">
                    Kirim email saat pesanan dibuat
                  </p>
                </div>
                <Switch
                  id="orderEmailEnabled"
                  checked={watch('orderEmailEnabled')}
                  onCheckedChange={(checked) => setValue('orderEmailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="paymentEmailEnabled">Email Status Pembayaran</Label>
                  <p className="text-sm text-muted-foreground">
                    Kirim email saat status pembayaran berubah
                  </p>
                </div>
                <Switch
                  id="paymentEmailEnabled"
                  checked={watch('paymentEmailEnabled')}
                  onCheckedChange={(checked) => setValue('paymentEmailEnabled', checked)}
                />
              </div>
            </div>

            {/* Welcome Email Template */}
            {watch('welcomeEmailEnabled') && (
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium text-foreground">Template Email Selamat Datang</h4>
                <div>
                  <Label htmlFor="welcomeEmailSubject">Subject</Label>
                  <Input
                    id="welcomeEmailSubject"
                    {...register('welcomeEmailSubject')}
                    placeholder="Selamat datang di Toko Oleh-Oleh!"
                  />
                </div>
                <div>
                  <Label htmlFor="welcomeEmailTemplate">Template</Label>
                  <Textarea
                    id="welcomeEmailTemplate"
                    {...register('welcomeEmailTemplate')}
                    placeholder="Halo {{name}}, selamat datang di Toko Oleh-Oleh..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gunakan {`{{name}}`}, {`{{email}}`} untuk data dinamis
                  </p>
                </div>
              </div>
            )}

            {/* Order Confirmation Template */}
            {watch('orderEmailEnabled') && (
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium text-foreground">Template Konfirmasi Pesanan</h4>
                <div>
                  <Label htmlFor="orderConfirmationSubject">Subject</Label>
                  <Input
                    id="orderConfirmationSubject"
                    {...register('orderConfirmationSubject')}
                    placeholder="Pesanan Anda #{{orderNumber}} telah diterima"
                  />
                </div>
                <div>
                  <Label htmlFor="orderConfirmationTemplate">Template</Label>
                  <Textarea
                    id="orderConfirmationTemplate"
                    {...register('orderConfirmationTemplate')}
                    placeholder="Terima kasih {{name}}, pesanan #{{orderNumber}} telah diterima..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gunakan {`{{name}}`}, {`{{orderNumber}}`}, {`{{totalAmount}}`} untuk data dinamis
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}