# Simplified Azure Deployment for Azure for Students
# Uses Central India region and Web App for Containers

$ErrorActionPreference = "Stop"
$AZ_CLI = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

Write-Host "🚀 Azure for Students Deployment" -ForegroundColor Cyan
Write-Host "Region: Central India" -ForegroundColor Yellow
Write-Host ""

# Configuration
$RESOURCE_GROUP = "vpn-app-rg"
$LOCATION = "centralindia"
$APP_SERVICE_PLAN = "vpn-app-plan"
$WEBAPP_BACKEND = "vpn-backend-api"
$WEBAPP_FRONTEND = "vpn-frontend-web"

# Generate unique names
$TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
$UNIQUE_SUFFIX = $TIMESTAMP.Substring($TIMESTAMP.Length - 6)

Write-Host "Step 1: Creating Resource Group..." -ForegroundColor Blue
& $AZ_CLI group create --name $RESOURCE_GROUP --location $LOCATION

Write-Host ""
Write-Host "Step 2: Creating App Service Plan (Free Tier)..." -ForegroundColor Blue
& $AZ_CLI appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --is-linux `
  --sku F1

Write-Host ""
Write-Host "Step 3: Creating Backend Web App (Node.js)..." -ForegroundColor Blue
& $AZ_CLI webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name "$WEBAPP_BACKEND-$UNIQUE_SUFFIX" `
  --runtime "NODE:18-lts"

Write-Host ""
Write-Host "Step 4: Creating Frontend Web App (Node.js)..." -ForegroundColor Blue
& $AZ_CLI webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name "$WEBAPP_FRONTEND-$UNIQUE_SUFFIX" `
  --runtime "NODE:18-lts"

Write-Host ""
Write-Host "Step 5: Configuring Backend App Settings..." -ForegroundColor Blue

# Read JWT secrets from .env
$JWT_SECRET = "1TXwWoZDNxvlzhBXNd88pQxoxRgcYuKNDJfPmLPdNIY="
$JWT_REFRESH_SECRET = "hLuV4TRTODW+8rjs4Fz+atmqMzsv77jpoI24mCsIO58="
$GMAIL_USER = "202317b2715@wilp.bits-pilani.ac.in"
$GMAIL_PASSWORD = "#Maharaj@9673090202"

& $AZ_CLI webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name "$WEBAPP_BACKEND-$UNIQUE_SUFFIX" `
  --settings `
    NODE_ENV="production" `
    PORT="8080" `
    JWT_SECRET="$JWT_SECRET" `
    JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" `
    GMAIL_USER="$GMAIL_USER" `
    GMAIL_APP_PASSWORD="$GMAIL_PASSWORD" `
    APP_URL="https://$WEBAPP_FRONTEND-$UNIQUE_SUFFIX.azurewebsites.net" `
    API_URL="https://$WEBAPP_BACKEND-$UNIQUE_SUFFIX.azurewebsites.net"

Write-Host ""
Write-Host "Step 6: Configuring Frontend App Settings..." -ForegroundColor Blue
& $AZ_CLI webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name "$WEBAPP_FRONTEND-$UNIQUE_SUFFIX" `
  --settings `
    VITE_API_URL="https://$WEBAPP_BACKEND-$UNIQUE_SUFFIX.azurewebsites.net" `
    VITE_WS_URL="https://$WEBAPP_BACKEND-$UNIQUE_SUFFIX.azurewebsites.net"

Write-Host ""
Write-Host "✅ Basic Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend API:  https://$WEBAPP_BACKEND-$UNIQUE_SUFFIX.azurewebsites.net" -ForegroundColor Yellow
Write-Host "Frontend Web: https://$WEBAPP_FRONTEND-$UNIQUE_SUFFIX.azurewebsites.net" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Azure for Students Limitations" -ForegroundColor Yellow
Write-Host "- No PostgreSQL/Redis in free tier" -ForegroundColor Yellow
Write-Host "- Using in-memory storage (data will be lost on restart)" -ForegroundColor Yellow
Write-Host "- Limited to 60 minutes CPU time per day" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Deploy code using Git or ZIP deploy" -ForegroundColor White
Write-Host "2. Configure custom domain (optional)" -ForegroundColor White
Write-Host ""
Write-Host "To deploy code:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  call az-cli.bat webapp up --name $WEBAPP_BACKEND-$UNIQUE_SUFFIX --resource-group $RESOURCE_GROUP" -ForegroundColor White
Write-Host ""
Write-Host "  cd ../frontend" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  call az-cli.bat webapp up --name $WEBAPP_FRONTEND-$UNIQUE_SUFFIX --resource-group $RESOURCE_GROUP --html" -ForegroundColor White
Write-Host ""
