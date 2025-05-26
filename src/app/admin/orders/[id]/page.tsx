import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'
import { OrderStatusManager } from '@/components/admin/order-status-manager'
import { OrderQuickActions } from '@/components/admin/order-quick-actions'
import { 
  User, 
  CreditCard, 
  MapPin, 
  Package, 
  Calendar,
  FileText,
  Phone,
  Mail,
  Building
} from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentStatus: string
  paymentProof?: string | null
  bankAccount?: string | null
  shippingAddress: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    phone?: string | null
  }
  orderItems: Array<{
    id: string
    product: {
      name: string
      images: string[]
    }
    quantity: number
    price: number
  }>
}

async function getOrder(id: string): Promise<OrderDetail | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        paymentStatus: true,
        paymentProof: true,
        bankAccount: true,
        shippingAddress: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) return null

    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: item.product.images.map(img => img.url),
        },
      })),
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function AdminOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }
  
  const order = await getOrder(params.id)
  if (!order) return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Pesanan Tidak Ditemukan</h2>
            <p className="text-sm text-muted-foreground">
              Pesanan dengan ID <span className="font-mono bg-muted px-1 rounded">{params.id}</span> tidak ditemukan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400'
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400'
      case 'VERIFIED':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400'
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400'
    }
  }

  return (
    <div className="p-3 space-y-3 max-w-6xl mx-auto">
      <AdminBreadcrumb 
        items={[
          { label: 'Kelola Pesanan', href: '/admin/orders' },
          { label: `#${order.orderNumber}` }
        ]} 
      />

      {/* Header Card - Compact */}
      <Card className="bg-card border-border animate-in fade-in-0 slide-in-from-top-4 duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pesanan #{order.orderNumber}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatPrice(order.totalAmount)}
              </div>
              <Badge variant="outline" className={`text-xs ${getStatusBadgeStyle(order.paymentStatus)}`}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <OrderQuickActions 
            orderId={order.id}
            orderNumber={order.orderNumber}
            paymentProof={order.paymentProof}
            order={order}
          />
        </CardContent>
      </Card>
      {/* Information Grid - Compact Layout */}
      <div className="grid md:grid-cols-3 gap-3">
        {/* Customer Info */}
        <Card className="bg-card border-border animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-100">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-950 rounded">
                <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-sm text-foreground">Pelanggan</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{order.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{order.user.email}</span>
              </div>
              {order.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{order.user.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="bg-card border-border animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-green-100 dark:bg-green-950 rounded">
                <CreditCard className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-sm text-foreground">Pembayaran</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status:</span>
                <Badge variant="outline" className={`text-xs ${getStatusBadgeStyle(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total:</span>
                <span className="text-sm font-medium text-foreground">{formatPrice(order.totalAmount)}</span>
              </div>
              {order.bankAccount && (
                <div className="flex items-center gap-2">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{order.bankAccount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card className="bg-card border-border animate-in fade-in-0 slide-in-from-right-4 duration-300 delay-300">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-purple-100 dark:bg-purple-950 rounded">
                <MapPin className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-sm text-foreground">Pengiriman</h3>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Alamat:</span>
                <p className="text-xs text-foreground leading-relaxed">{order.shippingAddress}</p>
              </div>
              {order.notes && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Catatan:</span>
                  <p className="text-xs text-foreground leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Management */}
      <div className="animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-400">
        <OrderStatusManager 
          orderId={order.id}
          orderNumber={order.orderNumber}
          currentStatus={order.status}
          currentPaymentStatus={order.paymentStatus}
        />
      </div>
      
      {/* Payment Proof - If Available */}
      {order.paymentProof && (
        <Card className="bg-card border-border animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-orange-100 dark:bg-orange-950 rounded">
                <FileText className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-medium text-sm text-foreground">Bukti Pembayaran</h3>
            </div>
            <div className="relative w-full max-w-md h-48 border border-border rounded-lg overflow-hidden bg-muted hover:scale-105 transition-transform duration-200">
              <Image
                src={order.paymentProof}
                alt="Bukti Pembayaran"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items - Modern Table */}
      <Card className="bg-card border-border animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-600">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-indigo-100 dark:bg-indigo-950 rounded">
              <Package className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-medium text-sm text-foreground">
              Produk Pesanan ({order.orderItems.length} item)
            </h3>
          </div>
          
          {order.orderItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada produk dalam pesanan ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {order.orderItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] group"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.quantity} × {formatPrice(item.price)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="font-medium text-sm text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Item #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Summary */}
              <Separator className="my-3" />
              <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${800 + order.orderItems.length * 100}ms` }}>
                <span className="font-medium text-sm text-foreground">Total Pesanan</span>
                <span className="font-bold text-base text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
