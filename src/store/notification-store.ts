'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CustomerNotification } from '@/types'

interface NotificationStore {
  notifications: CustomerNotification[]
  unreadCount: number
  
  // Actions
  setNotifications: (notifications: CustomerNotification[]) => void
  addNotification: (notification: CustomerNotification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearNotifications: () => void
  
  // Helper functions
  getUnreadCount: () => number
  getRecentNotifications: (limit?: number) => CustomerNotification[]
  fetchNotifications: (limit?: number) => Promise<void>
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      setNotifications: (notifications) => 
        set({ 
          notifications,
          unreadCount: notifications.filter(n => n.status === 'UNREAD').length
        }),

      addNotification: (notification) => 
        set((state) => {
          const newNotifications = [notification, ...state.notifications]
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => n.status === 'UNREAD').length
          }
        }),

      markAsRead: (notificationId) => 
        set((state) => {
          const updatedNotifications = state.notifications.map(n => 
            n.id === notificationId ? { ...n, status: 'READ' as const } : n
          )
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => n.status === 'UNREAD').length
          }
        }),

      markAllAsRead: () => 
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, status: 'READ' as const })),
          unreadCount: 0
        })),

      removeNotification: (notificationId) => 
        set((state) => {
          const filteredNotifications = state.notifications.filter(n => n.id !== notificationId)
          return {
            notifications: filteredNotifications,
            unreadCount: filteredNotifications.filter(n => n.status === 'UNREAD').length
          }
        }),

      clearNotifications: () => 
        set({ notifications: [], unreadCount: 0 }),

      getUnreadCount: () => get().unreadCount,

      getRecentNotifications: (limit = 5) => 
        get().notifications
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit),

      fetchNotifications: async (limit) => {
        try {
          const params = new URLSearchParams()
          if (limit) params.append('limit', limit.toString())
          
          const response = await fetch(`/api/notifications?${params}`)
          if (response.ok) {
            const data = await response.json()
            set({
              notifications: data.notifications || [],
              unreadCount: (data.notifications || []).filter((n: CustomerNotification) => n.status === 'UNREAD').length
            })
          }
        } catch (error) {
          console.error('Error fetching notifications:', error)
        }
      }
    }),
    {
      name: 'customer-notifications',
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount 
      }),
    }
  )
)
