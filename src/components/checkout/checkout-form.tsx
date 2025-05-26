'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { CartItem } from '@/types'

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, 'Alamat minimal 10 karakter'),
  notes: z.string().optional(),
  bankAccount: z.string().min(1, 'Pilih rekening bank')
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  cartItems: CartItem[]
}

interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
}

export function CheckoutForm({ cartItems }: CheckoutFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { clearCart } = useCartStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: '',
      notes: '',
      bankAccount: ''
    }
  })

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch('/api/bank-accounts')
      if (response.ok) {
        const data = await response.json()
        setBankAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const order = await response.json()
        clearCart()
        toast({
          title: 'Pesanan Berhasil!',
          description: `Pesanan ${order.orderNumber} telah dibuat. Silakan lakukan pembayaran.`
        })
        router.push(`/orders/${order.id}`)
      } else {
        const errorData = await response.json()
        toast({
          title: 'Gagal',
          description: errorData.error || 'Gagal membuat pesanan',
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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Informasi Pengiriman</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Nama Penerima</Label>
              <Input
                id="name"
                value={session?.user?.name || ''}
                disabled
                className="bg-muted text-muted-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                value={session?.user?.email || ''}
                disabled
                className="bg-muted text-muted-foreground border-border"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <Label htmlFor="shippingAddress" className="text-foreground">Alamat Pengiriman *</Label>
            <Textarea
              id="shippingAddress"
              {...register('shippingAddress')}
              placeholder="Masukkan alamat lengkap untuk pengiriman"
              rows={4}
              className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
            />
            {errors.shippingAddress && (
              <p className="text-destructive text-sm mt-1">
                {errors.shippingAddress.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-foreground">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Catatan khusus untuk pesanan ini"
              rows={3}
              className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
            />
          </div>

          {/* Bank Account Selection */}
          <div>
            <Label className="text-foreground">Pilih Rekening Bank untuk Pembayaran *</Label>
            <Select onValueChange={(value) => setValue('bankAccount', value)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Pilih rekening bank" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    {account.bankName} - {account.accountNumber} ({account.accountName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankAccount && (
              <p className="text-destructive text-sm mt-1">
                {errors.bankAccount.message}
              </p>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4">
            <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">Instruksi Pembayaran:</h4>
            <ol className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1 list-decimal list-inside">
              <li>Setelah checkout, Anda akan mendapat nomor pesanan</li>
              <li>Transfer sesuai total pesanan ke rekening yang dipilih</li>
              <li>Upload bukti transfer pada halaman pesanan</li>
              <li>Tunggu konfirmasi dari admin</li>
              <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
            </ol>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? 'Memproses Pesanan...' : 'Buat Pesanan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}