'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  CreditCard, 
  Eye, 
  EyeOff 
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function BankAccountManager() {
  const { toast } = useToast()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    isActive: true
  })
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch('/api/admin/bank-accounts')
      if (response.ok) {
        const data = await response.json()
        setBankAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAccount 
        ? `/api/admin/bank-accounts/${editingAccount.id}`
        : '/api/admin/bank-accounts'
      const method = editingAccount ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Rekening bank berhasil ${editingAccount ? 'diperbarui' : 'ditambahkan'}`
        })
        setShowAddDialog(false)
        setEditingAccount(null)
        setFormData({ bankName: '', accountName: '', accountNumber: '', isActive: true })
        fetchBankAccounts()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menyimpan rekening bank',
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

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      isActive: account.isActive
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (accountId: string) => {
    try {
      const response = await fetch(`/api/admin/bank-accounts/${accountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Rekening bank berhasil dihapus'
        })
        fetchBankAccounts()
      } else {
        const data = await response.json()
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal menghapus rekening bank',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan',
        variant: 'destructive'
      })
    }
  }

  const toggleAccountVisibility = (accountId: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber
    return `****${accountNumber.slice(-4)}`
  }

  const resetForm = () => {
    setFormData({ bankName: '', accountName: '', accountNumber: '', isActive: true })
    setEditingAccount(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rekening Bank</h2>
          <p className="text-gray-600">Kelola rekening bank untuk pembayaran</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Rekening
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Contoh: BCA, Mandiri, BRI"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accountName">Nama Pemilik</Label>
                <Input
                    id="accountName"
                 value={formData.accountName}
                 onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                 placeholder="Nama pemilik rekening"
                 required
               />
             </div>

             <div>
               <Label htmlFor="accountNumber">Nomor Rekening</Label>
               <Input
                 id="accountNumber"
                 value={formData.accountNumber}
                 onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                 placeholder="Nomor rekening"
                 required
               />
             </div>

             <div className="flex items-center space-x-2">
               <Switch
                 id="isActive"
                 checked={formData.isActive}
                 onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
               />
               <Label htmlFor="isActive">Aktif</Label>
             </div>

             <div className="flex justify-end gap-2">
               <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                 Batal
               </Button>
               <Button type="submit" disabled={loading}>
                 {loading ? 'Menyimpan...' : editingAccount ? 'Perbarui' : 'Tambah'}
               </Button>
             </div>
           </form>
         </DialogContent>
       </Dialog>
     </div>

     {/* Bank Accounts List */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {bankAccounts.map((account) => (
         <Card key={account.id} className={!account.isActive ? 'opacity-60' : ''}>
           <CardHeader>
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <Building className="h-5 w-5 text-primary" />
                 <CardTitle className="text-lg">{account.bankName}</CardTitle>
               </div>
               <Badge variant={account.isActive ? 'default' : 'secondary'}>
                 {account.isActive ? 'Aktif' : 'Non-Aktif'}
               </Badge>
             </div>
           </CardHeader>
           <CardContent className="space-y-4">
             <div>
               <p className="text-sm text-gray-600">Nama Pemilik</p>
               <p className="font-medium">{account.accountName}</p>
             </div>
             
             <div>
               <div className="flex items-center justify-between">
                 <p className="text-sm text-gray-600">Nomor Rekening</p>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => toggleAccountVisibility(account.id)}
                 >
                   {showAccountNumbers[account.id] ? (
                     <EyeOff className="h-4 w-4" />
                   ) : (
                     <Eye className="h-4 w-4" />
                   )}
                 </Button>
               </div>
               <p className="font-mono font-medium">
                 {showAccountNumbers[account.id] 
                   ? account.accountNumber 
                   : maskAccountNumber(account.accountNumber)
                 }
               </p>
             </div>

             <div className="flex justify-between text-xs text-gray-500">
               <span>Dibuat: {new Date(account.createdAt).toLocaleDateString('id-ID')}</span>
               <span>Update: {new Date(account.updatedAt).toLocaleDateString('id-ID')}</span>
             </div>

             <div className="flex gap-2">
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => handleEdit(account)}
                 className="flex-1"
               >
                 <Edit className="h-4 w-4 mr-2" />
                 Edit
               </Button>
               
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                   <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Hapus Rekening Bank</AlertDialogTitle>
                     <AlertDialogDescription>
                       Apakah Anda yakin ingin menghapus rekening bank {account.bankName} - {maskAccountNumber(account.accountNumber)}?
                       Tindakan ini tidak dapat dibatalkan.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Batal</AlertDialogCancel>
                     <AlertDialogAction
                       onClick={() => handleDelete(account.id)}
                       className="bg-red-600 hover:bg-red-700"
                     >
                       Hapus
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
             </div>
           </CardContent>
         </Card>
       ))}
     </div>

     {bankAccounts.length === 0 && !loading && (
       <Card>
         <CardContent className="text-center py-12">
           <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Rekening Bank</h3>
           <p className="text-gray-600 mb-4">
             Tambahkan rekening bank untuk menerima pembayaran dari pelanggan
           </p>
           <Button onClick={() => setShowAddDialog(true)}>
             <Plus className="h-4 w-4 mr-2" />
             Tambah Rekening Pertama
           </Button>
         </CardContent>
       </Card>
     )}
   </div>
 )
}