'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface PaymentSettingsData {
  paymentMethods: string[]
  autoVerifyPayments: boolean
  paymentTimeout: number
  minimumOrder: number
  maximumOrder: number
  processingFee: number
  processingFeeType: 'fixed' | 'percentage'
  currency: string
}

export function PaymentSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PaymentSettingsData>()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/payment')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
    }
  }

  const onSubmit = async (data: PaymentSettingsData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengaturan pembayaran berhasil disimpan'
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Methods */}
            <div>
              <Label>Metode Pembayaran</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="bank_transfer" defaultChecked />
                  <Label htmlFor="bank_transfer">Transfer Bank</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="ewallet" />
                  <Label htmlFor="ewallet">E-Wallet (Coming Soon)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="cod" />
                  <Label htmlFor="cod">Cash on Delivery (Coming Soon)</Label>
                </div>
              </div>
            </div>

            {/* Order Limits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumOrder">Minimum Pesanan</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  {...register('minimumOrder', { valueAsNumber: true })}
                  placeholder="10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal: {formatPrice(watch('minimumOrder') || 0)}
                </p>
              </div>

              <div>
                <Label htmlFor="maximumOrder">Maksimum Pesanan</Label>
                <Input
                  id="maximumOrder"
                  type="number"
                  {...register('maximumOrder', { valueAsNumber: true })}
                  placeholder="10000000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal: {formatPrice(watch('maximumOrder') || 0)}
                </p>
              </div>
            </div>

            {/* Processing Fee */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="processingFee">Biaya Pemrosesan</Label>
                <Input
                  id="processingFee"
                  type="number"
                  step="0.01"
                  {...register('processingFee', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="processingFeeType">Tipe Biaya</Label>
                <Select onValueChange={(value) => setValue('processingFeeType', value as 'fixed' | 'percentage')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe biaya" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Nominal Tetap</SelectItem>
                    <SelectItem value="percentage">Persentase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Timeout */}
            <div>
              <Label htmlFor="paymentTimeout">Timeout Pembayaran (jam)</Label>
              <Input
                id="paymentTimeout"
                type="number"
                {...register('paymentTimeout', { valueAsNumber: true })}
                placeholder="24"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pesanan akan dibatalkan otomatis setelah {watch('paymentTimeout') || 24} jam
              </p>
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Mata Uang</Label>
              <Select onValueChange={(value) => setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata uang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto Verify */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoVerifyPayments">Verifikasi Otomatis</Label>
                <p className="text-sm text-gray-600">
                  Verifikasi pembayaran secara otomatis (tidak direkomendasikan)
                </p>
              </div>
              <Switch
                id="autoVerifyPayments"
                checked={watch('autoVerifyPayments')}
                onCheckedChange={(checked) => setValue('autoVerifyPayments', checked)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}