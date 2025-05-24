import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@tokooleholeh.com",
      name: "Admin Toko",
      password: adminPassword,
      role: "ADMIN",
      phone: "081234567890",
      address: "Jl. Raya Malang No. 123, Bekasi, Jawa Barat",
    },
  });

  // Create test customers
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer1 = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Budi Santoso",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "081987654321",
      address: "Jl. Merdeka No. 45, Jakarta Selatan",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "siti@example.com",
      name: "Siti Nurhaliza",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "081567891234",
      address: "Jl. Sudirman No. 67, Bandung, Jawa Barat",
    },
  });

  console.log("👤 Users created");

  // Create categories with more data
  const categories = [
    {
      name: "Makanan Kering",
      slug: "makanan-kering",
      description:
        "Berbagai makanan kering khas daerah yang tahan lama dan siap santap",
      image: "/uploads/category-makanan-kering.jpg",
    },
    {
      name: "Makanan Basah",
      slug: "makanan-basah",
      description:
        "Makanan basah dan segar dari berbagai daerah dengan cita rasa autentik",
      image: "/uploads/category-makanan-basah.jpg",
    },
    {
      name: "Keripik & Snack",
      slug: "keripik-snack",
      description:
        "Aneka keripik dan camilan khas nusantara yang renyah dan gurih",
      image: "/uploads/category-keripik.jpg",
    },
    {
      name: "Minuman Tradisional",
      slug: "minuman-tradisional",
      description: "Minuman tradisional khas daerah yang menyegarkan",
      image: "/uploads/category-minuman.jpg",
    },
    {
      name: "Kue & Roti",
      slug: "kue-roti",
      description:
        "Kue tradisional dan roti khas daerah dengan resep turun temurun",
      image: "/uploads/category-kue-roti.jpg",
    },
    {
      name: "Bumbu & Rempah",
      slug: "bumbu-rempah",
      description: "Bumbu masak dan rempah-rempah pilihan langsung dari petani",
      image: "/uploads/category-bumbu.jpg",
    },
    {
      name: "Gula & Pemanis",
      slug: "gula-pemanis",
      description: "Gula kelapa, gula aren, dan pemanis alami khas tradisional",
      image: "/uploads/category-gula.jpg",
    },
    {
      name: "Sambal & Saus",
      slug: "sambal-saus",
      description:
        "Aneka sambal dan saus khas daerah dengan tingkat kepedasan bervariasi",
      image: "/uploads/category-sambal.jpg",
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories.push(created);
  }

  console.log("🏷️ Categories created");

  // Create bank accounts
  const bankAccounts = [
    {
      bankName: "BCA",
      accountName: "Toko Oleh-Oleh",
      accountNumber: "1234567890",
      isActive: true,
    },
    {
      bankName: "Mandiri",
      accountName: "Toko Oleh-Oleh",
      accountNumber: "0987654321",
      isActive: true,
    },
    {
      bankName: "BRI",
      accountName: "Toko Oleh-Oleh",
      accountNumber: "5678901234",
      isActive: true,
    },
    {
      bankName: "BNI",
      accountName: "Toko Oleh-Oleh",
      accountNumber: "3456789012",
      isActive: true,
    },
  ];

  for (const account of bankAccounts) {
    await prisma.bankAccount.create({ data: account });
  }

  console.log("🏦 Bank accounts created");

  // Create extensive product list
  const products = [
    // Makanan Kering
    {
      name: "Rendang Daging Sapi Kering Premium",
      description:
        "Rendang daging sapi kering khas Padang dengan bumbu rempah pilihan. Dibuat dengan daging sapi pilihan dan dimasak hingga bumbu meresap sempurna. Tahan lama dan siap santap.",
      price: 125000,
      stock: 45,
      weight: 250,
      images: ["/uploads/rendang-kering.jpg"],
      categoryId: createdCategories[0].id,
      slug: "rendang-daging-sapi-kering-premium",
      isActive: true,
    },
    {
      name: "Abon Sapi Original Homemade",
      description:
        "Abon sapi berkualitas premium dengan rasa gurih dan tekstur halus. Dibuat dengan resep tradisional tanpa pengawet. Cocok untuk lauk atau camilan sehat.",
      price: 65000,
      stock: 75,
      weight: 150,
      images: ["/uploads/abon-sapi.jpg"],
      categoryId: createdCategories[0].id,
      slug: "abon-sapi-original-homemade",
      isActive: true,
    },
    {
      name: "Ikan Asin Jambal Roti Asli",
      description:
        "Ikan asin jambal roti khas Jawa Tengah, dikeringkan dengan sempurna menggunakan metode tradisional. Siap dimasak menjadi berbagai hidangan lezat.",
      price: 45000,
      stock: 40,
      weight: 200,
      images: ["/uploads/ikan-asin-jambal.jpg"],
      categoryId: createdCategories[0].id,
      slug: "ikan-asin-jambal-roti-asli",
      isActive: true,
    },
    {
      name: "Dendeng Balado Khas Sumatera",
      description:
        "Dendeng daging sapi dengan bumbu balado khas Sumatera. Pedas, gurih, dan sangat cocok sebagai lauk nasi atau camilan.",
      price: 95000,
      stock: 30,
      weight: 200,
      images: ["/uploads/dendeng-balado.jpg"],
      categoryId: createdCategories[0].id,
      slug: "dendeng-balado-khas-sumatera",
      isActive: true,
    },

    // Keripik & Snack
    {
      name: "Keripik Pisang Aneka Rasa Premium",
      description:
        "Keripik pisang crispy dengan berbagai varian rasa: original, balado, coklat, dan keju. Dibuat dari pisang pilihan dengan minyak kelapa murni.",
      price: 35000,
      stock: 100,
      weight: 150,
      images: ["/uploads/keripik-pisang.jpg"],
      categoryId: createdCategories[2].id,
      slug: "keripik-pisang-aneka-rasa-premium",
      isActive: true,
    },
    {
      name: "Keripik Singkong Pedas Manis",
      description:
        "Keripik singkong dengan bumbu pedas manis yang menggigit. Dibuat dari singkong segar dengan resep rahasia yang sudah turun temurun.",
      price: 28000,
      stock: 80,
      weight: 100,
      images: ["/uploads/keripik-singkong.jpg"],
      categoryId: createdCategories[2].id,
      slug: "keripik-singkong-pedas-manis",
      isActive: true,
    },
    {
      name: "Rempeyek Kacang Tanah Renyah",
      description:
        "Rempeyek kacang tanah super renyah dengan bumbu tradisional yang gurih dan nikmat. Cocok sebagai lauk atau camilan keluarga.",
      price: 22000,
      stock: 60,
      weight: 100,
      images: ["/uploads/rempeyek-kacang.jpg"],
      categoryId: createdCategories[2].id,
      slug: "rempeyek-kacang-tanah-renyah",
      isActive: true,
    },
    {
      name: "Keripik Tempe Original",
      description:
        "Keripik tempe original yang gurih dan renyah. Dibuat dari tempe segar berkualitas tinggi dengan bumbu sederhana yang menonjolkan rasa asli tempe.",
      price: 18000,
      stock: 90,
      weight: 100,
      images: ["/uploads/keripik-tempe.jpg"],
      categoryId: createdCategories[2].id,
      slug: "keripik-tempe-original",
      isActive: true,
    },
    {
      name: "Kerupuk Udang Sidoarjo",
      description:
        "Kerupuk udang asli Sidoarjo dengan kandungan udang yang tinggi. Renyah dan gurih, cocok sebagai pelengkap makan atau camilan.",
      price: 25000,
      stock: 70,
      weight: 120,
      images: ["/uploads/kerupuk-udang.jpg"],
      categoryId: createdCategories[2].id,
      slug: "kerupuk-udang-sidoarjo",
      isActive: true,
    },

    // Kue & Roti
    {
      name: "Kue Lapis Legit Premium",
      description:
        "Kue lapis legit premium dengan lapisan berlapis yang sempurna dan rasa yang manis legit. Dibuat dengan butter berkualitas tinggi dan telur segar.",
      price: 180000,
      stock: 25,
      weight: 500,
      images: ["/uploads/lapis-legit.jpg"],
      categoryId: createdCategories[4].id,
      slug: "kue-lapis-legit-premium",
      isActive: true,
    },
    {
      name: "Dodol Betawi Asli",
      description:
        "Dodol khas Betawi dengan tekstur kenyal dan rasa manis yang khas. Dibuat dengan resep tradisional menggunakan santan kelapa murni.",
      price: 35000,
      stock: 45,
      weight: 200,
      images: ["/uploads/dodol-betawi.jpg"],
      categoryId: createdCategories[4].id,
      slug: "dodol-betawi-asli",
      isActive: true,
    },
    {
      name: "Kue Bangkit Kelapa",
      description:
        "Kue bangkit dengan aroma kelapa yang harum dan tekstur yang lembut. Kue tradisional yang cocok untuk berbagai acara.",
      price: 45000,
      stock: 35,
      weight: 150,
      images: ["/uploads/kue-bangkit.jpg"],
      categoryId: createdCategories[4].id,
      slug: "kue-bangkit-kelapa",
      isActive: true,
    },
    {
      name: "Bika Ambon Original",
      description:
        "Bika Ambon asli Medan dengan tekstur berlubang khas dan rasa yang manis legit. Dibuat dengan resep turun temurun.",
      price: 55000,
      stock: 20,
      weight: 300,
      images: ["/uploads/bika-ambon.jpg"],
      categoryId: createdCategories[4].id,
      slug: "bika-ambon-original",
      isActive: true,
    },

    // Minuman Tradisional
    {
      name: "Kopi Luwak Arabica Premium",
      description:
        "Kopi luwak arabica premium dari pegunungan Jawa dengan cita rasa yang eksotis dan aroma yang khas. Sudah melalui proses fermentasi alami.",
      price: 350000,
      stock: 15,
      weight: 100,
      images: ["/uploads/kopi-luwak.jpg"],
      categoryId: createdCategories[3].id,
      slug: "kopi-luwak-arabica-premium",
      isActive: true,
    },
    {
      name: "Teh Pucuk Gunung Organik",
      description:
        "Teh pucuk dari dataran tinggi yang ditanam secara organik. Aroma harum dan rasa yang segar, kaya akan antioksidan.",
      price: 45000,
      stock: 55,
      weight: 100,
      images: ["/uploads/teh-pucuk.jpg"],
      categoryId: createdCategories[3].id,
      slug: "teh-pucuk-gunung-organik",
      isActive: true,
    },
    {
      name: "Wedang Jahe Instan",
      description:
        "Minuman jahe instan dengan campuran rempah-rempah pilihan. Hangat dan menyehatkan, cocok diminum kapan saja.",
      price: 15000,
      stock: 80,
      weight: 50,
      images: ["/uploads/wedang-jahe.jpg"],
      categoryId: createdCategories[3].id,
      slug: "wedang-jahe-instan",
      isActive: true,
    },
    {
      name: "Secang Traditional Drink",
      description:
        "Minuman tradisional dari kayu secang yang kaya manfaat. Memberikan warna merah alami dan rasa yang khas.",
      price: 25000,
      stock: 40,
      weight: 100,
      images: ["/uploads/secang.jpg"],
      categoryId: createdCategories[3].id,
      slug: "secang-traditional-drink",
      isActive: true,
    },

    // Bumbu & Rempah
    {
      name: "Sambal Oelek Super Pedas",
      description:
        "Sambal oelek dengan tingkat kepedasan tinggi, dibuat dari cabai rawit pilihan. Tanpa pengawet buatan, murni pedas alami.",
      price: 18000,
      stock: 90,
      weight: 250,
      images: ["/uploads/sambal-oelek.jpg"],
      categoryId: createdCategories[5].id,
      slug: "sambal-oelek-super-pedas",
      isActive: true,
    },
    {
      name: "Bumbu Rendang Instan Premium",
      description:
        "Bumbu rendang instan siap pakai dengan komposisi rempah yang tepat dan cita rasa autentik Padang. Praktis dan berkualitas.",
      price: 15000,
      stock: 70,
      weight: 50,
      images: ["/uploads/bumbu-rendang.jpg"],
      categoryId: createdCategories[5].id,
      slug: "bumbu-rendang-instan-premium",
      isActive: true,
    },
    {
      name: "Bumbu Gudeg Yogyakarta",
      description:
        "Bumbu gudeg khas Yogyakarta dengan rasa manis yang authentic. Lengkap dengan semua rempah untuk membuat gudeg yang lezat.",
      price: 20000,
      stock: 50,
      weight: 75,
      images: ["/uploads/bumbu-gudeg.jpg"],
      categoryId: createdCategories[5].id,
      slug: "bumbu-gudeg-yogyakarta",
      isActive: true,
    },
    {
      name: "Kemiri Bakar Premium",
      description:
        "Kemiri bakar berkualitas premium untuk bumbu masakan. Sudah dibakar dengan sempurna untuk menghasilkan aroma yang harum.",
      price: 35000,
      stock: 60,
      weight: 200,
      images: ["/uploads/kemiri-bakar.jpg"],
      categoryId: createdCategories[5].id,
      slug: "kemiri-bakar-premium",
      isActive: true,
    },

    // Gula & Pemanis
    {
      name: "Gula Kelapa Organik",
      description:
        "Gula kelapa organik murni tanpa bahan kimia. Rasa manis alami yang lebih sehat sebagai pengganti gula pasir.",
      price: 25000,
      stock: 65,
      weight: 500,
      images: ["/uploads/gula-kelapa.jpg"],
      categoryId: createdCategories[6].id,
      slug: "gula-kelapa-organik",
      isActive: true,
    },
    {
      name: "Gula Aren Asli Cair",
      description:
        "Gula aren cair asli dari nira aren segar. Tidak menggunakan pengawet dan pemanis buatan, rasa manis yang natural.",
      price: 30000,
      stock: 40,
      weight: 300,
      images: ["/uploads/gula-aren.jpg"],
      categoryId: createdCategories[6].id,
      slug: "gula-aren-asli-cair",
      isActive: true,
    },

    // Sambal & Saus
    {
      name: "Sambal Matah Bali Original",
      description:
        "Sambal matah khas Bali dengan irisan bawang merah dan serai yang segar. Rasa pedas dan harum yang khas Bali.",
      price: 22000,
      stock: 55,
      weight: 150,
      images: ["/uploads/sambal-matah.jpg"],
      categoryId: createdCategories[7].id,
      slug: "sambal-matah-bali-original",
      isActive: true,
    },
    {
      name: "Sambal Roa Manado",
      description:
        "Sambal roa khas Manado dengan ikan roa asli yang memberikan cita rasa umami yang khas dan pedas yang nikmat.",
      price: 28000,
      stock: 45,
      weight: 120,
      images: ["/uploads/sambal-roa.jpg"],
      categoryId: createdCategories[7].id,
      slug: "sambal-roa-manado",
      isActive: true,
    },
  ];

  for (const product of products) {
    const { images, ...productData } = product;
    const createdProduct = await prisma.product.create({ 
      data: {
        ...productData,
        images: {
          create: images.map(url => ({ url }))
        }
      }
    });
  }

  console.log("🛍️ Products created");

  // Create sample orders
  const product1 = await prisma.product.findFirst({
    where: { slug: "rendang-daging-sapi-kering-premium" },
  });
  const product2 = await prisma.product.findFirst({
    where: { slug: "keripik-pisang-aneka-rasa-premium" },
  });
  const product3 = await prisma.product.findFirst({
    where: { slug: "kopi-luwak-arabica-premium" },
  });

  if (product1 && product2 && product3) {
    // Order 1 - Completed
    const order1 = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-AB123`,
        userId: customer1.id,
        totalAmount: 485000,
        shippingAddress:
          "Jl. Merdeka No. 45, Jakarta Selatan, DKI Jakarta 12345",
        notes: "Tolong kirim siang hari ya, terima kasih",
        bankAccount: "BCA - 1234567890 (Toko Oleh-Oleh)",
        status: "DELIVERED",
        paymentStatus: "VERIFIED",
        paymentProof: "/uploads/payment-proof-1.jpg",
        orderItems: {
          create: [
            {
              productId: product1.id,
              quantity: 2,
              price: 125000,
            },
            {
              productId: product2.id,
              quantity: 3,
              price: 35000,
            },
            {
              productId: product3.id,
              quantity: 1,
              price: 350000,
            },
          ],
        },
      },
    });

    // Order 2 - Pending Payment
    const order2 = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-CD456`,
        userId: customer2.id,
        totalAmount: 160000,
        shippingAddress: "Jl. Sudirman No. 67, Bandung, Jawa Barat 40123",
        notes: "Mohon dikemas dengan baik",
        bankAccount: "Mandiri - 0987654321 (Toko Oleh-Oleh)",
        status: "PENDING",
        paymentStatus: "PENDING",
        orderItems: {
          create: [
            {
              productId: product1.id,
              quantity: 1,
              price: 125000,
            },
            {
              productId: product2.id,
              quantity: 1,
              price: 35000,
            },
          ],
        },
      },
    });

    // Order 3 - Processing
    const order3 = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-EF789`,
        userId: customer1.id,
        totalAmount: 105000,
        shippingAddress:
          "Jl. Merdeka No. 45, Jakarta Selatan, DKI Jakarta 12345",
        notes: "",
        bankAccount: "BRI - 5678901234 (Toko Oleh-Oleh)",
        status: "PROCESSING",
        paymentStatus: "VERIFIED",
        paymentProof: "/uploads/payment-proof-2.jpg",
        orderItems: {
          create: [
            {
              productId: product2.id,
              quantity: 3,
              price: 35000,
            },
          ],
        },
      },
    });

    console.log("📦 Sample orders created");
  }

  // Add some cart items for customers
  if (product1 && product2) {
    await prisma.cartItem.create({
      data: {
        userId: customer2.id,
        productId: product2.id,
        quantity: 2,
      },
    });

    await prisma.cartItem.create({
      data: {
        userId: customer2.id,
        productId: product1.id,
        quantity: 1,
      },
    });

    console.log("🛒 Sample cart items created");
  }

  console.log("✅ Seeding completed successfully!");
  console.log(`
📊 Database seeded with:
- 3 users (1 admin & 2 customers)
- 8 categories
- 4 bank accounts
- 25+ products
- 3 sample orders with different statuses
- 2 cart items

🔐 Login credentials:
Admin: admin@tokooleholeh.com / admin123
Customer 1: customer@example.com / customer123  
Customer 2: siti@example.com / customer123

🎯 Test scenarios:
- Customer 1 has completed orders and order history
- Customer 2 has pending order and items in cart
- All order statuses are represented (delivered, pending, processing)
- Products cover all categories with realistic data
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
