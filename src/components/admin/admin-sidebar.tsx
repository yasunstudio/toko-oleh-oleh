'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Settings,
  BarChart3,
  Tag
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Pesanan',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  {
    title: 'Produk',
    href: '/admin/products',
    icon: Package
  },
  {
    title: 'Kategori',
    href: '/admin/categories',
    icon: Tag
  },
  {
    title: 'Pengguna', // ← Tambahan baru
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Pembayaran',
    href: '/admin/payments',
    icon: CreditCard
  },
  {
    title: 'Laporan',
    href: '/admin/reports',
    icon: BarChart3
  },
  {
    title: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}