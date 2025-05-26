'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  isCollapsed: boolean
  toggleCollapsed: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: typeof window !== 'undefined' && window.innerWidth < 1024, // Default collapsed on mobile
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
)
