# ✅ Azure Deployment Checklist

## Pre-Deployment

- [ ] Azure account created
- [ ] Azure CLI installed (`az --version`)
- [ ] Docker Desktop installed and running
- [ ] Logged into Azure (`az login`)
- [ ] Repository cloned locally

## Configuration

- [ ] Copy `.env.azure` to `.env`
- [ ] Generate JWT secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] Add JWT_SECRET to .env
- [ ] Add JWT_REFRESH_SECRET to .env
- [ ] Configure email settings (GMAIL_USER, GMAIL_APP_PASSWORD)
- [ ] Configure Stripe keys (if using payments)
- [ ] Configure Twilio (if using SMS)
- [ ] Configure Google OAuth (if using social login)

## Deployment

- [ ] Run `.\azure-deploy.ps1` (Windows) or `./azure-deploy.sh` (Linux/Mac)
- [ ] Wait for all resources to be created (~10-15 minutes)
- [ ] Verify resource group created: `az group show --name vpn-app-rg`
- [ ] Verify web app created: `az webapp list --resource-group vpn-app-rg`

## Database Setup

- [ ] SSH into web app: `az webapp ssh --resource-group vpn-app-rg --name vpn-app-web`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Create admin user: `node create-admin.js`
- [ ] Verify database connection

## Post-Deployment

- [ ] Access web app URL: `https://vpn-app-web.azurewebsites.net`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test VPN config generation
- [ ] Test admin panel access
- [ ] Verify email notifications work
- [ ] Check application logs: `az webapp log tail --resource-group vpn-app-rg --name vpn-app-web`

## Security

- [ ] Remove `.env` from git: `git rm --cached .env`
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Remove `backend/keys/` from git history
- [ ] Rotate all default passwords
- [ ] Enable Azure Key Vault for secrets (optional)
- [ ] Configure firewall rules for PostgreSQL
- [ ] Enable SSL/TLS certificate
- [ ] Configure CORS origins

## Monitoring

- [ ] Enable Application Insights
- [ ] Configure log retention
- [ ] Setup alert rules for:
  - [ ] High CPU usage
  - [ ] High memory usage
  - [ ] Database connection failures
  - [ ] Application errors
- [ ] Configure uptime monitoring

## Optimization

- [ ] Enable CDN for static assets (optional)
- [ ] Configure auto-scaling rules
- [ ] Enable Redis cache
- [ ] Optimize database queries
- [ ] Enable gzip compression

## Backup & Recovery

- [ ] Enable automated database backups
- [ ] Test database restore procedure
- [ ] Document recovery process
- [ ] Setup geo-redundant storage (optional)

## Custom Domain (Optional)

- [ ] Purchase domain
- [ ] Add custom domain to web app
- [ ] Configure DNS records
- [ ] Enable SSL certificate
- [ ] Test HTTPS access

## CI/CD (Optional)

- [ ] Push code to GitHub
- [ ] Add Azure credentials to GitHub Secrets
- [ ] Add ACR credentials to GitHub Secrets
- [ ] Test GitHub Actions workflow
- [ ] Verify automatic deployments

## Documentation

- [ ] Update README with production URL
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures

## Final Verification

- [ ] All services running
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Security scan passed
- [ ] Backup configured
- [ ] Monitoring active

## Cost Management

- [ ] Review Azure cost analysis
- [ ] Set spending limits
- [ ] Configure cost alerts
- [ ] Optimize resource sizing

## Maintenance

- [ ] Schedule regular updates
- [ ] Monitor security advisories
- [ ] Plan for scaling
- [ ] Review logs weekly

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** _____________
**Admin Email:** _____________
