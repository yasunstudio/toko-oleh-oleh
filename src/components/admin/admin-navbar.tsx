'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useSidebar } from '@/hooks/use-sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, User, LogOut, Home, Menu } from 'lucide-react'
import Link from 'next/link'
import { Session } from 'next-auth'

interface ExtendedSession extends Session {
  notifications?: { message: string }[]
}

export function AdminNavbar() {
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const { toggleCollapsed } = useSidebar()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="lg:hidden hover:bg-primary/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Selamat datang kembali, {session?.user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover:bg-primary/10">
                <Bell className="h-5 w-5" />
                {session?.notifications && session.notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-popover/95 backdrop-blur-sm">
              <div className="p-3 border-b border-border/50">
                <h3 className="font-medium text-sm">Notifikasi</h3>
              </div>
              {session?.notifications && session.notifications.length > 0 ? (
                session.notifications.map((notification, index) => (
                  <DropdownMenuItem key={index} className="p-3 cursor-pointer hover:bg-accent">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="p-3 text-muted-foreground">
                  Tidak ada notifikasi baru
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Back to Store */}
          <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 hover:border-primary/50">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Toko
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <User className="h-5 w-5 mr-2" />
                {session?.user?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}