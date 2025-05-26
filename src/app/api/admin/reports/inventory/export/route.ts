import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const now = new Date()
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Get all products with detailed inventory information
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        },
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: startDate
              }
            }
          },
          select: {
            quantity: true
          }
        }
      },
      orderBy: {
        stock: 'asc'
      }
    })

    // Transform data for Excel export
    const inventoryData = products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const inventoryValue = product.stock * product.price
      
      let status = 'Normal'
      if (product.stock === 0) status = 'Habis Stok'
      else if (product.stock <= 10) status = 'Stok Rendah'
      else if (product.stock >= 50) status = 'Stok Tinggi'

      return {
        'ID Produk': product.id,
        'Nama Produk': product.name,
        'Kategori': product.category.name,
        'Stok Saat Ini': product.stock,
        'Harga Satuan': product.price,
        'Nilai Inventori': inventoryValue,
        'Terjual (Periode)': totalSold,
        'Status': status,
        'Tanggal Dibuat': product.createdAt.toLocaleDateString('id-ID')
      }
    })

    // Low stock products
    const lowStockData = products
      .filter(product => product.stock > 0 && product.stock <= 10)
      .map(product => ({
        'ID Produk': product.id,
        'Nama Produk': product.name,
        'Kategori': product.category.name,
        'Stok Tersisa': product.stock,
        'Harga Satuan': product.price,
        'Nilai Inventori': product.stock * product.price,
        'Rekomendasi': product.stock <= 5 ? 'Segera Restok' : 'Perlu Restok'
      }))

    // Out of stock products
    const outOfStockData = products
      .filter(product => product.stock === 0)
      .map(product => ({
        'ID Produk': product.id,
        'Nama Produk': product.name,
        'Kategori': product.category.name,
        'Harga Satuan': product.price,
        'Status': 'Habis Stok',
        'Aksi': 'Butuh Restok Segera'
      }))

    // Stock by category
    const categoryData = await prisma.category.findMany({
      select: {
        name: true,
        products: {
          where: {
            isActive: true
          },
          select: {
            stock: true,
            price: true
          }
        }
      }
    })

    const categoryStockData = categoryData.map(category => {
      const totalStock = category.products.reduce((sum, product) => sum + product.stock, 0)
      const totalValue = category.products.reduce((sum, product) => sum + (product.stock * product.price), 0)
      const avgStock = category.products.length > 0 ? totalStock / category.products.length : 0

      return {
        'Kategori': category.name,
        'Jumlah Produk': category.products.length,
        'Total Stok': totalStock,
        'Rata-rata Stok': Math.round(avgStock),
        'Total Nilai Inventori': totalValue
      }
    })

    // Stock movement data
    const stockMovement = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate
          }
        }
      },
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        order: {
          select: {
            createdAt: true
          }
        }
      }
    })

    const movementData = stockMovement.map(item => ({
      'ID Produk': item.product.id,
      'Nama Produk': item.product.name,
      'Kategori': item.product.category.name,
      'Stok Saat Ini': item.product.stock,
      'Kuantitas Terjual': item.quantity,
      'Tanggal Penjualan': item.order.createdAt.toLocaleDateString('id-ID')
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Add inventory overview sheet
    const inventorySheet = XLSX.utils.json_to_sheet(inventoryData)
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Overview Inventori')

    // Add low stock sheet
    const lowStockSheet = XLSX.utils.json_to_sheet(lowStockData)
    XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Stok Rendah')

    // Add out of stock sheet
    const outOfStockSheet = XLSX.utils.json_to_sheet(outOfStockData)
    XLSX.utils.book_append_sheet(workbook, outOfStockSheet, 'Habis Stok')

    // Add category analysis sheet
    const categorySheet = XLSX.utils.json_to_sheet(categoryStockData)
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Analisis Kategori')

    // Add stock movement sheet
    const movementSheet = XLSX.utils.json_to_sheet(movementData)
    XLSX.utils.book_append_sheet(workbook, movementSheet, 'Pergerakan Stok')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Create response
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="laporan-inventori-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })

    return response

  } catch (error) {
    console.error('Error exporting inventory report:', error)
    return NextResponse.json(
      { error: 'Failed to export inventory report' },
      { status: 500 }
    )
  }
}
