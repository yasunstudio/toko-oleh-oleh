#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ExportOptions {
  format: 'json' | 'csv'
  tables?: string[]
  outputDir?: string
}

class DataExporter {
  private outputDir: string

  constructor(options: ExportOptions) {
    this.outputDir = options.outputDir || './data-exports'
    
    // Create export directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async exportAllData() {
    console.log('🚀 Starting data export...')
    
    try {
      // Export Users
      await this.exportUsers()
      
      // Export Products
      await this.exportProducts()
      
      // Export Categories
      await this.exportCategories()
      
      // Export Orders
      await this.exportOrders()
      
      // Export Contact Messages
      await this.exportContactMessages()
      
      // Export Hero Slides
      await this.exportHeroSlides()
      
      // Export Bank Accounts
      await this.exportBankAccounts()
      
      console.log('✨ Data export completed successfully!')
      
    } catch (error) {
      console.error('❌ Export failed:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }

  private async exportUsers() {
    console.log('📊 Exporting users...')
    const users = await prisma.user.findMany({
      include: {
        orders: true,
        cart: {
          include: {
            product: true
          }
        }
      }
    })
    
    await this.saveToFile('users', users)
    console.log(`✓ Exported ${users.length} users`)
  }

  private async exportProducts() {
    console.log('📦 Exporting products...')
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        cartItems: true,
        orderItems: true
      }
    })
    
    await this.saveToFile('products', products)
    console.log(`✓ Exported ${products.length} products`)
  }

  private async exportCategories() {
    console.log('📂 Exporting categories...')
    const categories = await prisma.category.findMany({
      include: {
        products: true
      }
    })
    
    await this.saveToFile('categories', categories)
    console.log(`✓ Exported ${categories.length} categories`)
  }

  private async exportOrders() {
    console.log('🛍️ Exporting orders...')
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })
    
    await this.saveToFile('orders', orders)
    console.log(`✓ Exported ${orders.length} orders`)
  }

  private async exportContactMessages() {
    console.log('📧 Exporting contact messages...')
    const contactMessages = await prisma.contact.findMany()
    
    await this.saveToFile('contact_messages', contactMessages)
    console.log(`✓ Exported ${contactMessages.length} contact messages`)
  }

  private async exportHeroSlides() {
    console.log('🎨 Exporting hero slides...')
    const heroSlides = await prisma.heroSlide.findMany()
    
    await this.saveToFile('hero_slides', heroSlides)
    console.log(`✓ Exported ${heroSlides.length} hero slides`)
  }

  private async exportBankAccounts() {
    console.log('🏦 Exporting bank accounts...')
    const bankAccounts = await prisma.bankAccount.findMany()
    
    await this.saveToFile('bank_accounts', bankAccounts)
    console.log(`✓ Exported ${bankAccounts.length} bank accounts`)
  }

  private async saveToFile(tableName: string, data: any[]) {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${tableName}_${timestamp}.json`
    const filepath = path.join(this.outputDir, filename)
    
    const jsonData = JSON.stringify(data, null, 2)
    fs.writeFileSync(filepath, jsonData, 'utf8')
    
    console.log(`💾 Saved to: ${filepath}`)
  }

  async exportTable(tableName: string) {
    console.log(`🔍 Exporting table: ${tableName}`)
    
    switch (tableName.toLowerCase()) {
      case 'users':
        await this.exportUsers()
        break
      case 'products':
        await this.exportProducts()
        break
      case 'categories':
        await this.exportCategories()
        break
      case 'orders':
        await this.exportOrders()
        break
      case 'contactmessages':
        await this.exportContactMessages()
        break
      case 'heroslides':
        await this.exportHeroSlides()
        break
      case 'bankaccounts':
        await this.exportBankAccounts()
        break
      default:
        console.error(`❌ Unknown table: ${tableName}`)
        console.log('Available tables: users, products, categories, orders, contactmessages, heroslides, bankaccounts')
        return
    }
    
    await prisma.$disconnect()
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage:')
    console.log('  npm run export-data all           # Export all tables')
    console.log('  npm run export-data table users   # Export specific table')
    console.log('Available tables: users, products, categories, orders, contactmessages, heroslides, bankaccounts')
    return
  }

  const exporter = new DataExporter({ format: 'json' })

  if (args[0] === 'all') {
    await exporter.exportAllData()
  } else if (args[0] === 'table' && args[1]) {
    await exporter.exportTable(args[1])
  } else {
    console.error('Invalid arguments')
    console.log('Usage:')
    console.log('  npm run export-data all           # Export all tables')
    console.log('  npm run export-data table users   # Export specific table')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { DataExporter }
