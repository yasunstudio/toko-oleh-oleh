'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CustomerNotifications } from '@/components/notifications/customer-notifications'
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Settings,
  Package
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { CartItem } from '@/types';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { totalItems, cartItems, clearCart } = useCartStore()

  const handleSignOut = async () => {
    try {
      clearCart() // Clear cart when signing out
      await signOut({
        callbackUrl: '/',
        redirect: true,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.product.price), 0)
  }

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">
              Toko Oleh-Oleh
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/products" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <Link 
              href="/categories" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Kategori
            </Link>
            <Link 
              href="/about" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Tentang
            </Link>
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Kontak
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2 sm:space-x-4">
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

            {/* Customer Notifications - Only show when logged in */}
            {session && <CustomerNotifications />}

            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-accent">
                    <User className="h-5 w-5" />
                    <span className="ml-2 hidden sm:block text-foreground">
                      {session.user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
                  <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                    <Link href="/orders" className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                      Pesanan Saya
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator className="bg-border"/>
                      <DropdownMenuItem asChild className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                        <Link href="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border"/>
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-accent">
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">Daftar</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-primary hover:bg-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 pt-4 pb-6 space-y-3 bg-card shadow-lg rounded-lg">
              <Link
                href="/products"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Produk
              </Link>
              <Link
                href="/categories"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Kategori
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontak
              </Link>
              {!session && (
                <div className="pt-4 space-y-3 border-t border-border mt-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border hover:bg-accent hover:text-accent-foreground"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/auth/login">Masuk</Link>
                  </Button>
                  <Button
                    className="w-full justify-start"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/auth/register">Daftar</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}