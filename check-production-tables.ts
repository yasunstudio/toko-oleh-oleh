import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
  try {
    console.log('🔍 Checking all database tables...\n');

    // Check Users
    const users = await prisma.user.findMany();
    console.log(`👥 Users: ${users.length} records`);
    if (users.length > 0) {
      console.log(`   - Admin: ${users.filter(u => u.role === 'ADMIN').length}`);
      console.log(`   - Customer: ${users.filter(u => u.role === 'CUSTOMER').length}`);
    }

    // Check Categories
    const categories = await prisma.category.findMany();
    console.log(`🏷️ Categories: ${categories.length} records`);

    // Check Products
    const products = await prisma.product.findMany();
    console.log(`🛍️ Products: ${products.length} records`);

    // Check Product Images
    const productImages = await prisma.productImage.findMany();
    console.log(`🖼️ Product Images: ${productImages.length} records`);

    // Check Orders
    const orders = await prisma.order.findMany();
    console.log(`📦 Orders: ${orders.length} records`);
    if (orders.length > 0) {
      console.log(`   - PENDING: ${orders.filter(o => o.status === 'PENDING').length}`);
      console.log(`   - PROCESSING: ${orders.filter(o => o.status === 'PROCESSING').length}`);
      console.log(`   - DELIVERED: ${orders.filter(o => o.status === 'DELIVERED').length}`);
    }

    // Check Order Items
    const orderItems = await prisma.orderItem.findMany();
    console.log(`📋 Order Items: ${orderItems.length} records`);

    // Check Cart Items
    const cartItems = await prisma.cartItem.findMany();
    console.log(`🛒 Cart Items: ${cartItems.length} records`);

    // Check Bank Accounts
    const bankAccounts = await prisma.bankAccount.findMany();
    console.log(`🏦 Bank Accounts: ${bankAccounts.length} records`);

    // Check Hero Slides
    const heroSlides = await prisma.heroSlide.findMany();
    console.log(`🎠 Hero Slides: ${heroSlides.length} records`);

    // Check Contact Messages
    const contacts = await prisma.contact.findMany();
    console.log(`📧 Contact Messages: ${contacts.length} records`);

    // Check Notifications
    const notifications = await prisma.notification.findMany();
    console.log(`🔔 Notifications: ${notifications.length} records`);

    // Check Visitors
    const visitors = await prisma.visitor.findMany();
    console.log(`👁️ Visitors: ${visitors.length} records`);

    // Check Page Visits
    const pageVisits = await prisma.pageVisit.findMany();
    console.log(`📄 Page Visits: ${pageVisits.length} records`);

    // Check Settings
    const settings = await prisma.setting.findMany();
    console.log(`⚙️ Settings: ${settings.length} records`);

    console.log('\n✅ Database check complete!');

    // Identify empty tables
    const tables = [
      { name: 'Users', count: users.length },
      { name: 'Categories', count: categories.length },
      { name: 'Products', count: products.length },
      { name: 'Product Images', count: productImages.length },
      { name: 'Orders', count: orders.length },
      { name: 'Order Items', count: orderItems.length },
      { name: 'Cart Items', count: cartItems.length },
      { name: 'Bank Accounts', count: bankAccounts.length },
      { name: 'Hero Slides', count: heroSlides.length },
      { name: 'Contact Messages', count: contacts.length },
      { name: 'Notifications', count: notifications.length },
      { name: 'Visitors', count: visitors.length },
      { name: 'Page Visits', count: pageVisits.length },
      { name: 'Settings', count: settings.length },
    ];

    const emptyTables = tables.filter(table => table.count === 0);
    
    if (emptyTables.length > 0) {
      console.log('\n⚠️ Empty tables found:');
      emptyTables.forEach(table => {
        console.log(`   ❌ ${table.name}: 0 records`);
      });
    } else {
      console.log('\n🎉 All tables have data!');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();
