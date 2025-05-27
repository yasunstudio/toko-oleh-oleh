const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking Users Table ===');
    
    // Check current users
    const userCount = await prisma.user.count();
    console.log('Current number of users:', userCount);
    
    if (userCount === 0) {
      console.log('\n=== Creating Sample Users ===');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 12);
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@toko-oleh-oleh.com',
          name: 'Administrator',
          phone: '081234567890',
          role: 'ADMIN',
          password: adminPassword,
          address: 'Jl. Admin No. 1, Jakarta'
        }
      });
      console.log('✅ Created admin user:', adminUser.email);
      
      // Create regular customer
      const customerPassword = await bcrypt.hash('customer123', 12);
      const customerUser = await prisma.user.create({
        data: {
          email: 'customer@example.com',
          name: 'Customer Test',
          phone: '081234567891',
          role: 'CUSTOMER',
          password: customerPassword,
          address: 'Jl. Customer No. 2, Bandung'
        }
      });
      console.log('✅ Created customer user:', customerUser.email);
      
      // Create another customer
      const customer2Password = await bcrypt.hash('customer456', 12);
      const customer2User = await prisma.user.create({
        data: {
          email: 'john@example.com',
          name: 'John Doe',
          phone: '081234567892',
          role: 'CUSTOMER',
          password: customer2Password,
          address: 'Jl. Customer No. 3, Surabaya'
        }
      });
      console.log('✅ Created customer user:', customer2User.email);
      
      console.log('\n=== User Creation Summary ===');
      console.log('Admin Login:');
      console.log('  Email: admin@toko-oleh-oleh.com');
      console.log('  Password: admin123');
      console.log('\nCustomer Login:');
      console.log('  Email: customer@example.com');
      console.log('  Password: customer123');
      console.log('\nCustomer 2 Login:');
      console.log('  Email: john@example.com');
      console.log('  Password: customer456');
      
    } else {
      console.log('Users already exist. Current users:');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      
      users.forEach(user => {
        console.log(`- ${user.email} (${user.role}) - ${user.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
