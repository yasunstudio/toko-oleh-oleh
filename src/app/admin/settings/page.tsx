'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralSettings } from '@/components/admin/settings/general-settings'
import { PaymentSettings } from '@/components/admin/settings/payment-settings'
import { ShippingSettings } from '@/components/admin/settings/shipping-settings'
import { EmailSettings } from '@/components/admin/settings/email-settings'
import { SecuritySettings } from '@/components/admin/settings/security-settings'
import { SystemSettings } from '@/components/admin/settings/system-settings'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
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
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Pengaturan Sistem' }
        ]} 
      />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pengaturan Sistem</h1>
          <p className="text-xs text-muted-foreground">Kelola konfigurasi dan pengaturan aplikasi</p>
        </div>
      </div>
      
      <Card className="bg-card">
        <CardContent className="p-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-muted">
              <TabsTrigger value="general" className="flex items-center text-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Umum
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center text-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                Pembayaran
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center text-foreground">
                <Truck className="h-4 w-4 mr-2" />
                Pengiriman
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center text-foreground">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center text-foreground">
                <Shield className="h-4 w-4 mr-2" />
                Keamanan
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center text-foreground">
                <Server className="h-4 w-4 mr-2" />
                Sistem
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-3">
              <GeneralSettings />
            </TabsContent>
            <TabsContent value="payment" className="mt-3">
              <PaymentSettings />
            </TabsContent>
            <TabsContent value="shipping" className="mt-3">
              <ShippingSettings />
            </TabsContent>
            <TabsContent value="email" className="mt-3">
              <EmailSettings />
            </TabsContent>
            <TabsContent value="security" className="mt-3">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="system" className="mt-3">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}