#!/bin/bash

# Railway Production Database Setup Script
echo "🚀 Setting up Railway Production Database..."

# Get the DATABASE_URL from Railway
echo "📊 Getting database connection details..."
DATABASE_URL=$(railway run env | grep DATABASE_URL | cut -d'=' -f2-)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found. Please check Railway configuration."
    exit 1
fi

echo "✅ Database URL found"

# Set DATABASE_URL temporarily for this session
export DATABASE_URL="$DATABASE_URL"

# Run Prisma migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed the database
echo "🌱 Seeding database with initial data..."
npx tsx prisma/seed.ts

if [ $? -eq 0 ]; then
    echo "✅ Database seeding completed"
else
    echo "❌ Database seeding failed"
fi

# Seed hero slides
echo "🎨 Adding hero slides..."
npx tsx prisma/seed-hero-slides.ts

echo "🎉 Railway database setup completed!"
echo ""
echo "🔗 Application URL: https://scintillating-courage-production-6c8e.up.railway.app"
echo "🔑 Admin login: admin@tokooleholeh.com / admin123"
