# 🚀 INSTALLATION INSTRUCTIONS

## 📋 What Needs to Be Installed

You need to install 2 services:
1. **PostgreSQL** - Database server
2. **Redis/Memurai** - Cache server

---

## ⚡ FASTEST METHOD: Automatic Installation

### Step 1: Run Auto-Installer

**Right-click** `install-dependencies.bat` → **Run as Administrator**

This will:
- ✅ Install Chocolatey (package manager)
- ✅ Install PostgreSQL 14
- ✅ Install Memurai (Redis for Windows)
- ✅ Start both services automatically

**Time:** 10-15 minutes

---

## 🔧 ALTERNATIVE: Manual Installation

### Option A: Download and Install Manually

#### 1. Install PostgreSQL

**Download:**
```
https://www.postgresql.org/download/windows/
```

**Steps:**
1. Click "Download the installer"
2. Download PostgreSQL 14 or higher (Windows x86-64)
3. Run the installer
4. **IMPORTANT:** Set password to: `secure_password_here`
5. Port: `5432` (default)
6. Install all components
7. PostgreSQL will start automatically

**Time:** 10 minutes

#### 2. Install Memurai (Redis for Windows)

**Download:**
```
https://www.memurai.com/get-memurai
```

**Steps:**
1. Click "Download Memurai Developer"
2. Run the installer
3. Use default settings
4. Memurai starts automatically as Windows service

**Time:** 5 minutes

---

### Option B: Use Docker (If You Have Docker Desktop)

**Open Command Prompt and run:**

```bash
# Install PostgreSQL
docker run -d --name vpn-postgres -e POSTGRES_PASSWORD=secure_password_here -e POSTGRES_DB=vpndb -p 5432:5432 postgres:14

# Install Redis
docker run -d --name vpn-redis -p 6379:6379 redis:latest

# Wait 10 seconds
timeout /t 10
```

**Time:** 2 minutes

---

## ✅ Verify Installation

After installing, verify services are running:

```bash
# Check PostgreSQL (should show LISTENING)
netstat -ano | findstr :5432

# Check Redis (should show LISTENING)
netstat -ano | findstr :6379
```

**Or run:**
```bash
check-services.bat
```

---

## 🗄️ Setup Database

After PostgreSQL and Redis are installed and running:

**Run:**
```bash
setup-database.bat
```

This will:
1. Create database `vpndb`
2. Create all 17 tables
3. Generate Prisma client
4. Seed default VPN credentials

**Time:** 2 minutes

---

## 🚀 Start the Application

After database setup is complete:

**Run:**
```bash
start-simple.bat
```

This will start:
- Backend API (port 5000)
- Frontend (port 5173)

**Open browser:**
```
http://localhost:5173
```

---

## 📁 Installation Scripts Created

| File | Purpose | When to Use |
|------|---------|-------------|
| `install-dependencies.bat` | Auto-install PostgreSQL & Redis | **START HERE** (Run as Admin) |
| `INSTALL_GUIDE.bat` | Manual installation guide | If auto-install fails |
| `setup-database.bat` | Setup database & tables | After PostgreSQL is installed |
| `check-services.bat` | Verify services are running | Anytime to check status |
| `start-simple.bat` | Start the application | After everything is installed |

---

## 🎯 Complete Installation Flow

```
1. install-dependencies.bat (as Admin)
   ↓ (10-15 minutes)
   
2. Verify services running
   ↓
   
3. setup-database.bat
   ↓ (2 minutes)
   
4. start-simple.bat
   ↓
   
5. Open http://localhost:5173
   ✅ DONE!
```

---

## 🆘 Troubleshooting

### "Access Denied" Error
**Solution:** Right-click script → Run as Administrator

### "Chocolatey not found" Error
**Solution:** Close and reopen Command Prompt after Chocolatey installs

### "Port already in use" Error
**Solution:** Another service is using the port. Check with:
```bash
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### "Password authentication failed" Error
**Solution:** Update password in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vpndb"
```

### PostgreSQL won't start
**Solution:** 
```bash
# Try starting manually
net start postgresql-x64-14

# Or check Windows Services
Win + R → services.msc → Find PostgreSQL → Start
```

### Redis/Memurai won't start
**Solution:**
```bash
# Try starting manually
net start Memurai

# Or
net start Redis
```

---

## 💡 Quick Tips

- **Always run install-dependencies.bat as Administrator**
- **Wait for each step to complete before moving to next**
- **Check services are running before setup-database.bat**
- **Keep terminal windows open to see logs**

---

## 📞 Need Help?

1. Run `check-services.bat` to see what's running
2. Check `STATUS_REPORT.md` for current status
3. See `ERROR_FIXES.md` for common issues
4. Check backend terminal for error messages

---

## ✅ Success Checklist

After installation, you should have:

- [ ] PostgreSQL installed and running (port 5432)
- [ ] Redis/Memurai installed and running (port 6379)
- [ ] Database `vpndb` created
- [ ] 17 tables created in database
- [ ] Prisma client generated
- [ ] Default VPN credentials seeded
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Can access http://localhost:5173

---

## 🎉 Ready to Go!

Once all checkboxes are checked, your VPN application is fully installed and ready to use!

**Create your first account:**
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Register with email and password
4. Start using the VPN app!

---

**Installation Time:** 15-20 minutes total
**Difficulty:** Easy (mostly automated)
**Status:** Ready to install!
