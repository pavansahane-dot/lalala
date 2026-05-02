#!/bin/bash

# ZeroTraceVPN Deployment Script for Azure Ubuntu Server
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting ZeroTraceVPN Deployment..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$HOME/ZeroTraceVPN"
WEB_ROOT="/var/www/vpn-app"

# Check if running on server
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project directory not found at $PROJECT_DIR${NC}"
    echo "Please clone the repository first:"
    echo "git clone https://github.com/pavansahane-dot/ZeroTraceVPN.git"
    exit 1
fi

cd "$PROJECT_DIR"

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from GitHub...${NC}"
git pull origin main || git pull origin master

# Backend Deployment
echo -e "${YELLOW}🔧 Deploying Backend...${NC}"
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file from .env.production template"
    exit 1
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install --production

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Restart backend with PM2
echo "Restarting backend service..."
if pm2 describe vpn-backend > /dev/null 2>&1; then
    pm2 restart vpn-backend
else
    pm2 start server.js --name vpn-backend
    pm2 save
fi

# Frontend Deployment
echo -e "${YELLOW}🎨 Building and Deploying Frontend...${NC}"
cd ../frontend

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Warning: .env.production not found, using defaults${NC}"
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build for production
echo "Building frontend..."
npm run build

# Deploy to web root
echo "Deploying to $WEB_ROOT..."
sudo rm -rf $WEB_ROOT/*
sudo cp -r dist/* $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

# Show status
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "========================================"
echo "Backend Status:"
pm2 status vpn-backend
echo ""
echo "Recent Backend Logs:"
pm2 logs vpn-backend --lines 10 --nostream
echo ""
echo -e "${GREEN}🌐 Application is live!${NC}"
echo "Frontend: https://yourdomain.com"
echo "Backend API: https://yourdomain.com/api/health"
