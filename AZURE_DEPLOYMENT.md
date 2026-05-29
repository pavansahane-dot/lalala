# 🚀 Azure Deployment Guide

## Prerequisites

1. **Azure Account** - [Sign up](https://azure.microsoft.com/free/)
2. **Azure CLI** - [Install](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Docker Desktop** - [Install](https://www.docker.com/products/docker-desktop)

## Deployment Options

### Option 1: Automated Deployment (Recommended)

**Windows:**
```powershell
# Login to Azure
az login

# Run deployment script
.\azure-deploy.ps1
```

**Linux/Mac:**
```bash
# Login to Azure
az login

# Make script executable
chmod +x azure-deploy.sh

# Run deployment script
./azure-deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Create Resource Group
```bash
az group create --name vpn-app-rg --location eastus
```

#### Step 2: Create Container Registry
```bash
az acr create --resource-group vpn-app-rg --name vpnappregistry --sku Basic --admin-enabled true
```

#### Step 3: Build & Push Images
```bash
# Login to ACR
az acr login --name vpnappregistry

# Build and push backend
cd backend
docker build -t vpnappregistry.azurecr.io/vpn-backend:latest .
docker push vpnappregistry.azurecr.io/vpn-backend:latest

# Build and push frontend
cd ../frontend
docker build -t vpnappregistry.azurecr.io/vpn-frontend:latest .
docker push vpnappregistry.azurecr.io/vpn-frontend:latest
```

#### Step 4: Create PostgreSQL Database
```bash
az postgres flexible-server create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --location eastus \
  --admin-user vpnadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14

az postgres flexible-server db create \
  --resource-group vpn-app-rg \
  --server-name vpn-postgres-server \
  --database-name vpndb
```

#### Step 5: Create Redis Cache
```bash
az redis create \
  --resource-group vpn-app-rg \
  --name vpn-redis-cache \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

#### Step 6: Create App Service
```bash
# Create App Service Plan
az appservice plan create \
  --name vpn-app-plan \
  --resource-group vpn-app-rg \
  --is-linux \
  --sku B2

# Create Web App for Backend
az webapp create \
  --resource-group vpn-app-rg \
  --plan vpn-app-plan \
  --name vpn-backend-api \
  --deployment-container-image-name vpnappregistry.azurecr.io/vpn-backend:latest

# Create Web App for Frontend
az webapp create \
  --resource-group vpn-app-rg \
  --plan vpn-app-plan \
  --name vpn-frontend-web \
  --deployment-container-image-name vpnappregistry.azurecr.io/vpn-frontend:latest
```

#### Step 7: Configure Environment Variables
```bash
# Get PostgreSQL connection string
POSTGRES_HOST=$(az postgres flexible-server show --resource-group vpn-app-rg --name vpn-postgres-server --query fullyQualifiedDomainName -o tsv)

# Get Redis connection string
REDIS_KEY=$(az redis list-keys --resource-group vpn-app-rg --name vpn-redis-cache --query primaryKey -o tsv)

# Configure backend
az webapp config appsettings set \
  --resource-group vpn-app-rg \
  --name vpn-backend-api \
  --settings \
    DATABASE_URL="postgresql://vpnadmin:YourSecurePassword123!@$POSTGRES_HOST:5432/vpndb?sslmode=require" \
    REDIS_URL="rediss://:$REDIS_KEY@vpn-redis-cache.redis.cache.windows.net:6380" \
    NODE_ENV="production" \
    JWT_SECRET="your-generated-secret" \
    JWT_REFRESH_SECRET="your-generated-refresh-secret"
```

#### Step 8: Run Database Migrations
```bash
# SSH into backend container
az webapp ssh --resource-group vpn-app-rg --name vpn-backend-api

# Run Prisma migrations
npx prisma migrate deploy
npx prisma db seed
```

## Option 3: Azure Container Instances (Simpler)

```bash
# Create container group
az container create \
  --resource-group vpn-app-rg \
  --name vpn-app-containers \
  --image vpnappregistry.azurecr.io/vpn-backend:latest \
  --dns-name-label vpn-app-unique \
  --ports 5000 80 \
  --environment-variables \
    NODE_ENV=production \
    DATABASE_URL="your-connection-string"
```

## Post-Deployment Steps

### 1. Configure Custom Domain
```bash
# Add custom domain
az webapp config hostname add \
  --resource-group vpn-app-rg \
  --webapp-name vpn-frontend-web \
  --hostname yourdomain.com

# Enable HTTPS
az webapp config ssl bind \
  --resource-group vpn-app-rg \
  --name vpn-frontend-web \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

### 2. Enable Application Insights
```bash
az monitor app-insights component create \
  --app vpn-app-insights \
  --location eastus \
  --resource-group vpn-app-rg

# Link to Web App
az webapp config appsettings set \
  --resource-group vpn-app-rg \
  --name vpn-backend-api \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key"
```

### 3. Setup Continuous Deployment
```bash
# Enable CI/CD from GitHub
az webapp deployment source config \
  --name vpn-backend-api \
  --resource-group vpn-app-rg \
  --repo-url https://github.com/yourusername/vpn-app \
  --branch main \
  --manual-integration
```

## Environment Variables Checklist

Copy `.env.azure` to `.env` and fill in:

- [ ] DATABASE_URL (from Azure PostgreSQL)
- [ ] REDIS_URL (from Azure Redis)
- [ ] JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
- [ ] JWT_REFRESH_SECRET
- [ ] GMAIL_USER & GMAIL_APP_PASSWORD
- [ ] TWILIO credentials
- [ ] STRIPE keys
- [ ] GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
- [ ] WG_SERVER_IP (Azure VM public IP)

## Cost Estimation

**Monthly costs (approximate):**
- App Service Plan (B2): $70
- PostgreSQL (Burstable B1ms): $15
- Redis Cache (Basic C0): $17
- Container Registry (Basic): $5
- **Total: ~$107/month**

## Monitoring & Logs

```bash
# View logs
az webapp log tail --resource-group vpn-app-rg --name vpn-backend-api

# Enable logging
az webapp log config \
  --resource-group vpn-app-rg \
  --name vpn-backend-api \
  --docker-container-logging filesystem
```

## Troubleshooting

**Container won't start:**
```bash
# Check logs
az webapp log tail --resource-group vpn-app-rg --name vpn-backend-api

# Restart app
az webapp restart --resource-group vpn-app-rg --name vpn-backend-api
```

**Database connection issues:**
```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Cleanup

```bash
# Delete all resources
az group delete --name vpn-app-rg --yes --no-wait
```

## Next Steps

1. Configure custom domain
2. Enable SSL/TLS
3. Setup monitoring alerts
4. Configure backup policies
5. Implement auto-scaling
6. Setup staging environment

## Support

- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Azure Support](https://azure.microsoft.com/support/)
