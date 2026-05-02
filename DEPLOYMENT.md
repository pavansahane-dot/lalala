# Azure Ubuntu Deployment Guide

Complete step-by-step guide to deploy ZeroTraceVPN on Azure Ubuntu Server.

## 📋 Prerequisites

- Azure Ubuntu VM (Latest LTS)
- SSH access: `ssh azureuser@72.155.88.91`
- Domain name with DNS A record pointing to server IP (for SSL)
- GitHub repository access

## 🚀 Quick Start

### 1. Initial Server Setup

```bash
# Connect to server
ssh azureuser@72.155.88.91

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Git
sudo apt install -y git
```

### 2. Database Setup

```bash
# Create PostgreSQL database and user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE vpndb_prod;
CREATE USER vpnuser WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE vpndb_prod TO vpnuser;
\c vpndb_prod
GRANT ALL ON SCHEMA public TO vpnuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vpnuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vpnuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vpnuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vpnuser;
\q
```

### 3. Clone Repository

```bash
cd ~
git clone https://github.com/pavansahane-dot/ZeroTraceVPN.git
cd ZeroTraceVPN
```

### 4. Backend Configuration

```bash
cd backend

# Copy production environment template
cp .env.production .env

# Edit .env with your production values
nano .env
```

**Update these critical values in .env:**
- `DATABASE_URL` - Use the password you set above
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate: `openssl rand -base64 32`
- `APP_URL` - Your domain (e.g., https://zerotracevpn.com)
- `API_URL` - Your domain (e.g., https://zerotracevpn.com)
- Email, SMS, Stripe credentials (if using)

```bash
# Install dependencies
npm install --production

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start server.js --name vpn-backend
pm2 save
pm2 startup systemd
# Run the command PM2 outputs
```

### 5. Frontend Configuration

```bash
cd ~/ZeroTraceVPN/frontend

# Production env is already configured
# Build frontend
npm install
npm run build

# Deploy to web root
sudo mkdir -p /var/www/vpn-app
sudo cp -r dist/* /var/www/vpn-app/
sudo chown -R www-data:www-data /var/www/vpn-app
sudo chmod -R 755 /var/www/vpn-app
```

### 6. Nginx Configuration

```bash
# Copy nginx config
sudo cp ~/ZeroTraceVPN/nginx.conf /etc/nginx/sites-available/vpn-app

# Edit and update server_name
sudo nano /etc/nginx/sites-available/vpn-app
# Change: server_name yourdomain.com www.yourdomain.com;

# Enable site
sudo ln -s /etc/nginx/sites-available/vpn-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (IMPORTANT!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 8. SSL Certificate (Let's Encrypt)

**Ensure DNS is pointing to your server first!**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically:
- Obtain SSL certificate
- Update Nginx configuration
- Setup auto-renewal

### 9. Verify Deployment

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server
pm2 status

# Check backend logs
pm2 logs vpn-backend --lines 50

# Test backend
curl http://localhost:5000/health

# Test through Nginx
curl https://yourdomain.com/api/health
```

## 🔄 Future Deployments

For updates, use the deployment script:

```bash
cd ~/ZeroTraceVPN
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ Useful Commands

### PM2 Management
```bash
pm2 status                    # Check status
pm2 logs vpn-backend          # View logs
pm2 restart vpn-backend       # Restart
pm2 stop vpn-backend          # Stop
pm2 monit                     # Monitor resources
```

### Nginx Management
```bash
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload
sudo systemctl restart nginx  # Restart
sudo tail -f /var/log/nginx/vpn-app-error.log  # View errors
```

### Database Management
```bash
psql -U vpnuser -d vpndb_prod -h localhost  # Connect to DB
sudo -u postgres psql                        # Connect as postgres
```

### System Monitoring
```bash
htop                          # System resources
df -h                         # Disk space
free -h                       # Memory usage
sudo netstat -tulpn           # Open ports
```

## 🔒 Security Checklist

- [ ] Changed default database password
- [ ] Generated strong JWT secrets (min 32 chars)
- [ ] Configured UFW firewall
- [ ] Installed SSL certificate
- [ ] Updated all .env credentials
- [ ] Disabled root SSH login
- [ ] Setup fail2ban (optional)
- [ ] Regular backups configured

## 🐛 Troubleshooting

### Backend not starting
```bash
pm2 logs vpn-backend --lines 100
# Check for database connection errors
```

### Database connection failed
```bash
# Test connection
psql -U vpnuser -d vpndb_prod -h localhost -W

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/vpn-app-error.log
```

### WebSocket not connecting
- Ensure Nginx config has WebSocket headers
- Check browser console for errors
- Verify backend Socket.io is running

## 📞 Support

For issues, check:
1. Backend logs: `pm2 logs vpn-backend`
2. Nginx logs: `/var/log/nginx/vpn-app-error.log`
3. System logs: `sudo journalctl -xe`

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
