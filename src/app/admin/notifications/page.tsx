'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Pesanan Baru',
      message: 'Pesanan #12345 dari John Doe perlu dikonfirmasi',
      time: '5 menit yang lalu',
      read: false,
      icon: <Bell className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      id: 2,
      type: 'payment',
      title: 'Pembayaran Diterima',
      message: 'Pembayaran untuk pesanan #12344 telah dikonfirmasi',
      time: '1 jam yang lalu',
      read: false,
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'secondary' as const
    },
    {
      id: 3,
      type: 'stock',
      title: 'Stok Rendah',
      message: 'Keripik Pisang memiliki stok tersisa 3 unit',
      time: '2 jam yang lalu',
      read: true,
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'destructive' as const
    },
    {
      id: 4,
      type: 'system',
      title: 'Pembaruan Sistem',
      message: 'Sistem telah diperbarui ke versi terbaru',
      time: '1 hari yang lalu',
      read: true,
      icon: <Info className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifikasi</h1>
          <p className="text-muted-foreground">Kelola notifikasi dan peringatan sistem</p>
        </div>
        <Button variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Tandai Semua Dibaca
        </Button>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`transition-all hover:shadow-md ${!notification.read ? 'border-primary/20 bg-primary/5' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    notification.variant === 'destructive' ? 'bg-red-100 text-red-600' :
                    notification.variant === 'secondary' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="h-5 w-5 p-0 rounded-full bg-primary">
                          <span className="sr-only">Belum dibaca</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <Button variant="ghost" size="sm">
                      Tandai Dibaca
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Tidak ada notifikasi
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Semua notifikasi akan muncul di sini
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
