'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotificationStore } from '@/store/notification-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bell, 
  Package, 
  CreditCard, 
  Info,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function NotificationsPage() {
  const { data: session } = useSession()
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    getUnreadCount 
  } = useNotificationStore()
  
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    if (session?.user) {
      loadNotifications()
    }
  }, [session])

  const loadNotifications = async () => {
    setLoading(true)
    await fetchNotifications()
    setLoading(false)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        markAsRead(notificationId)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })
      
      if (response.ok) {
        markAllAsRead()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleRemoveNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        removeNotification(notificationId)
      }
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS':
        return <Package className="h-5 w-5" />
      case 'PAYMENT_STATUS':
        return <CreditCard className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      case 'PAYMENT_STATUS':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.status === 'UNREAD'
    if (filter === 'read') return notification.status === 'READ'
    return true
  })

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Anda harus login untuk melihat notifikasi.
          </p>
          <Link href="/auth/signin">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifikasi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getUnreadCount()} notifikasi belum dibaca
            </p>
          </div>
        </div>
        
        {getUnreadCount() > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Semua', count: notifications.length },
          { key: 'unread', label: 'Belum Dibaca', count: getUnreadCount() },
          { key: 'read', label: 'Sudah Dibaca', count: notifications.length - getUnreadCount() }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(tab.key as any)}
            className="relative"
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Tidak ada notifikasi
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' 
                ? 'Semua notifikasi sudah dibaca'
                : filter === 'read'
                ? 'Belum ada notifikasi yang dibaca'
                : 'Belum ada notifikasi untuk ditampilkan'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                notification.status === 'UNREAD' 
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10' 
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {notification.title}
                        </h3>
                        {notification.status === 'UNREAD' && (
                          <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.orderNumber && (
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Order #{notification.orderNumber}
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true,
                          locale: id 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {notification.status === 'UNREAD' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                        title="Tandai sebagai dibaca"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNotification(notification.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      title="Hapus notifikasi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
