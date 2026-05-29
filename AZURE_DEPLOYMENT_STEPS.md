# 🚀 Complete Azure Deployment Guide - Step by Step

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Azure account (free tier available)
- [ ] Azure CLI installed
- [ ] Docker Desktop installed and running
- [ ] Git installed (optional, for version control)

---

## STEP 1: Install Azure CLI (5 minutes)

### Windows:
```powershell
# Option 1: Using winget (recommended)
winget install Microsoft.AzureCLI

# Option 2: Download installer
# Visit: https://aka.ms/installazurecliwindows
```

### Verify Installation:
```bash
az --version
```

Expected output: `azure-cli 2.x.x`

---

## STEP 2: Login to Azure (2 minutes)

```bash
# Login to your Azure account
az login
```

This will:
1. Open your browser
2. Ask you to sign in to Azure
3. Return to terminal when complete

### Verify Login:
```bash
# List your subscriptions
az account list --output table

# Set default subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"
```

---

## STEP 3: Configure Environment Variables (10 minutes)

### 3.1 Copy Template
```bash
copy .env.azure .env
```

### 3.2 Generate JWT Secrets
```bash
# Run this command twice to generate two different secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output for JWT_SECRET and JWT_REFRESH_SECRET

### 3.3 Edit .env File

Open `.env` in a text editor and fill in:

```env
# Database (will be created by Azure)
DATABASE_URL=postgresql://vpnadmin@vpn-postgres-server:YourPassword123!@vpn-postgres-server.postgres.database.azure.com:5432/vpndb?sslmode=require

# Redis (will be created by Azure)
REDIS_URL=rediss://:YourRedisKey@vpn-redis-cache.redis.cache.windows.net:6380

# JWT Secrets (paste generated secrets)
JWT_SECRET=PASTE_FIRST_GENERATED_SECRET_HERE
JWT_REFRESH_SECRET=PASTE_SECOND_GENERATED_SECRET_HERE

# Application URLs (update after deployment)
APP_URL=https://vpn-app-web.azurewebsites.net
API_URL=https://vpn-app-web.azurewebsites.net/api

# Email (Gmail - optional but recommended)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe (optional for payments)
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_your_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_id

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# WireGuard (update with your Azure VM IP after deployment)
WG_SERVER_IP=your-azure-vm-ip:51820
WG_SERVER_PUBLIC_KEY=your-public-key
```

### 3.4 Get Gmail App Password (Optional but Recommended)

1. Go to https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Create new app password for "Mail"
4. Copy the 16-character password
5. Paste into `GMAIL_APP_PASSWORD` in .env

---

## STEP 4: Verify Deployment Readiness (2 minutes)

```bash
node verify-deployment.js
```

This checks:
- All required files exist
- Environment variables are configured
- Docker files are ready

Expected output: `✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!`

---

## STEP 5: Deploy to Azure (15-20 minutes)

### 5.1 Run Deployment Script

```powershell
# Windows
.\azure-deploy.ps1
```

This script will:
1. Create Resource Group
2. Create Container Registry
3. Build and push Docker images
4. Create PostgreSQL database
5. Create Redis cache
6. Create App Service Plan
7. Create Web App
8. Configure environment variables

### 5.2 Monitor Deployment

Watch the terminal output. You should see:
```
Step 1: Creating Resource Group...
Step 2: Creating Azure Container Registry...
Step 3: Building and Pushing Docker Images...
Step 4: Creating PostgreSQL Database...
Step 5: Creating Redis Cache...
Step 6: Creating App Service Plan...
Step 7: Creating Web App...
Step 8: Configuring Web App Settings...
✅ Deployment Complete!
```

### 5.3 Note Your URLs

At the end, you'll see:
```
Web App URL: https://vpn-app-web.azurewebsites.net
```

**Save this URL!**

---

## STEP 6: Configure Database (5 minutes)

### 6.1 Get Database Connection Details

```bash
# Get PostgreSQL hostname
az postgres flexible-server show --resource-group vpn-app-rg --name vpn-postgres-server --query fullyQualifiedDomainName -o tsv
```

### 6.2 Allow Azure Services to Access Database

```bash
az postgres flexible-server firewall-rule create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 6.3 SSH into Web App and Run Migrations

```bash
# SSH into the web app
az webapp ssh --resource-group vpn-app-rg --name vpn-app-web

# Once inside the container, run:
cd /app
npx prisma migrate deploy
node create-admin.js
exit
```

---

## STEP 7: Verify Deployment (5 minutes)

### 7.1 Check Web App Status

```bash
az webapp show --resource-group vpn-app-rg --name vpn-app-web --query state -o tsv
```

Expected: `Running`

### 7.2 Test Health Endpoint

```bash
curl https://vpn-app-web.azurewebsites.net/health
```

Expected: `{"status":"OK"}`

### 7.3 Open in Browser

Visit: `https://vpn-app-web.azurewebsites.net`

You should see your landing page!

### 7.4 Test Key Features

- [ ] Landing page loads
- [ ] Privacy Policy page works
- [ ] Terms of Service page works
- [ ] Contact page works
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard loads after login

---

## STEP 8: Configure Custom Domain (Optional, 10 minutes)

### 8.1 Add Custom Domain

```bash
# Add your domain
az webapp config hostname add \
  --resource-group vpn-app-rg \
  --webapp-name vpn-app-web \
  --hostname yourdomain.com
```

### 8.2 Configure DNS

Add these DNS records at your domain registrar:

**A Record:**
- Name: `@`
- Value: (Get IP from Azure Portal)

**CNAME Record:**
- Name: `www`
- Value: `vpn-app-web.azurewebsites.net`

### 8.3 Enable SSL

```bash
# Azure provides free SSL certificate
az webapp config ssl bind \
  --resource-group vpn-app-rg \
  --name vpn-app-web \
  --certificate-thumbprint auto \
  --ssl-type SNI
```

---

## STEP 9: Enable Monitoring (5 minutes)

### 9.1 Create Application Insights

```bash
az monitor app-insights component create \
  --app vpn-app-insights \
  --location eastus \
  --resource-group vpn-app-rg
```

### 9.2 Get Instrumentation Key

```bash
az monitor app-insights component show \
  --app vpn-app-insights \
  --resource-group vpn-app-rg \
  --query instrumentationKey -o tsv
```

### 9.3 Add to Web App Settings

```bash
az webapp config appsettings set \
  --resource-group vpn-app-rg \
  --name vpn-app-web \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key-here"
```

---

## STEP 10: View Logs (Ongoing)

### Real-time Logs

```bash
az webapp log tail --resource-group vpn-app-rg --name vpn-app-web
```

### Enable Logging

```bash
az webapp log config \
  --resource-group vpn-app-rg \
  --name vpn-app-web \
  --docker-container-logging filesystem \
  --level information
```

---

## STEP 11: Post-Deployment Tasks

### 11.1 Update Sitemap

Edit `frontend/public/sitemap.xml` and replace all URLs:
```xml
<loc>https://yourdomain.com/</loc>
```

### 11.2 Submit to Google Search Console

1. Go to https://search.google.com/search-console
2. Add your property (domain)
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 11.3 Submit to Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Add your site
3. Verify ownership
4. Submit sitemap

### 11.4 Test Payment Flow (If Using Stripe)

1. Go to billing page
2. Test checkout with Stripe test card: `4242 4242 4242 4242`
3. Verify webhook receives events

---

## Troubleshooting

### Issue: Deployment Script Fails

**Solution:**
```bash
# Check Azure CLI is logged in
az account show

# Re-login if needed
az logout
az login

# Try deployment again
.\azure-deploy.ps1
```

### Issue: Web App Won't Start

**Solution:**
```bash
# Check logs
az webapp log tail --resource-group vpn-app-rg --name vpn-app-web

# Restart app
az webapp restart --resource-group vpn-app-rg --name vpn-app-web
```

### Issue: Database Connection Error

**Solution:**
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server

# Add rule if missing
az postgres flexible-server firewall-rule create \
  --resource-group vpn-app-rg \
  --name vpn-postgres-server \
  --rule-name AllowAll \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### Issue: Container Build Fails

**Solution:**
```bash
# Check Docker is running
docker --version

# Login to ACR manually
az acr login --name vpnappregistry

# Build images manually
cd backend
docker build -t vpnappregistry.azurecr.io/vpn-backend:latest .
docker push vpnappregistry.azurecr.io/vpn-backend:latest

cd ../frontend
docker build -t vpnappregistry.azurecr.io/vpn-frontend:latest .
docker push vpnappregistry.azurecr.io/vpn-frontend:latest
```

---

## Cost Management

### View Current Costs

```bash
# View cost analysis
az consumption usage list --output table
```

### Set Budget Alert

```bash
# Create budget (example: $150/month)
az consumption budget create \
  --budget-name vpn-app-budget \
  --amount 150 \
  --time-grain Monthly \
  --resource-group vpn-app-rg
```

### Optimize Costs

**Free Tier Options:**
- Use F1 App Service Plan (free)
- Use B1ms PostgreSQL (free for 12 months)
- Use C0 Redis (free for 12 months)

**To Switch to Free Tier:**
```bash
# Change App Service Plan to Free
az appservice plan update \
  --name vpn-app-plan \
  --resource-group vpn-app-rg \
  --sku F1
```

---

## Cleanup (Delete Everything)

If you want to delete all resources:

```bash
# This will delete EVERYTHING in the resource group
az group delete --name vpn-app-rg --yes --no-wait
```

---

## Next Steps After Deployment

1. **Marketing:**
   - Post on Product Hunt
   - Share on Reddit (r/VPN, r/privacy)
   - Tweet announcement
   - Create demo video

2. **Monitoring:**
   - Check logs daily for first week
   - Monitor error rates
   - Track user signups
   - Review performance metrics

3. **Optimization:**
   - Analyze slow queries
   - Optimize images
   - Enable CDN for static assets
   - Configure auto-scaling

4. **Security:**
   - Review security logs
   - Update dependencies
   - Enable Azure Security Center
   - Configure backup policies

---

## Support

**Azure Documentation:** https://docs.microsoft.com/azure/
**Azure Support:** https://azure.microsoft.com/support/
**Pricing Calculator:** https://azure.microsoft.com/pricing/calculator/

---

## Deployment Checklist

- [ ] Azure CLI installed
- [ ] Logged into Azure
- [ ] Environment variables configured
- [ ] JWT secrets generated
- [ ] Gmail app password obtained (optional)
- [ ] Deployment script executed
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Web app accessible
- [ ] All pages load correctly
- [ ] Signup/login works
- [ ] Custom domain configured (optional)
- [ ] SSL enabled
- [ ] Monitoring enabled
- [ ] Logs configured
- [ ] Sitemap submitted to search engines
- [ ] Backup configured

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** _____________
**Status:** _____________
