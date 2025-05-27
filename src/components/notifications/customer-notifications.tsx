'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore } from '@/store/notification-store'
import { CustomerNotification } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Bell, 
  Package, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  X,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'

export function CustomerNotifications() {
  const { data: session } = useSession()
  const {
    notifications,
    getUnreadCount,
    setNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getRecentNotifications,
    fetchNotifications
  } = useNotificationStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => fetchNotifications(), 30000)
      return () => clearInterval(interval)
    }
  }, [session, fetchNotifications])

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
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })
      if (response.ok) {
        markAllAsRead()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setLoading(false)
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
        return <Package className="h-4 w-4 text-blue-500" />
      case 'PAYMENT_STATUS':
        return <CreditCard className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusIcon = (status: string, type: string) => {
    if (type === 'ORDER_STATUS') {
      switch (status) {
        case 'CONFIRMED':
          return <CheckCircle className="h-3 w-3 text-blue-500" />
        case 'PROCESSING':
          return <Clock className="h-3 w-3 text-purple-500" />
        case 'SHIPPED':
          return <Package className="h-3 w-3 text-indigo-500" />
        case 'DELIVERED':
          return <CheckCircle className="h-3 w-3 text-green-500" />
        case 'CANCELLED':
          return <X className="h-3 w-3 text-red-500" />
        default:
          return <Clock className="h-3 w-3 text-yellow-500" />
      }
    } else if (type === 'PAYMENT_STATUS') {
      switch (status) {
        case 'VERIFIED':
          return <CheckCircle className="h-3 w-3 text-green-500" />
        case 'REJECTED':
          return <X className="h-3 w-3 text-red-500" />
        case 'PAID':
          return <Clock className="h-3 w-3 text-blue-500" />
        default:
          return <AlertCircle className="h-3 w-3 text-yellow-500" />
      }
    }
    return <Bell className="h-3 w-3 text-muted-foreground" />
  }

  const recentNotifications = getRecentNotifications(5)

  if (!session) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-primary hover:bg-accent"
        >
          <Bell className="h-5 w-5" />
          {getUnreadCount() > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 bg-popover border border-border text-popover-foreground shadow-lg rounded-lg max-h-[32rem] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-sm">Notifikasi</h3>
          {getUnreadCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="text-xs h-6 px-2 hover:bg-accent"
            >
              {loading ? 'Loading...' : 'Tandai Semua Dibaca'}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length > 0 ? (
            <>
              {recentNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-4 cursor-pointer border-b border-border/50 hover:bg-accent/50 focus:bg-accent/50"
                  onClick={() => {
                    if (notification.status === 'UNREAD') {
                      handleMarkAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start space-x-3 w-full">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${notification.status === 'UNREAD' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Order Number and Status */}
                          {notification.orderNumber && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-primary font-medium">
                                #{notification.orderNumber}
                              </span>
                              {notification.data?.newStatus && (
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(notification.data.newStatus, notification.type)}
                                  <span className="text-xs text-muted-foreground">
                                    {notification.data.newStatus}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: id
                            })}
                          </p>
                        </div>
                        
                        {/* Unread Indicator */}
                        {notification.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveNotification(notification.id)
                      }}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
              
              {/* View All Link */}
              {notifications.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-accent focus:bg-accent">
                    <Link href="/notifications" className="text-center text-sm text-primary font-medium">
                      Lihat Semua Notifikasi ({notifications.length})
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
              <p className="text-xs text-muted-foreground mt-1">
                Notifikasi pesanan dan pembayaran akan muncul di sini
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
