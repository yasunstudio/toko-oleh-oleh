#!/bin/bash

# Railway Database Deployment Script
# This script will deploy database schema and seed data to Railway

echo "🚀 Starting Railway Database Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Link to Railway project
echo "🔗 Linking to Railway project..."
railway link

# Deploy database migrations to Railway
echo "📊 Deploying database migrations..."
railway run prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
railway run prisma generate

# Seed the database with initial data
echo "🌱 Seeding database with initial data..."
railway run npm run db:seed

# Seed hero slides
echo "🎨 Seeding hero slides..."
railway run npm run seed-hero

echo "✅ Railway database deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check Railway dashboard to verify database tables"
echo "2. Test the production application"
echo "3. Verify admin login works in production"
echo ""
echo "🔑 Admin credentials:"
echo "Email: admin@tokooleholeh.com"
echo "Password: admin123"
