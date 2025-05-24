'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralSettings } from '@/components/admin/settings/general-settings'
import { PaymentSettings } from '@/components/admin/settings/payment-settings'
import { ShippingSettings } from '@/components/admin/settings/shipping-settings'
import { EmailSettings } from '@/components/admin/settings/email-settings'
import { SecuritySettings } from '@/components/admin/settings/security-settings'
import { SystemSettings } from '@/components/admin/settings/system-settings'
import { 
  Settings, 
  CreditCard, 
  Truck, 
  Mail, 
  Shield, 
  Server
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-gray-600">Kelola konfigurasi dan pengaturan aplikasi</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Pembayaran
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Pengiriman
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Server className="h-4 w-4 mr-2" />
            Sistem
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="payment" className="mt-6">
          <PaymentSettings />
        </TabsContent>
        
        <TabsContent value="shipping" className="mt-6">
          <ShippingSettings />
        </TabsContent>
        
        <TabsContent value="email" className="mt-6">
          <EmailSettings />
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}