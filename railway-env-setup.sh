#!/bin/bash

# Railway Environment Variables Setup
echo "Setting up Railway environment variables..."

# Database URL - akan menggunakan MySQL dari Railway
railway variables --set DATABASE_URL='${{MySQL.MYSQL_PUBLIC_URL}}'

# NextAuth Configuration
railway variables --set NEXTAUTH_SECRET="sWVHHmzZRcKlUFjqwSOBYcRrNNXv/jRdAI0ZrTf5/ko="
railway variables --set NEXTAUTH_URL="https://toko-oleh-oleh-production.up.railway.app"

# Node Environment
railway variables --set NODE_ENV="production"

# UploadThing Configuration (perlu diisi dengan real values)
railway variables --set UPLOADTHING_TOKEN="your_uploadthing_token_here"
railway variables --set UPLOADTHING_SECRET="your_uploadthing_secret_here"
railway variables --set UPLOADTHING_APP_ID="your_uploadthing_app_id_here"

# Security & Performance
railway variables --set SECURE_COOKIES="true"
railway variables --set TRUSTED_ORIGINS="https://toko-oleh-oleh-production.up.railway.app/"

# Rate Limiting
railway variables --set RATE_LIMIT_ENABLED="true"
railway variables --set RATE_LIMIT_MAX_REQUESTS="100"
railway variables --set RATE_LIMIT_WINDOW_MS="900000"

# Logging
railway variables --set LOG_LEVEL="info"
railway variables --set ENABLE_ANALYTICS="true"

# SMTP Configuration
railway variables --set SMTP_HOST="smtp.gmail.com"
railway variables --set SMTP_PORT="587"
railway variables --set SMTP_USER="yasun.studio@gmail.com"
railway variables --set SMTP_PASS="your_email_password_here"
railway variables --set SMTP_FROM="Toko Oleh-Oleh <noreply@your-domain.com>"

# Business Configuration
railway variables --set STORE_NAME="Toko Oleh-Oleh Nusantara"
railway variables --set STORE_DESCRIPTION="Menyediakan berbagai oleh-oleh khas Indonesia"
railway variables --set STORE_EMAIL="info@toko-oleh-oleh.com"
railway variables --set STORE_PHONE="+62-812-1386-5722"

# Payment Settings
railway variables --set MIN_ORDER_AMOUNT="25000"
railway variables --set SHIPPING_COST="15000"
railway variables --set FREE_SHIPPING_THRESHOLD="100000"

# File Upload Settings
railway variables --set MAX_FILE_SIZE="5242880"
railway variables --set STATIC_FILES_URL="/uploads"

echo "Environment variables setup completed!"
echo "Please update UploadThing and email credentials manually."
