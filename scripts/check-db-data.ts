import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log("🔍 Checking Railway database data...\n");

    // Count all tables
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const notificationCount = await prisma.notification.count();
    const heroSlideCount = await prisma.heroSlide.count();
    const bankAccountCount = await prisma.bankAccount.count();

    console.log("📊 Database Statistics:");
    console.log(`👤 Users: ${userCount}`);
    console.log(`🏷️ Categories: ${categoryCount}`);
    console.log(`🛍️ Products: ${productCount}`);
    console.log(`📦 Orders: ${orderCount}`);
    console.log(`🔔 Notifications: ${notificationCount}`);
    console.log(`🎨 Hero Slides: ${heroSlideCount}`);
    console.log(`🏦 Bank Accounts: ${bankAccountCount}`);

    // Show some sample data
    console.log("\n📋 Sample Users:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log("\n📋 Sample Categories:");
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        _count: {
          select: { products: true }
        }
      }
    });
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category._count.products} products)`);
    });

    console.log("\n✅ Database check completed!");
    
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
