# Azure Deployment Script for VPN Application (PowerShell)
# Prerequisites: Azure CLI installed and logged in

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Azure Deployment..." -ForegroundColor Cyan

# Configuration
$RESOURCE_GROUP = "vpn-app-rg"
$LOCATION = "eastus"
$ACR_NAME = "vpnappregistry"
$APP_SERVICE_PLAN = "vpn-app-plan"
$WEBAPP_NAME = "vpn-app-web"
$POSTGRES_SERVER = "vpn-postgres-server"
$REDIS_NAME = "vpn-redis-cache"

Write-Host "Step 1: Creating Resource Group..." -ForegroundColor Blue
az group create --name $RESOURCE_GROUP --location $LOCATION

Write-Host "Step 2: Creating Azure Container Registry..." -ForegroundColor Blue
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

Write-Host "Step 3: Building and Pushing Docker Images..." -ForegroundColor Blue
az acr build --registry $ACR_NAME --image vpn-backend:latest ./backend
az acr build --registry $ACR_NAME --image vpn-frontend:latest ./frontend

Write-Host "Step 4: Creating PostgreSQL Database..." -ForegroundColor Blue
az postgres flexible-server create `
  --resource-group $RESOURCE_GROUP `
  --name $POSTGRES_SERVER `
  --location $LOCATION `
  --admin-user vpnadmin `
  --admin-password "YourSecurePassword123!" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 14

az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $POSTGRES_SERVER `
  --database-name vpndb

Write-Host "Step 5: Creating Redis Cache..." -ForegroundColor Blue
az redis create `
  --resource-group $RESOURCE_GROUP `
  --name $REDIS_NAME `
  --location $LOCATION `
  --sku Basic `
  --vm-size c0

Write-Host "Step 6: Creating App Service Plan..." -ForegroundColor Blue
az appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B2

Write-Host "Step 7: Creating Web App..." -ForegroundColor Blue
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $WEBAPP_NAME `
  --deployment-container-image-name "$ACR_NAME.azurecr.io/vpn-frontend:latest"

Write-Host "Step 8: Configuring Web App Settings..." -ForegroundColor Blue
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEBAPP_NAME `
  --settings `
    DATABASE_URL="postgresql://vpnadmin@$POSTGRES_SERVER:YourSecurePassword123!@$POSTGRES_SERVER.postgres.database.azure.com:5432/vpndb?sslmode=require" `
    REDIS_URL="redis://$REDIS_NAME.redis.cache.windows.net:6379" `
    NODE_ENV="production"

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Web App URL: https://$WEBAPP_NAME.azurewebsites.net" -ForegroundColor Green
