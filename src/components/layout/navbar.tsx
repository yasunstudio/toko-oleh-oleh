'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { totalItems, clearCart } = useCartStore()

  const handleSignOut = () => {
    clearCart() // Clear cart when signing out
    signOut({ callbackUrl: '/' })
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
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-accent">
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
            </Link>

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
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/products"
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Produk
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Kategori
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Tentang
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontak
              </Link>
              {!session && (
                 <div className="pt-2 space-y-1 border-t border-border mt-1">
                    <Button variant="outline" className="w-full justify-start border-border hover:bg-accent hover:text-accent-foreground" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link href="/auth/login">Masuk</Link>
                    </Button>
                    <Button className="w-full justify-start" asChild onClick={() => setIsMenuOpen(false)}>
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