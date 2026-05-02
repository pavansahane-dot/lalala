# ZeroTraceVPN - Production Deployment Files

This repository contains production-ready configuration files for deploying ZeroTraceVPN to Azure Ubuntu Server.

## 📁 Files Included

- **`.env.production`** - Backend environment template
- **`frontend/.env.production`** - Frontend environment template
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`deploy.sh`** - Automated deployment script
- **`ecosystem.config.js`** - PM2 process manager configuration
- **`DEPLOYMENT.md`** - Complete deployment guide

## 🚀 Quick Deployment

### On Your Local Machine

1. **Update configuration files:**
   - Edit `backend/.env.production` with your credentials
   - Update `nginx.conf` with your domain name

2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Add production deployment files"
   git push origin main
   ```

### On Azure Server

1. **Clone and setup:**
   ```bash
   ssh azureuser@72.155.88.91
   git clone https://github.com/pavansahane-dot/ZeroTraceVPN.git
   cd ZeroTraceVPN
   ```

2. **Follow the deployment guide:**
   ```bash
   cat DEPLOYMENT.md
   ```

3. **Or use the automated script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 📖 Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Always use `.env.production` as a template
- Generate strong JWT secrets: `openssl rand -base64 32`
- Update all default passwords before deployment

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.io
- **Process Manager:** PM2
- **Web Server:** Nginx
- **SSL:** Let's Encrypt

## 📞 Support

For deployment issues, check:
- Backend logs: `pm2 logs vpn-backend`
- Nginx logs: `/var/log/nginx/vpn-app-error.log`
- Deployment guide: `DEPLOYMENT.md`
