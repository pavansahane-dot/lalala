# Azure Deployment - Quick Command Reference

## Pre-Deployment

```bash
# Install Azure CLI (Windows)
winget install Microsoft.AzureCLI

# Login
az login

# Verify login
az account show

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Verify readiness
node verify-deployment.js
```

## Deploy

```powershell
# Run deployment script
.\azure-deploy.ps1
```

## Post-Deployment

```bash
# SSH into web app
az webapp ssh --resource-group vpn-app-rg --name vpn-app-web

# Inside container - run migrations
npx prisma migrate deploy
node create-admin.js
exit

# View logs
az webapp log tail --resource-group vpn-app-rg --name vpn-app-web

# Restart app
az webapp restart --resource-group vpn-app-rg --name vpn-app-web

# Check status
az webapp show --resource-group vpn-app-rg --name vpn-app-web --query state
```

## Database

```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Get connection string
az postgres flexible-server show \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --query fullyQualifiedDomainName
```

## Monitoring

```bash
# Create Application Insights
az monitor app-insights component create \
  --app vpn-app-insights \
  --location eastus \
  --resource-group vpn-app-rg

# Get instrumentation key
az monitor app-insights component show \
  --app vpn-app-insights \
  --resource-group vpn-app-rg \
  --query instrumentationKey
```

## Custom Domain

```bash
# Add domain
az webapp config hostname add \
  --resource-group vpn-app-rg \
  --webapp-name vpn-app-web \
  --hostname yourdomain.com

# Enable SSL
az webapp config ssl bind \
  --resource-group vpn-app-rg \
  --name vpn-app-web \
  --certificate-thumbprint auto \
  --ssl-type SNI
```

## Troubleshooting

```bash
# View all resources
az resource list --resource-group vpn-app-rg --output table

# Check web app details
az webapp show --resource-group vpn-app-rg --name vpn-app-web

# View environment variables
az webapp config appsettings list \
  --resource-group vpn-app-rg \
  --name vpn-app-web

# Update environment variable
az webapp config appsettings set \
  --resource-group vpn-app-rg \
  --name vpn-app-web \
  --settings KEY=VALUE
```

## Cleanup

```bash
# Delete everything
az group delete --name vpn-app-rg --yes --no-wait
```

## URLs

- **Web App:** https://vpn-app-web.azurewebsites.net
- **Azure Portal:** https://portal.azure.com
- **Resource Group:** vpn-app-rg
- **Location:** eastus
