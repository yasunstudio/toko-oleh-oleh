'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useSidebar } from '@/hooks/use-sidebar'
import { useCartStore } from '@/store/cart-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, User, LogOut, Home, Menu, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Session } from 'next-auth'
import { CartItem } from '@/types'

interface ExtendedSession extends Session {
  notifications?: { message: string }[]
}

export function AdminNavbar() {
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const { toggleCollapsed } = useSidebar()
  const { totalItems, cartItems, clearCart } = useCartStore()

  const handleSignOut = async () => {
    try {
      clearCart() // Clear cart when signing out
      // Proper logout with redirect to admin login page
      await signOut({
        callbackUrl: '/admin/login',
        redirect: true,
      })
    } catch (error) {
      console.error('Admin logout error:', error)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.product.price), 0)
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
          
          {/* Cart Icon with Navigation Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              sideOffset={8}
              className="w-screen mx-0 sm:w-[32rem] p-5 sm:p-6 bg-popover border border-border text-popover-foreground shadow-lg rounded-lg max-h-[24rem] overflow-y-auto"
            >
              {/* Header - Desktop: dengan link Lihat, Mobile: tanpa link */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <span className="font-bold text-lg">Keranjang ({totalItems})</span>
                <Link href="/cart" className="hidden sm:inline text-primary hover:underline text-sm font-medium">
                  Lihat
                </Link>
              </div>
              
              <div className="space-y-4">
                {cartItems.length > 0 ? (
                  cartItems.map((item: CartItem) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      {/* Gambar Produk */}
                      <Image
                        src={item.product.images[0]?.url || '/placeholder.png'}
                        alt={item.product.name}
                        width={80}
                        height={45}
                        className="rounded-md object-cover flex-shrink-0 sm:w-[72px] sm:h-[40px] w-[80px] h-[45px] aspect-video"
                      />
                      
                      {/* Desktop Layout: 2 kolom */}
                      <div className="hidden sm:flex flex-1 justify-between items-start">
                        {/* Kolom 1: Info Produk */}
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-medium text-sm text-foreground line-clamp-2 leading-tight">
                            {item.product.name}
                          </p>
                          <Badge className="text-xs px-2 py-0.5 mt-1 bg-secondary text-secondary-foreground">
                            {item.product.category}
                          </Badge>
                        </div>
                        
                        {/* Kolom 2: Quantity x Harga */}
                        <div className="text-right min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {item.quantity} x Rp. {item.product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Mobile Layout: 2 kolom */}
                      <div className="sm:hidden flex-1 space-y-1">
                        {/* Baris 1: Nama Produk */}
                        <p className="font-medium text-base text-foreground line-clamp-2 leading-tight">
                          {item.product.name}
                        </p>
                        
                        {/* Baris 2: Kategori */}
                        <div>
                          <Badge className="text-xs px-2 py-1 bg-secondary text-secondary-foreground inline-block">
                            {item.product.category}
                          </Badge>
                        </div>
                        
                        {/* Baris 3: Quantity x Harga (rata kanan) */}
                        <p className="text-base font-semibold text-foreground text-right">
                          {item.quantity} x Rp. {item.product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Keranjang kosong</p>
                  </div>
                )}
              </div>
              
              {/* Total Price - Only show if cart has items */}
              {cartItems.length > 0 && (
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base">Total:</span>
                    <span className="font-bold text-base text-primary">
                      Rp. {getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Mobile Button - Hanya tampil di mobile */}
              {cartItems.length > 0 && (
                <div className="mt-5 sm:hidden">
                  <Button
                    variant="default"
                    className="w-full py-3 text-base font-medium"
                    asChild
                  >
                    <Link href="/cart">Lihat Keranjang</Link>
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
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