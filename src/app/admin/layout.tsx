'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminNavbar } from '@/components/admin/admin-navbar'
import { SidebarSkeleton } from '@/components/admin/sidebar-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebar } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      console.log('Not authenticated as admin, redirecting to admin login')
      router.push('/admin/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <SidebarSkeleton />
        <div className={cn(
          "min-h-screen flex flex-col transition-all duration-300",
          // Desktop: adjust for sidebar width
          isCollapsed ? "lg:ml-20" : "lg:ml-72",
          // Mobile: no margin, sidebar is overlay
          "ml-0"
        )}>
          <div className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-32 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </div>
          </div>
          <main className="flex-1 p-6 bg-gradient-to-br from-background/50 to-muted/10">
            <div className="max-w-7xl mx-auto space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AdminSidebar />
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-300",
        // Desktop: adjust for sidebar width
        isCollapsed ? "lg:ml-20" : "lg:ml-72",
        // Mobile: no margin, sidebar is overlay
        "ml-0"
      )}>
        <AdminNavbar />
        <main className="flex-1 p-6 bg-gradient-to-br from-background/50 to-muted/10">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}