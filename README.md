# 🚀 VPN APPLICATION

## ⚡ QUICK START (3 Steps)

### Step 1: Install Services

**Choose ONE method:**

**Method A: Docker (FASTEST - 2 minutes)**
- Double-click `install-docker.bat`
- Requires: Docker Desktop installed

**Method B: Manual (EASIEST - 15 minutes)**
- Double-click `install-manual.bat`
- Downloads and installs PostgreSQL & Memurai

**Method C: Chocolatey (If working)**
- Right-click `install-dependencies.bat` → Run as Administrator
- If fails, run `fix-chocolatey.bat` first

### Step 2: Setup Database
**Double-click** `setup-database.bat`

This creates the database and tables (takes 2 minutes)

### Step 3: Start Application
**Double-click** `start-simple.bat`

Then open: **http://localhost:5173**

---

## 📁 FILES

| File | Purpose |
|------|---------|
| `install-docker.bat` | Install via Docker (FASTEST) |
| `install-manual.bat` | Manual installation guide |
| `install-dependencies.bat` | Install via Chocolatey |
| `fix-chocolatey.bat` | Fix Chocolatey if broken |
| `setup-database.bat` | Create database & tables |
| `start-simple.bat` | Start the app |
| `check-services.bat` | Check if services are running |
| `CREDENTIALS.txt` | Database & app credentials |
| `INSTALLATION_INSTRUCTIONS.md` | Detailed install guide |

---

## 🔐 CREDENTIALS

**Database:**
- PostgreSQL: `postgresql://postgres:secure_password_here@localhost:5432/vpndb`
- Redis: `redis://localhost:6379`

**Application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Default VPN:**
- Username: `vpnbook`
- Password: `free2024`

---

## 🆘 TROUBLESHOOTING

**Services not running?**
```bash
check-services.bat
```

**Need to reinstall?**
```bash
install-dependencies.bat (as Admin)
```

**Database issues?**
```bash
setup-database.bat
```

---

## 📂 PROJECT STRUCTURE

```
vpn-app/
├── backend/          Node.js API server
├── frontend/         React web application
├── nginx/            Nginx configuration
└── vpn/              VPN configurations
```

---

**Status:** ✅ Ready to install
**Time:** 15-20 minutes total
**Next:** Run `install-dependencies.bat` as Administrator


---

## 🌐 AZURE DEPLOYMENT

### Quick Deploy (15 minutes)

1. **Install Azure CLI**
   ```bash
   winget install Microsoft.AzureCLI
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Configure Environment**
   ```bash
   copy .env.azure .env
   node setup-azure-env.js
   # Edit .env with your values
   ```

4. **Deploy**
   ```powershell
   .\azure-deploy.ps1
   ```

5. **Access Your App**
   ```
   https://vpn-app-web.azurewebsites.net
   ```

### Documentation

- **Quick Start**: `QUICKSTART_AZURE.md` (15 min guide)
- **Full Guide**: `AZURE_DEPLOYMENT.md` (detailed instructions)
- **Checklist**: `DEPLOYMENT_CHECKLIST.md` (step-by-step)
- **Files Info**: `DEPLOYMENT_FILES.md` (all deployment files)

### Cost

- **Basic**: ~$107/month
- **Free Tier**: ~$5/month (first 12 months)

---

**Deployment Status:** ✅ Ready for Azure
**Deployment Time:** 15-20 minutes
**Next:** Run `.\azure-deploy.ps1`
