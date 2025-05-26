'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

export function SidebarSkeleton() {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className={cn(
      'bg-card shadow-xl border-r border-border/50 fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-72',
      // Mobile responsiveness
      'lg:translate-x-0',
      isCollapsed ? 'max-lg:-translate-x-full' : 'max-lg:translate-x-0'
    )}>
      {/* Header Skeleton */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Menu Items Skeleton */}
      <div className="px-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center space-x-3 p-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 flex-1" />
              {i % 3 === 0 && <Skeleton className="h-4 w-4 rounded-full" />}
            </div>
            {i % 4 === 0 && (
              <div className="ml-8 space-y-1">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}
