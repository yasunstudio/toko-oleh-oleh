#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

class CSVExporter {
  private outputDir: string

  constructor(outputDir = './csv-exports') {
    this.outputDir = outputDir
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  async exportUsersCSV() {
    console.log('📊 Exporting users to CSV...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    const flatUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalOrders: user._count.orders,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }))

    await this.saveCSV('users', flatUsers)
    console.log(`✓ Exported ${users.length} users`)
  }

  async exportProductsCSV() {
    console.log('📦 Exporting products to CSV...')
    
    const products = await prisma.product.findMany({
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    })

    const flatProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryName: product.category.name,
      isActive: product.isActive,
      totalSold: product._count.orderItems,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }))

    await this.saveCSV('products', flatProducts)
    console.log(`✓ Exported ${products.length} products`)
  }

  async exportOrdersCSV() {
    console.log('🛍️ Exporting orders to CSV...')
    
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    })

    const flatOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      customerEmail: order.user.email,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalItems: order._count.orderItems,
      shippingAddress: order.shippingAddress,
      notes: order.notes || '',
      paymentProof: order.paymentProof || '',
      bankAccount: order.bankAccount || '',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }))

    await this.saveCSV('orders', flatOrders)
    console.log(`✓ Exported ${orders.length} orders`)
  }

  async exportContactMessagesCSV() {
    console.log('📧 Exporting contact messages to CSV...')
    
    const contacts = await prisma.contact.findMany()

    const flatContacts = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
      isRead: contact.isRead,
      adminReply: contact.adminReply || '',
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }))

    await this.saveCSV('contact_messages', flatContacts)
    console.log(`✓ Exported ${contacts.length} contact messages`)
  }

  async exportSalesReport() {
    console.log('📈 Exporting sales report to CSV...')
    
    const salesData = await prisma.order.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'DELIVERED']
        }
      },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        payment: true
      }
    })

    const flatSalesData = salesData.flatMap(order => 
      order.items.map(item => ({
        orderId: order.id,
        orderDate: order.createdAt.toISOString().split('T')[0],
        customerName: order.user.name,
        customerEmail: order.user.email,
        productId: item.productId,
        productName: item.product.name,
        categoryName: item.product.category.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalItemPrice: item.quantity * item.price,
        orderTotalAmount: order.totalAmount,
        paymentMethod: order.payment?.method || '',
        paymentStatus: order.payment?.status || '',
        orderStatus: order.status
      }))
    )

    await this.saveCSV('sales_report', flatSalesData)
    console.log(`✓ Exported ${flatSalesData.length} sales records`)
  }

  private async saveCSV(filename: string, data: any[]) {
    const timestamp = new Date().toISOString().split('T')[0]
    const csvFilename = `${filename}_${timestamp}.csv`
    const filepath = path.join(this.outputDir, csvFilename)
    
    const csvContent = this.arrayToCSV(data)
    await fs.promises.writeFile(filepath, csvContent, 'utf8')
  }

  async exportAll() {
    console.log('🚀 Starting CSV export...')
    
    try {
      await this.exportUsersCSV()
      await this.exportProductsCSV()
      await this.exportOrdersCSV()
      await this.exportPaymentsCSV()
      await this.exportContactMessagesCSV()
      await this.exportSalesReport()
      
      console.log('✅ CSV export completed successfully!')
      console.log(`📁 Files saved to: ${this.outputDir}`)
      
    } catch (error) {
      console.error('❌ CSV export failed:', error)
    } finally {
      await prisma.$disconnect()
    }
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2)
  const format = args[0] || 'all'
  
  const exporter = new CSVExporter('./csv-exports')

  switch (format) {
    case 'all':
      await exporter.exportAll()
      break
    case 'users':
      await exporter.exportUsersCSV()
      break
    case 'products':
      await exporter.exportProductsCSV()
      break
    case 'orders':
      await exporter.exportOrdersCSV()
      break
    case 'payments':
      await exporter.exportPaymentsCSV()
      break
    case 'contacts':
      await exporter.exportContactMessagesCSV()
      break
    case 'sales':
      await exporter.exportSalesReport()
      break
    default:
      console.log('Usage:')
      console.log('  npm run export-csv all       # Export all tables')
      console.log('  npm run export-csv users     # Export users')
      console.log('  npm run export-csv products  # Export products')
      console.log('  npm run export-csv orders    # Export orders')
      console.log('  npm run export-csv payments  # Export payments')
      console.log('  npm run export-csv contacts  # Export contact messages')
      console.log('  npm run export-csv sales     # Export sales report')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { CSVExporter }
