# Azure Deployment Script for VPN Application (PowerShell)
# Modified to use full Azure CLI path

$ErrorActionPreference = "Stop"

# Azure CLI path
$AZ_CLI = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

Write-Host "🚀 Starting Azure Deployment..." -ForegroundColor Cyan

# Configuration
$RESOURCE_GROUP = "vpn-app-rg"
$LOCATION = "eastus"
$ACR_NAME = "vpnappregistry"
$APP_SERVICE_PLAN = "vpn-app-plan"
$WEBAPP_NAME = "vpn-app-web"
$POSTGRES_SERVER = "vpn-postgres-server"
$REDIS_NAME = "vpn-redis-cache"

Write-Host "Step 0: Verifying Azure CLI..." -ForegroundColor Blue
if (!(Test-Path $AZ_CLI)) {
    Write-Host "❌ Azure CLI not found at: $AZ_CLI" -ForegroundColor Red
    Write-Host "Please install Azure CLI first" -ForegroundColor Red
    exit 1
}

Write-Host "Step 0.1: Checking Azure login..." -ForegroundColor Blue
& $AZ_CLI account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Azure. Please run: az-cli.bat login" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Creating Resource Group..." -ForegroundColor Blue
& $AZ_CLI group create --name $RESOURCE_GROUP --location $LOCATION

Write-Host "Step 2: Creating Azure Container Registry..." -ForegroundColor Blue
& $AZ_CLI acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

Write-Host "Step 3: Building and Pushing Docker Images..." -ForegroundColor Blue
Write-Host "  Building backend image..." -ForegroundColor Yellow
& $AZ_CLI acr build --registry $ACR_NAME --image vpn-backend:latest ./backend

Write-Host "  Building frontend image..." -ForegroundColor Yellow
& $AZ_CLI acr build --registry $ACR_NAME --image vpn-frontend:latest ./frontend

Write-Host "Step 4: Creating PostgreSQL Database..." -ForegroundColor Blue
& $AZ_CLI postgres flexible-server create `
  --resource-group $RESOURCE_GROUP `
  --name $POSTGRES_SERVER `
  --location $LOCATION `
  --admin-user vpnadmin `
  --admin-password "VpnSecure2024!" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 14 `
  --yes

& $AZ_CLI postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $POSTGRES_SERVER `
  --database-name vpndb

Write-Host "Step 5: Creating Redis Cache..." -ForegroundColor Blue
& $AZ_CLI redis create `
  --resource-group $RESOURCE_GROUP `
  --name $REDIS_NAME `
  --location $LOCATION `
  --sku Basic `
  --vm-size c0

Write-Host "Step 6: Creating App Service Plan..." -ForegroundColor Blue
& $AZ_CLI appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B2

Write-Host "Step 7: Creating Web App..." -ForegroundColor Blue
& $AZ_CLI webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $WEBAPP_NAME `
  --deployment-container-image-name "$ACR_NAME.azurecr.io/vpn-frontend:latest"

Write-Host "Step 8: Configuring Web App Settings..." -ForegroundColor Blue

# Get PostgreSQL and Redis connection strings
$POSTGRES_HOST = & $AZ_CLI postgres flexible-server show --resource-group $RESOURCE_GROUP --name $POSTGRES_SERVER --query fullyQualifiedDomainName -o tsv
$REDIS_KEY = & $AZ_CLI redis list-keys --resource-group $RESOURCE_GROUP --name $REDIS_NAME --query primaryKey -o tsv

# Read JWT secrets from .env file
$JWT_SECRET = "your_jwt_secret_here"
$JWT_REFRESH_SECRET = "your_jwt_refresh_secret_here"

if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "^JWT_SECRET=(.+)$") {
            $JWT_SECRET = $matches[1]
        }
        if ($line -match "^JWT_REFRESH_SECRET=(.+)$") {
            $JWT_REFRESH_SECRET = $matches[1]
        }
    }
}

& $AZ_CLI webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEBAPP_NAME `
  --settings `
    DATABASE_URL="postgresql://vpnadmin:VpnSecure2024!@$POSTGRES_HOST:5432/vpndb?sslmode=require" `
    REDIS_URL="rediss://:$REDIS_KEY@$REDIS_NAME.redis.cache.windows.net:6380" `
    NODE_ENV="production" `
    JWT_SECRET="$JWT_SECRET" `
    JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" `
    APP_URL="https://$WEBAPP_NAME.azurewebsites.net" `
    API_URL="https://$WEBAPP_NAME.azurewebsites.net/api"

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Web App URL: https://$WEBAPP_NAME.azurewebsites.net" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run database migrations:" -ForegroundColor Yellow
Write-Host "   az-cli.bat webapp ssh --resource-group $RESOURCE_GROUP --name $WEBAPP_NAME" -ForegroundColor Cyan
Write-Host "   Then inside container: npx prisma migrate deploy" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Create admin user:" -ForegroundColor Yellow
Write-Host "   node create-admin.js" -ForegroundColor Cyan
