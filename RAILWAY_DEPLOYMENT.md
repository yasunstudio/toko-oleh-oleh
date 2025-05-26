# Railway Deployment Guide for Toko Oleh-Oleh

## 🚀 Deployment to Railway with MySQL

This guide will help you deploy your Next.js e-commerce application to Railway with MySQL database.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your project should be pushed to GitHub
3. **UploadThing Account**: For image uploads (optional)

### Step 1: Create New Project on Railway

1. Login to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `toko-oleh-oleh` repository

### Step 2: Add MySQL Database

1. In your Railway project dashboard
2. Click "New Service" → "Database" → "Add MySQL"
3. Railway will automatically provision a MySQL database
4. Note the connection details provided

### Step 3: Environment Variables

Add these environment variables in Railway Dashboard:

#### Database Configuration
```
DATABASE_URL=${{MySQL.DATABASE_URL}}
```

#### NextAuth Configuration
```
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=https://your-app-name.railway.app
```

#### UploadThing Configuration (Optional)
```
UPLOADTHING_TOKEN=your_uploadthing_token_here
UPLOADTHING_SECRET=your_uploadthing_secret_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here
```

#### Security & Performance
```
SECURE_COOKIES=true
TRUSTED_ORIGINS=https://your-app-name.railway.app
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

#### Business Configuration
```
STORE_NAME=Toko Oleh-Oleh Nusantara
STORE_DESCRIPTION=Menyediakan berbagai oleh-oleh khas Indonesia
STORE_EMAIL=info@toko-oleh-oleh.com
STORE_PHONE=+62-812-1386-5722
MIN_ORDER_AMOUNT=25000
SHIPPING_COST=15000
FREE_SHIPPING_THRESHOLD=100000
```

### Step 4: Database Migration

Railway will automatically run `npm run build` which includes Prisma migration.

The `package.json` already includes the Railway deployment script:
```json
{
  "scripts": {
    "railway:deploy": "prisma generate && prisma db push && npm run build"
  }
}
```

### Step 5: Configure Domain (Optional)

1. In Railway Dashboard, go to your app service
2. Go to "Settings" → "Networking"
3. Configure custom domain or use Railway's provided domain

### Step 6: Health Check

The application includes a health check endpoint at `/api/health` for monitoring.

### Deployment Process

1. **Automatic**: Push to main branch triggers automatic deployment
2. **Manual**: Use Railway Dashboard to trigger manual deployment

### Configuration Files

- `railway.toml`: Railway service configuration
- `.env.production`: Production environment template
- `.env.railway`: Railway-specific environment template

### Database Seeding

After first deployment, you can seed the database:

```bash
# Run in Railway console or locally with production DATABASE_URL
npx prisma db seed
```

### Monitoring

- **Health Check**: `GET /api/health`
- **Railway Logs**: Available in Railway Dashboard
- **Database**: Monitor through Railway MySQL service

### Troubleshooting

1. **Build Failures**: Check Railway logs for detailed error messages
2. **Database Issues**: Verify DATABASE_URL and run migrations
3. **Environment Variables**: Ensure all required variables are set
4. **UploadThing**: Configure file upload settings if using image uploads

### Security Notes

- Never commit real API keys to repository
- Use Railway's environment variables for all secrets
- Enable CORS and security headers for production
- Configure rate limiting for API endpoints

### File Upload Configuration

If using UploadThing for image uploads:

1. Create account at [uploadthing.com](https://uploadthing.com)
2. Get your API keys
3. Add to Railway environment variables
4. Configure file size limits in environment

### Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Next.js Deployment: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- Prisma with Railway: [prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway](https://prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

---

## Quick Deployment Checklist

- [ ] Railway project created
- [ ] MySQL database added
- [ ] Environment variables configured
- [ ] GitHub repository connected
- [ ] First deployment successful
- [ ] Database migrated
- [ ] Health check endpoint working
- [ ] Domain configured (optional)
- [ ] File uploads working (if using UploadThing)

Your e-commerce application should now be live on Railway! 🎉
