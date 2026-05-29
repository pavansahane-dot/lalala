# 🚀 Render.com Deployment Guide - Step by Step

## Prerequisites
- GitHub account
- Your VPN app code

---

## STEP 1: Push Code to GitHub (5 minutes)

### Option A: If you have Git installed

Open Command Prompt in your project folder:
```bash
cd C:\Users\PAVAN\vpn-app

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for Render deployment"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/vpn-app.git
git branch -M main
git push -u origin main
```

### Option B: Upload via GitHub Web Interface

1. Go to https://github.com/new
2. Create new repository named `vpn-app`
3. Click "uploading an existing file"
4. Drag and drop your entire `vpn-app` folder
5. Click "Commit changes"

---

## STEP 2: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

---

## STEP 3: Create PostgreSQL Database (3 minutes)

1. In Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name:** `vpn-database`
   - **Database:** `vpndb`
   - **User:** `vpnadmin`
   - **Region:** Choose closest to you (e.g., Singapore)
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to be ready
6. **IMPORTANT:** Copy the **"Internal Database URL"** (starts with `postgresql://`)
   - Example: `postgresql://vpnadmin:xxxxx@dpg-xxxxx/vpndb`

---

## STEP 4: Create Redis Instance (3 minutes)

1. Click **"New +"**
2. Select **"Redis"**
3. Fill in:
   - **Name:** `vpn-redis`
   - **Region:** Same as database
   - **Plan:** Free
4. Click **"Create Redis"**
5. Wait 1-2 minutes
6. **IMPORTANT:** Copy the **"Internal Redis URL"** (starts with `redis://`)
   - Example: `redis://red-xxxxx:6379`

---

## STEP 5: Deploy Backend API (10 minutes)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository `vpn-app`
3. Fill in:
   - **Name:** `vpn-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<PASTE_YOUR_POSTGRES_INTERNAL_URL_HERE>
REDIS_URL=<PASTE_YOUR_REDIS_INTERNAL_URL_HERE>
JWT_SECRET=1TXwWoZDNxvlzhBXNd88pQxoxRgcYuKNDJfPmLPdNIY=
JWT_REFRESH_SECRET=hLuV4TRTODW+8rjs4Fz+atmqMzsv77jpoI24mCsIO58=
GMAIL_USER=202317b2715@wilp.bits-pilani.ac.in
GMAIL_APP_PASSWORD=#Maharaj@9673090202
APP_URL=https://vpn-frontend.onrender.com
API_URL=https://vpn-backend.onrender.com
WG_SERVER_IP=100.53.134.149:46577
WG_SERVER_PUBLIC_KEY=gKMc95i/cxCWYXFIa6FdnGMM+x6v14tJTWEJ4jNQGzo=
```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. **IMPORTANT:** Copy your backend URL (e.g., `https://vpn-backend.onrender.com`)

---

## STEP 6: Deploy Frontend (5 minutes)

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository `vpn-app`
3. Fill in:
   - **Name:** `vpn-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Add Environment Variable:**
```
VITE_API_URL=https://vpn-backend.onrender.com
```

5. Click **"Create Static Site"**
6. Wait 3-5 minutes for deployment
7. **Your app is live!** Copy the URL (e.g., `https://vpn-frontend.onrender.com`)

---

## STEP 7: Update Backend Environment (2 minutes)

1. Go to your **Backend service** in Render
2. Click **"Environment"** tab
3. Update these variables with your actual frontend URL:
   - `APP_URL=https://vpn-frontend.onrender.com`
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## STEP 8: Create Admin User (3 minutes)

1. Go to your backend service in Render
2. Click **"Shell"** tab (opens terminal)
3. Run:
```bash
node create-admin.js
```
4. Follow prompts to create admin account

---

## ✅ DEPLOYMENT COMPLETE!

### Your URLs:
- **Frontend:** https://vpn-frontend.onrender.com
- **Backend API:** https://vpn-backend.onrender.com
- **Database:** Managed by Render
- **Redis:** Managed by Render

### Test Your App:
1. Open frontend URL
2. Click "Sign Up"
3. Create account
4. Login
5. Generate VPN config

---

## 🎯 Important Notes

### Free Tier Limitations:
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free (enough for testing)

### To Prevent Sleep:
- Upgrade to paid plan ($7/month)
- Or use a service like UptimeRobot to ping every 10 minutes

### Custom Domain (Optional):
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as shown

---

## 🐛 Troubleshooting

### Backend won't start:
- Check logs in Render dashboard
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Frontend shows API errors:
- Verify VITE_API_URL matches backend URL
- Check backend is running (green status)
- Wait for backend to wake up (first request)

### Database connection error:
- Use "Internal Database URL" not "External"
- Ensure backend and database are in same region

---

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Redis instance created
- [ ] Backend deployed with all env variables
- [ ] Frontend deployed with API URL
- [ ] Backend APP_URL updated
- [ ] Admin user created
- [ ] App tested and working

---

## 🎉 Next Steps

1. Test all features
2. Share your app URL
3. Configure custom domain (optional)
4. Setup monitoring
5. Add more VPN servers

**Your app is now live and accessible worldwide!**
