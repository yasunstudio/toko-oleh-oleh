'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/hooks/use-sidebar'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Settings,
  BarChart3,
  Tag,
  MessageSquare,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  FileText,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Star,
  Bell
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: any
  badge?: string | number
  subItems?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    badge: '🏠'
  },
  {
    title: 'Kelola Pesanan',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 5 // Pesanan baru yang menunggu
  },
  {
    title: 'Pembayaran',
    href: '/admin/payments',
    icon: CreditCard,
    badge: '💳'
  },
  {
    title: 'Inventori',
    href: '#',
    icon: Package,
    subItems: [
      {
        title: 'Semua Produk',
        href: '/admin/products',
        icon: Package
      },
      {
        title: 'Kategori',
        href: '/admin/categories',
        icon: Tag
      }
    ]
  },
  {
    title: 'Marketing',
    href: '#',
    icon: TrendingUp,
    subItems: [
      {
        title: 'Hero Slides',
        href: '/admin/hero-slides',
        icon: Monitor
      }
    ]
  },
  {
    title: 'Pelanggan',
    href: '/admin/users',
    icon: Users,
    badge: '👥'
  },
  {
    title: 'Laporan',
    href: '/admin/reports',
    icon: BarChart3,
    badge: '📊'
  },
  {
    title: 'Komunikasi',
    href: '/admin/contacts',
    icon: MessageSquare,
    badge: 2
  },
  {
    title: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
    badge: '⚙️'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Filter items based on search
  const filteredItems = sidebarItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subItems?.some(subItem => 
      subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href) && href !== '#'
  }

  const isParentActive = (item: SidebarItem) => {
    if (item.href !== '#') {
      return isActive(item.href)
    }
    return item.subItems?.some(subItem => isActive(subItem.href)) || false
  }

  const renderSidebarItem = (item: SidebarItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isItemActive = isActive(item.href)
    const isParentItemActive = isParentActive(item)
    const isExpanded = expandedItems.includes(item.title)

    if (hasSubItems) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => toggleExpand(item.title)}
            className={cn(
              'w-full justify-between p-0 h-auto',
              isParentItemActive && 'bg-primary/10'
            )}
          >
            <div
              className={cn(
                'flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group flex-1',
                isParentItemActive
                  ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent hover:text-accent-foreground hover:shadow-sm',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  'transition-all duration-200',
                  isCollapsed ? 'h-6 w-6' : 'h-5 w-5',
                  isParentItemActive ? 'text-primary' : 'group-hover:scale-110'
                )} />
                {item.badge && typeof item.badge === 'number' && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.title}</span>
                  {typeof item.badge === 'string' && (
                    <span className="text-xs opacity-70">{item.badge}</span>
                  )}
                </>
              )}
            </div>
            {!isCollapsed && (
              <div className="px-3">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          </Button>

          {/* Sub Items */}
          {isExpanded && !isCollapsed && (
            <div className="ml-4 pl-4 border-l-2 border-border/50 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {item.subItems?.map(subItem => renderSidebarItem(subItem, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href === '#' ? '' : item.href}
        onClick={(e) => {
          if (item.href === '#') {
            e.preventDefault()
          }
        }}
        className={cn(
          'flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
          isItemActive
            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg scale-[1.02]'
            : isSubItem
            ? 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground ml-2'
            : 'text-muted-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent hover:text-accent-foreground hover:shadow-sm hover:scale-[1.01]',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <div className="relative">
          <item.icon className={cn(
            'transition-all duration-200',
            isCollapsed ? 'h-6 w-6' : 'h-5 w-5',
            isItemActive ? 'text-primary-foreground' : 'group-hover:scale-110'
          )} />
          {item.badge && typeof item.badge === 'number' && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {item.badge}
            </Badge>
          )}
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {typeof item.badge === 'string' && (
              <span className="text-xs opacity-70">{item.badge}</span>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={toggleCollapsed} 
        />
      )}
      
      <div className={cn(
        'bg-gradient-to-b from-card via-card to-card/95 shadow-xl border-r border-border/50 fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col',
        isCollapsed ? 'w-20' : 'w-72',
        // Mobile: hide sidebar completely when collapsed, show overlay when expanded
        'lg:translate-x-0',
        isCollapsed ? 'max-lg:-translate-x-full' : 'max-lg:translate-x-0'
      )}>
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-xs text-muted-foreground">
                Kelola toko Anda dengan mudah
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleCollapsed()}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className={cn('space-y-2', isCollapsed ? 'px-2 py-4' : 'px-4 pb-4')}>
          {filteredItems.map(item => renderSidebarItem(item))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-transparent">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistem Online</span>
            </div>
            <p>© 2025 Toko Oleh-Oleh</p>
          </div>
        </div>
      )}
    </div>
    </>
  )
}