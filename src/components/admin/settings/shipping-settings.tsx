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
import { Plus, Trash2 } from 'lucide-react'

interface ShippingZone {
  id: string
  name: string
  regions: string[]
  cost: number
  estimatedDays: string
  isActive: boolean
}

interface ShippingSettingsData {
  freeShippingThreshold: number
  defaultShippingCost: number
  weightUnit: string
  dimensionUnit: string
  processingTime: number
  zones: ShippingZone[]
}

export function ShippingSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<ShippingSettingsData | null>(null)
  const [zones, setZones] = useState<ShippingZone[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ShippingSettingsData>()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/shipping')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setZones(data.zones || [])
        reset(data)
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error)
    }
  }

  const addZone = () => {
    const newZone: ShippingZone = {
      id: `zone-${Date.now()}`,
      name: '',
      regions: [],
      cost: 0,
      estimatedDays: '1-3',
      isActive: true
    }
    setZones([...zones, newZone])
  }

  const updateZone = (id: string, field: keyof ShippingZone, value: any) => {
    setZones(zones.map(zone => 
      zone.id === id ? { ...zone, [field]: value } : zone
    ))
  }

  const removeZone = (id: string) => {
    setZones(zones.filter(zone => zone.id !== id))
  }

  const onSubmit = async (data: ShippingSettingsData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          zones
        })
      })

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Pengaturan pengiriman berhasil disimpan'
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
          <CardTitle>Pengaturan Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Shipping Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="freeShippingThreshold">Ambang Batas Gratis Ongkir</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  {...register('freeShippingThreshold', { valueAsNumber: true })}
                  placeholder="100000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gratis ongkir untuk pesanan di atas {formatPrice(watch('freeShippingThreshold') || 0)}
                </p>
              </div>

              <div>
                <Label htmlFor="defaultShippingCost">Ongkos Kirim Default</Label>
                <Input
                  id="defaultShippingCost"
                  type="number"
                  {...register('defaultShippingCost', { valueAsNumber: true })}
                  placeholder="15000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: {formatPrice(watch('defaultShippingCost') || 0)}
                </p>
              </div>

              <div>
                <Label htmlFor="weightUnit">Satuan Berat</Label>
                <Select onValueChange={(value) => setValue('weightUnit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih satuan berat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="processingTime">Waktu Proses (hari)</Label>
                <Input
                  id="processingTime"
                  type="number"
                  {...register('processingTime', { valueAsNumber: true })}
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Waktu proses sebelum pengiriman: {watch('processingTime') || 1} hari
                </p>
              </div>
            </div>

            {/* Shipping Zones */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Zona Pengiriman</h3>
                <Button type="button" variant="outline" onClick={addZone}>
                  <Plus className="h-4 w-4 mr-2" />
                 Tambah Zona
               </Button>
             </div>

             <div className="space-y-4">
               {zones.map((zone, index) => (
                 <Card key={zone.id}>
                   <CardContent className="p-4">
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                       <div>
                         <Label>Nama Zona</Label>
                         <Input
                           value={zone.name}
                           onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                           placeholder="Jakarta & Sekitarnya"
                         />
                       </div>

                       <div>
                         <Label>Wilayah</Label>
                         <Input
                           value={zone.regions.join(', ')}
                           onChange={(e) => updateZone(zone.id, 'regions', e.target.value.split(', '))}
                           placeholder="Jakarta, Depok, Tangerang"
                         />
                       </div>

                       <div>
                         <Label>Ongkos Kirim</Label>
                         <Input
                           type="number"
                           value={zone.cost}
                           onChange={(e) => updateZone(zone.id, 'cost', parseInt(e.target.value) || 0)}
                           placeholder="10000"
                         />
                       </div>

                       <div>
                         <Label>Estimasi (hari)</Label>
                         <Input
                           value={zone.estimatedDays}
                           onChange={(e) => updateZone(zone.id, 'estimatedDays', e.target.value)}
                           placeholder="1-2"
                         />
                       </div>

                       <div className="flex items-center space-x-2">
                         <Switch
                           checked={zone.isActive}
                           onCheckedChange={(checked) => updateZone(zone.id, 'isActive', checked)}
                         />
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => removeZone(zone.id)}
                           className="text-red-600"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
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