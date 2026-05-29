# Final Azure Deployment for Azure for Students
# Uses East US region (already created)

$ErrorActionPreference = "Stop"
$AZ_CLI = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

Write-Host "🚀 Azure for Students Deployment - Final Version" -ForegroundColor Cyan
Write-Host ""

# Configuration
$RESOURCE_GROUP = "vpn-app-rg"
$LOCATION = "eastus"
$APP_SERVICE_PLAN = "vpn-free-plan"
$WEBAPP_NAME = "vpn-app-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Checking if resource group exists..." -ForegroundColor Blue
$rgExists = & $AZ_CLI group exists --name $RESOURCE_GROUP
if ($rgExists -eq "false") {
    Write-Host "Creating Resource Group..." -ForegroundColor Blue
    & $AZ_CLI group create --name $RESOURCE_GROUP --location $LOCATION
} else {
    Write-Host "Resource Group already exists, using it..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Creating App Service Plan (Free F1 Tier)..." -ForegroundColor Blue
& $AZ_CLI appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku F1 `
  --is-linux

if ($LASTEXITCODE -ne 0) {
    Write-Host "App Service Plan creation failed, trying B1 tier..." -ForegroundColor Yellow
    & $AZ_CLI appservice plan create `
      --name $APP_SERVICE_PLAN `
      --resource-group $RESOURCE_GROUP `
      --location $LOCATION `
      --sku B1 `
      --is-linux
}

Write-Host ""
Write-Host "Creating Web App..." -ForegroundColor Blue
& $AZ_CLI webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $WEBAPP_NAME `
  --runtime "NODE:18-lts"

Write-Host ""
Write-Host "Configuring App Settings..." -ForegroundColor Blue
& $AZ_CLI webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $WEBAPP_NAME `
  --settings `
    NODE_ENV="production" `
    PORT="8080" `
    JWT_SECRET="1TXwWoZDNxvlzhBXNd88pQxoxRgcYuKNDJfPmLPdNIY=" `
    JWT_REFRESH_SECRET="hLuV4TRTODW+8rjs4Fz+atmqMzsv77jpoI24mCsIO58=" `
    GMAIL_USER="202317b2715@wilp.bits-pilani.ac.in" `
    GMAIL_APP_PASSWORD="#Maharaj@9673090202" `
    APP_URL="https://$WEBAPP_NAME.azurewebsites.net" `
    API_URL="https://$WEBAPP_NAME.azurewebsites.net/api" `
    VITE_API_URL="https://$WEBAPP_NAME.azurewebsites.net/api"

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YOUR VPN APP IS READY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "URL: https://$WEBAPP_NAME.azurewebsites.net" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: Deploy your code" -ForegroundColor Cyan
Write-Host "Run: call az-cli.bat webapp up --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP" -ForegroundColor White
Write-Host ""
