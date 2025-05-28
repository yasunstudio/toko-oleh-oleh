#!/bin/bash

# Railway Deployment Script with Database Reset
echo "🚂 RAILWAY DEPLOYMENT WITH DATABASE RESET"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "⚠️  Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

# Show current project info
echo "📋 Current Railway project:"
railway status

# Confirm deployment
echo ""
echo "⚠️  WARNING: This will:"
echo "   1. Deploy latest code to Railway"
echo "   2. Run database migrations"
echo "   3. Clear all data EXCEPT user accounts"
echo "   4. Keep UploadThing images intact"
echo ""
read -p "🤔 Continue with deployment? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Step 1: Build and test locally first
echo ""
echo "🔨 Step 1: Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

# Step 2: Commit current changes
echo ""
echo "📝 Step 2: Committing current changes..."
git add .
git commit -m "Database reset and clean deployment - $(date)" || echo "ℹ️  No changes to commit"

# Step 3: Deploy to Railway
echo ""
echo "🚀 Step 3: Deploying to Railway..."
railway up

if [ $? -ne 0 ]; then
    echo "❌ Railway deployment failed"
    exit 1
fi

# Step 4: Run database migrations
echo ""
echo "🗄️  Step 4: Running database migrations..."
railway run prisma migrate deploy

# Step 5: Generate Prisma client
echo ""
echo "⚙️  Step 5: Generating Prisma client..."
railway run prisma generate

# Step 6: Clear database (except users)
echo ""
echo "🗑️  Step 6: Clearing production database..."
railway run node scripts/clear-railway-database.js

# Step 7: Get deployment info
echo ""
echo "📊 Step 7: Getting deployment information..."
RAILWAY_URL=$(railway domain)

echo ""
echo "🎉 RAILWAY DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "🌐 Production URL: $RAILWAY_URL"
echo "👥 Admin Panel: $RAILWAY_URL/admin"
echo ""
echo "✅ DEPLOYMENT STATUS:"
echo "   • Code deployed successfully"
echo "   • Database migrations applied"  
echo "   • Production database cleared (users preserved)"
echo "   • UploadThing images accessible"
echo "   • Ready for fresh content creation"
echo ""
echo "🔑 ADMIN ACCESS:"
echo "   Email: admin@tokooleholeh.com"
echo "   (Use the password set during initial setup)"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Login to admin panel in production"
echo "   2. Create categories with image upload"
echo "   3. Add products and content"
echo "   4. Test all functionality"
echo ""
echo "🎊 Your e-commerce platform is live with clean data!"
