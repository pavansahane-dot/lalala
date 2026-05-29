# 🚀 Quick Start - Azure Deployment

## Prerequisites (5 minutes)

1. **Install Azure CLI**
   ```bash
   # Windows (PowerShell as Admin)
   winget install Microsoft.AzureCLI
   
   # Or download: https://aka.ms/installazurecliwindows
   ```

2. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Start Docker Desktop

3. **Login to Azure**
   ```bash
   az login
   ```

## Option 1: Automated Deployment (15 minutes)

### Step 1: Configure Environment
```bash
# Copy template
copy .env.azure .env

# Edit .env and fill in:
# - Generate JWT secrets: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# - Add your email credentials
# - Add Stripe keys (if using payments)
```

### Step 2: Run Deployment Script
```powershell
# Windows
.\azure-deploy.ps1

# This will:
# ✅ Create all Azure resources
# ✅ Build and push Docker images
# ✅ Deploy your application
# ✅ Configure database and Redis
```

### Step 3: Run Database Migrations
```bash
# Get your web app name
az webapp list --resource-group vpn-app-rg --query "[].name" -o tsv

# SSH into the app
az webapp ssh --resource-group vpn-app-rg --name vpn-app-web

# Run migrations
cd /app
npx prisma migrate deploy
node create-admin.js
```

### Step 4: Access Your App
```
Your app is live at: https://vpn-app-web.azurewebsites.net
```

## Option 2: Manual Deployment (30 minutes)

Follow the detailed guide in `AZURE_DEPLOYMENT.md`

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Verify database connection
- [ ] Check Redis cache
- [ ] Test VPN config generation
- [ ] Configure custom domain (optional)
- [ ] Enable SSL certificate
- [ ] Setup monitoring alerts
- [ ] Configure backup policies

## Environment Variables to Configure

**Required:**
- `DATABASE_URL` - Azure PostgreSQL connection string
- `REDIS_URL` - Azure Redis connection string
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `JWT_REFRESH_SECRET` - Generate another secret

**Optional (for full features):**
- `GMAIL_USER` & `GMAIL_APP_PASSWORD` - Email notifications
- `TWILIO_*` - SMS notifications
- `STRIPE_*` - Payment processing
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth login

## Cost Estimate

**Basic Setup (~$107/month):**
- App Service Plan (B2): $70
- PostgreSQL (Burstable): $15
- Redis Cache (Basic): $17
- Container Registry: $5

**Free Tier Option (~$0/month for 12 months):**
- Use Azure Free Tier
- App Service (F1): Free
- PostgreSQL (B1ms): Free for 12 months
- Redis (C0): Free for 12 months

## Troubleshooting

**Deployment fails:**
```bash
# Check logs
az webapp log tail --resource-group vpn-app-rg --name vpn-app-web
```

**Database connection error:**
```bash
# Allow Azure services to access PostgreSQL
az postgres flexible-server firewall-rule create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --rule-name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Container won't start:**
```bash
# Restart the app
az webapp restart --resource-group vpn-app-rg --name vpn-app-web
```

## Cleanup (Delete Everything)

```bash
az group delete --name vpn-app-rg --yes --no-wait
```

## Next Steps

1. **Custom Domain**: Add your domain in Azure Portal
2. **SSL Certificate**: Enable HTTPS with free Azure certificate
3. **Monitoring**: Setup Application Insights
4. **Scaling**: Configure auto-scaling rules
5. **Backup**: Enable automated backups

## Support

- Azure Docs: https://docs.microsoft.com/azure/
- Issues: Create an issue in your repository
