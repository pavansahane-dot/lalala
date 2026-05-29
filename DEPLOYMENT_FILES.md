# 📦 Azure Deployment Files

## Overview

This directory contains all files needed to deploy your VPN application to Microsoft Azure.

## Files Created

### Configuration Files

- **`.env.azure`** - Template for Azure environment variables
- **`.gitignore`** - Updated to exclude sensitive files
- **`docker-compose.azure.yml`** - Docker Compose for Azure deployment

### Dockerfiles

- **`backend/Dockerfile`** - Backend container image
- **`frontend/Dockerfile`** - Frontend container image with Nginx
- **`backend/.dockerignore`** - Excludes unnecessary files from backend image
- **`frontend/.dockerignore`** - Excludes unnecessary files from frontend image
- **`frontend/nginx.conf`** - Nginx configuration for SPA routing

### Deployment Scripts

- **`azure-deploy.ps1`** - Automated deployment script (Windows PowerShell)
- **`azure-deploy.sh`** - Automated deployment script (Linux/Mac Bash)
- **`setup-azure-env.js`** - Environment setup and validation script
- **`health-check.js`** - Post-deployment health check script

### CI/CD

- **`.github/workflows/azure-deploy.yml`** - GitHub Actions workflow for automated deployments

### Documentation

- **`AZURE_DEPLOYMENT.md`** - Comprehensive deployment guide
- **`QUICKSTART_AZURE.md`** - Quick start guide (15 minutes)
- **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist
- **`DEPLOYMENT_FILES.md`** - This file

## Quick Start

### 1. Setup Environment
```bash
# Copy template
copy .env.azure .env

# Generate secrets
node setup-azure-env.js

# Edit .env with your values
```

### 2. Deploy to Azure
```powershell
# Windows
.\azure-deploy.ps1

# Linux/Mac
chmod +x azure-deploy.sh
./azure-deploy.sh
```

### 3. Verify Deployment
```bash
node health-check.js
```

## Architecture

```
┌─────────────────────────────────────────────┐
│         Azure Resource Group                │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │  Web App     │      │  Container      │ │
│  │  (Frontend)  │◄─────┤  Registry (ACR) │ │
│  └──────────────┘      └─────────────────┘ │
│         │                                   │
│         ▼                                   │
│  ┌──────────────┐                          │
│  │  Web App     │                          │
│  │  (Backend)   │                          │
│  └──────────────┘                          │
│         │                                   │
│    ┌────┴────┐                             │
│    ▼         ▼                             │
│  ┌────┐   ┌──────┐                        │
│  │ DB │   │Redis │                        │
│  └────┘   └──────┘                        │
└─────────────────────────────────────────────┘
```

## Resources Created

1. **Resource Group** - Container for all resources
2. **Container Registry** - Stores Docker images
3. **App Service Plan** - Compute resources
4. **Web Apps** - Frontend and backend applications
5. **PostgreSQL** - Database server
6. **Redis Cache** - Session and caching

## Cost Breakdown

**Basic Tier (~$107/month):**
- App Service Plan (B2): $70/month
- PostgreSQL (Burstable B1ms): $15/month
- Redis Cache (Basic C0): $17/month
- Container Registry (Basic): $5/month

**Free Tier (First 12 months):**
- App Service (F1): Free
- PostgreSQL: Free for 12 months
- Redis: Free for 12 months
- Total: ~$5/month (only ACR)

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NODE_ENV` - Set to "production"

### Optional (Features)
- `GMAIL_USER` - Email notifications
- `GMAIL_APP_PASSWORD` - Gmail app password
- `TWILIO_*` - SMS notifications
- `STRIPE_*` - Payment processing
- `GOOGLE_CLIENT_ID` - OAuth login
- `GOOGLE_CLIENT_SECRET` - OAuth secret

## Deployment Methods

### Method 1: Automated Script (Recommended)
- Run `azure-deploy.ps1` or `azure-deploy.sh`
- Creates all resources automatically
- Takes ~15 minutes

### Method 2: Manual Deployment
- Follow `AZURE_DEPLOYMENT.md`
- Step-by-step Azure CLI commands
- More control over configuration

### Method 3: GitHub Actions
- Push to main branch
- Automatic deployment via CI/CD
- Requires GitHub secrets configuration

## Post-Deployment

1. **Run Migrations**
   ```bash
   az webapp ssh --resource-group vpn-app-rg --name vpn-app-web
   npx prisma migrate deploy
   ```

2. **Create Admin User**
   ```bash
   node create-admin.js
   ```

3. **Configure Custom Domain** (Optional)
   - Add domain in Azure Portal
   - Configure DNS records
   - Enable SSL certificate

4. **Setup Monitoring**
   - Enable Application Insights
   - Configure alerts
   - Review logs

## Troubleshooting

### Deployment Fails
```bash
# Check Azure CLI version
az --version

# Re-login
az logout
az login

# Check resource group
az group show --name vpn-app-rg
```

### Container Won't Start
```bash
# View logs
az webapp log tail --resource-group vpn-app-rg --name vpn-app-web

# Restart app
az webapp restart --resource-group vpn-app-rg --name vpn-app-web
```

### Database Connection Error
```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --rule-name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Cleanup

To delete all Azure resources:
```bash
az group delete --name vpn-app-rg --yes --no-wait
```

## Support

- **Azure Documentation**: https://docs.microsoft.com/azure/
- **Azure Support**: https://azure.microsoft.com/support/
- **Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/

## Next Steps

1. ✅ Deploy to Azure
2. ✅ Configure custom domain
3. ✅ Enable SSL/HTTPS
4. ✅ Setup monitoring
5. ✅ Configure backups
6. ✅ Optimize performance
7. ✅ Setup staging environment

---

**Last Updated:** 2024
**Version:** 1.0.0
