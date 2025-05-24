import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Get all customers with their order data
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for Excel export
    const customerData = customers.map(customer => {
      const orderCount = customer.orders.length
      const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
      const lastOrderDate = customer.orders.length > 0 
        ? new Date(Math.max(...customer.orders.map((o: any) => o.createdAt.getTime())))
        : null
      
      let segment = 'Tidak Aktif'
      if (orderCount === 1) segment = 'Baru'
      else if (orderCount >= 2 && orderCount <= 5) segment = 'Reguler'
      else if (orderCount > 5) segment = 'VIP'

      return {
        'ID Pelanggan': customer.id,
        'Nama': customer.name || 'N/A',
        'Email': customer.email,
        'Tanggal Daftar': customer.createdAt.toLocaleDateString('id-ID'),
        'Jumlah Pesanan': orderCount,
        'Total Pengeluaran': totalSpent,
        'Pesanan Terakhir': lastOrderDate ? lastOrderDate.toLocaleDateString('id-ID') : 'Tidak ada',
        'Segmen': segment,
        'Status': orderCount > 0 ? 'Aktif' : 'Tidak Aktif'
      }
    })

    // Get new customers in the current period
    const newCustomers = customers.filter(customer => 
      customer.createdAt >= startDate
    ).map(customer => ({
      'ID Pelanggan': customer.id,
      'Nama': customer.name || 'N/A',
      'Email': customer.email,
      'Tanggal Daftar': customer.createdAt.toLocaleDateString('id-ID'),
      'Jumlah Pesanan': customer.orders.length,
      'Total Pengeluaran': customer.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    }))

    // Get customer acquisition data
    const acquisitionData = []
    for (let i = parseInt(period); i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const count = customers.filter(customer => 
        customer.createdAt >= date && customer.createdAt < nextDate
      ).length

      acquisitionData.push({
        'Tanggal': date.toLocaleDateString('id-ID'),
        'Pelanggan Baru': count
      })
    }

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Add customer data sheet
    const customerSheet = XLSX.utils.json_to_sheet(customerData)
    XLSX.utils.book_append_sheet(workbook, customerSheet, 'Semua Pelanggan')

    // Add new customers sheet
    const newCustomerSheet = XLSX.utils.json_to_sheet(newCustomers)
    XLSX.utils.book_append_sheet(workbook, newCustomerSheet, 'Pelanggan Baru')

    // Add acquisition data sheet
    const acquisitionSheet = XLSX.utils.json_to_sheet(acquisitionData)
    XLSX.utils.book_append_sheet(workbook, acquisitionSheet, 'Data Akuisisi')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Create response
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="laporan-pelanggan-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })

    return response

  } catch (error) {
    console.error('Error exporting customer report:', error)
    return NextResponse.json(
      { error: 'Failed to export customer report' },
      { status: 500 }
    )
  }
}
