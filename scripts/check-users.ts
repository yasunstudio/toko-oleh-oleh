#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking all users in database...\n')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  })

  console.log('📊 Total users found:', users.length)
  console.log('='.repeat(50))
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. User:`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   🔐 Role: ${user.role}`)
    console.log(`   📅 Created: ${user.createdAt.toISOString().split('T')[0]}`)
    console.log('')
  })

  console.log('🔑 LOGIN CREDENTIALS:')
  console.log('='.repeat(30))
  console.log('👨‍💼 ADMIN LOGIN:')
  console.log('   Email: admin@tokooleholeh.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('👤 CUSTOMER LOGIN:')
  console.log('   Email: customer@example.com')
  console.log('   Password: customer123')
  console.log('')
  
  await prisma.$disconnect()
}

// Test password verification
async function testPassword() {
  console.log('🧪 Testing password verification...\n')
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@tokooleholeh.com' }
  })
  
  if (admin) {
    const isValidAdmin = await bcrypt.compare('admin123', admin.password)
    console.log(`✅ Admin password "admin123" is valid: ${isValidAdmin}`)
    
    const isWrongPassword = await bcrypt.compare('passwordadmin123', admin.password)
    console.log(`❌ Wrong password "passwordadmin123" is valid: ${isWrongPassword}`)
  }
  
  await prisma.$disconnect()
}

async function main() {
  await checkUsers()
  await testPassword()
}

main().catch(console.error)
