#!/bin/bash

echo "🚀 Setting up Toko Oleh-Oleh Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Setup database
echo "🗄️ Setting up database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Check if database is running
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name initial_migration

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads
mkdir -p public/uploads/categories
mkdir -p public/uploads/products
mkdir -p public/uploads/payments

# Create placeholder images
echo "🖼️ Creating placeholder images..."
curl -s "https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=Category" -o public/placeholder-category.jpg
curl -s "https://via.placeholder.com/400x400/E5E7EB/9CA3AF?text=Product" -o public/placeholder.jpg

# Install additional development tools
echo "🛠️ Installing development tools..."
npm install -D @types/node

echo ""
echo "✅ Setup completed successfully!"
echo "=================================================="
echo ""
echo "🎉 Your Toko Oleh-Oleh application is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your actual values"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔐 Login credentials:"
echo "├── Admin: admin@tokooleholeh.com / admin123"
echo "├── Customer 1: customer@example.com / customer123"
echo "└── Customer 2: siti@example.com / customer123"
echo ""
echo "🔧 Useful commands:"
echo "├── npm run dev          - Start development server"
echo "├── npm run db:studio    - Open Prisma Studio"
echo "├── npm run db:reset     - Reset database and reseed"
echo "└── docker-compose logs  - View database logs"
echo ""
echo "📚 Features included:"
echo "├── ✅ Complete authentication system"
echo "├── ✅ Product catalog with categories"
echo "├── ✅ Shopping cart functionality"
echo "├── ✅ Order management system"
echo "├── ✅ Payment upload system"
echo "├── ✅ Admin dashboard"
echo "└── ✅ Responsive design"
echo ""
echo "Happy coding! 🚀"