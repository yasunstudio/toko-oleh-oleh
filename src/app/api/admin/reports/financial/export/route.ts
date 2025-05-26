import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ExcelJS from 'exceljs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Get all completed orders in current period
    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    // Get pending payments
    const pendingPayments = await prisma.order.findMany({
      where: {
        paymentStatus: {
          in: ['PENDING', 'PAID']
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        user: true
      }
    })

    // Calculate financial metrics
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    let totalCOGS = 0
    for (const order of completedOrders) {
      for (const item of order.orderItems) {
        const itemCost = item.product.price * 0.6 * item.quantity
        totalCOGS += itemCost
      }
    }

    const grossProfit = totalRevenue - totalCOGS

    // Expense categories
    const expenses = [
      { category: 'Operasional', amount: totalCOGS * 0.1 },
      { category: 'Marketing', amount: totalRevenue * 0.05 },
      { category: 'Pengiriman', amount: completedOrders.length * 15000 }
    ]
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) + totalCOGS
    const netProfit = totalRevenue - totalExpenses

    // Create workbook
    const workbook = new ExcelJS.Workbook()

    // Sheet 1: Financial Overview
    const overviewSheet = workbook.addWorksheet('Ringkasan Keuangan')
    
    // Header styling
    const headerStyle = {
      fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF366092' } },
      font: { color: { argb: 'FFFFFFFF' }, bold: true },
      alignment: { horizontal: 'center' as const }
    }

    // Overview headers
    overviewSheet.addRow(['Laporan Keuangan - Ringkasan'])
    overviewSheet.addRow([`Periode: ${period} hari terakhir`])
    overviewSheet.addRow([`Tanggal Generate: ${new Date().toLocaleDateString('id-ID')}`])
    overviewSheet.addRow([])

    // Financial summary
    overviewSheet.addRow(['Metrik', 'Nilai'])
    overviewSheet.getRow(5).eachCell((cell) => Object.assign(cell, headerStyle))
    
    overviewSheet.addRow(['Total Pendapatan', totalRevenue])
    overviewSheet.addRow(['Total COGS (Cost of Goods Sold)', totalCOGS])
    overviewSheet.addRow(['Laba Kotor', grossProfit])
    overviewSheet.addRow(['Total Pengeluaran', totalExpenses])
    overviewSheet.addRow(['Laba Bersih', netProfit])
    overviewSheet.addRow(['Margin Laba Kotor (%)', totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0])
    overviewSheet.addRow(['Margin Laba Bersih (%)', totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0])
    overviewSheet.addRow(['Rata-rata Nilai Transaksi', completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0])
    overviewSheet.addRow(['Total Pembayaran Tertunda', pendingPayments.reduce((sum, order) => sum + order.totalAmount, 0)])
    overviewSheet.addRow(['Jumlah Order Tertunda', pendingPayments.length])

    // Format currency columns
    for (let i = 6; i <= 14; i++) {
      if (i !== 11 && i !== 12) { // Skip percentage rows
        overviewSheet.getCell(`B${i}`).numFmt = '"Rp "#,##0'
      }
    }

    // Auto-fit columns
    overviewSheet.columns.forEach((column) => {
      column.width = 25
    })

    // Sheet 2: Daily Revenue Data
    const dailySheet = workbook.addWorksheet('Pendapatan Harian')
    
    // Daily revenue calculation
    const dailyRevenueMap = new Map<string, number>()
    const dailyCOGSMap = new Map<string, number>()
    
    for (let i = 0; i < parseInt(period); i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split('T')[0]
      dailyRevenueMap.set(dateString, 0)
      dailyCOGSMap.set(dateString, 0)
    }

    for (const order of completedOrders) {
      const dateString = order.createdAt.toISOString().split('T')[0]
      const currentRevenue = dailyRevenueMap.get(dateString) || 0
      dailyRevenueMap.set(dateString, currentRevenue + order.totalAmount)

      let orderCOGS = 0
      for (const item of order.orderItems) {
        orderCOGS += item.product.price * 0.6 * item.quantity
      }
      const currentCOGS = dailyCOGSMap.get(dateString) || 0
      dailyCOGSMap.set(dateString, currentCOGS + orderCOGS)
    }

    // Daily sheet headers
    dailySheet.addRow(['Tanggal', 'Pendapatan', 'COGS', 'Laba Kotor', 'Margin Laba (%)'])
    dailySheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

    Array.from(dailyRevenueMap.entries()).sort().forEach(([date, revenue]) => {
      const cogs = dailyCOGSMap.get(date) || 0
      const profit = revenue - cogs
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0
      
      dailySheet.addRow([
        new Date(date).toLocaleDateString('id-ID'),
        revenue,
        cogs,
        profit,
        parseFloat(margin.toFixed(2))
      ])
    })

    // Format currency columns in daily sheet
    for (let i = 2; i <= dailySheet.rowCount; i++) {
      dailySheet.getCell(`B${i}`).numFmt = '"Rp "#,##0'
      dailySheet.getCell(`C${i}`).numFmt = '"Rp "#,##0'
      dailySheet.getCell(`D${i}`).numFmt = '"Rp "#,##0'
    }

    dailySheet.columns.forEach((column) => {
      column.width = 18
    })

    // Sheet 3: Top Revenue Products
    const productsSheet = workbook.addWorksheet('Produk Terlaris')
    
    // Calculate product revenue
    const productRevenueMap = new Map<string, { productName: string, revenue: number, quantity: number }>()
    for (const order of completedOrders) {
      for (const item of order.orderItems) {
        const current = productRevenueMap.get(item.productId) || {
          productName: item.product.name,
          revenue: 0,
          quantity: 0
        }
        productRevenueMap.set(item.productId, {
          ...current,
          revenue: current.revenue + (item.price * item.quantity),
          quantity: current.quantity + item.quantity
        })
      }
    }

    const topProducts = Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20)

    // Products sheet headers
    productsSheet.addRow(['Ranking', 'Nama Produk', 'Total Pendapatan', 'Jumlah Terjual', 'Rata-rata Harga'])
    productsSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

    topProducts.forEach((product, index) => {
      const avgPrice = product.quantity > 0 ? product.revenue / product.quantity : 0
      productsSheet.addRow([
        index + 1,
        product.productName,
        product.revenue,
        product.quantity,
        avgPrice
      ])
    })

    // Format currency columns in products sheet
    for (let i = 2; i <= productsSheet.rowCount; i++) {
      productsSheet.getCell(`C${i}`).numFmt = '"Rp "#,##0'
      productsSheet.getCell(`E${i}`).numFmt = '"Rp "#,##0'
    }

    productsSheet.columns.forEach((column) => {
      column.width = 20
    })

    // Sheet 4: Pending Payments
    const pendingSheet = workbook.addWorksheet('Pembayaran Tertunda')
    
    pendingSheet.addRow(['ID Order', 'Nama Customer', 'Total', 'Status Pembayaran', 'Status Order', 'Tanggal Order'])
    pendingSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

    pendingPayments.forEach(order => {
      const paymentStatusText = order.paymentStatus === 'PENDING' ? 'Menunggu Pembayaran' : 'Sudah Bayar'
      pendingSheet.addRow([
        order.id,
        order.user?.name || 'Unknown',
        order.totalAmount,
        paymentStatusText,
        order.status,
        order.createdAt.toLocaleDateString('id-ID')
      ])
    })

    // Format currency column in pending sheet
    for (let i = 2; i <= pendingSheet.rowCount; i++) {
      pendingSheet.getCell(`C${i}`).numFmt = '"Rp "#,##0'
    }

    pendingSheet.columns.forEach((column) => {
      column.width = 20
    })

    // Sheet 5: Expense Breakdown
    const expenseSheet = workbook.addWorksheet('Rincian Pengeluaran')
    
    expenseSheet.addRow(['Kategori Pengeluaran', 'Jumlah', 'Persentase dari Revenue'])
    expenseSheet.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle))

    // Add COGS first
    expenseSheet.addRow(['Cost of Goods Sold (COGS)', totalCOGS, totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(2) + '%' : '0%'])

    // Add other expenses
    expenses.forEach(expense => {
      const percentage = totalRevenue > 0 ? ((expense.amount / totalRevenue) * 100).toFixed(2) + '%' : '0%'
      expenseSheet.addRow([expense.category, expense.amount, percentage])
    })

    // Add total
    expenseSheet.addRow(['TOTAL PENGELUARAN', totalExpenses, totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(2) + '%' : '0%'])

    // Format currency column in expense sheet
    for (let i = 2; i <= expenseSheet.rowCount; i++) {
      expenseSheet.getCell(`B${i}`).numFmt = '"Rp "#,##0'
    }

    // Make total row bold
    const totalRow = expenseSheet.getRow(expenseSheet.rowCount)
    totalRow.eachCell((cell) => {
      cell.font = { bold: true }
    })

    expenseSheet.columns.forEach((column) => {
      column.width = 25
    })

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`
      }
    })

  } catch (error) {
    console.error('Error exporting financial report:', error)
    return NextResponse.json(
      { error: 'Failed to export financial report' },
      { status: 500 }
    )
  }
}
