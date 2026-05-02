# Settings Pages Integration Guide

## Step 1: Install Required Dependencies

```bash
# Frontend dependencies
cd frontend
npm install qrcode

# Backend dependencies (if not already installed)
cd ../backend
npm install speakeasy bcryptjs
```

## Step 2: Add Routes to Your App

### Option A: If using React Router v6 (recommended)

Update your `frontend/src/App.tsx` or router configuration file:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserSettings from './pages/UserSettings';
import AdminSettings from './pages/AdminSettings';

// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... existing routes ... */}
        
        {/* User Settings Route */}
        <Route 
          path="/dashboard/settings" 
          element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Settings Route */}
        <Route 
          path="/admin/settings" 
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Option B: If using a different routing setup

Add these route configurations:

```typescript
{
  path: '/dashboard/settings',
  component: UserSettings,
  protected: true,
  role: 'user'
},
{
  path: '/admin/settings',
  component: AdminSettings,
  protected: true,
  role: 'admin'
}
```

## Step 3: Add Navigation Links

### User Dashboard Navigation

Add a settings link to your user dashboard navigation:

```typescript
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

// In your dashboard navigation component:
<Link 
  to="/dashboard/settings"
  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded"
>
  <Settings className="w-5 h-5" />
  Settings
</Link>
```

### Admin Panel Navigation

Add a settings link to your admin panel navigation:

```typescript
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

// In your admin navigation component:
<Link 
  to="/admin/settings"
  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded"
>
  <Settings className="w-5 h-5" />
  System Settings
</Link>
```

## Step 4: Update Backend Server (if not already done)

The routes should already be registered in `backend/server.js`. Verify these lines exist:

```javascript
const userSettingsRoutes = require('./routes/userSettings');
const adminSettingsRoutes = require('./routes/adminSettings');

// ... in the routes section:
app.use('/api/user', userSettingsRoutes);
app.use('/api/admin/site-settings', adminSettingsRoutes);
```

## Step 5: Run Database Migration

If you made changes to the Prisma schema:

```bash
cd backend
npx prisma generate
npx prisma db push
```

## Step 6: Test the Implementation

### Test User Settings:
1. Start your development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. Log in as a regular user
3. Navigate to `/dashboard/settings`
4. Test each tab:
   - Update profile information
   - Change password
   - Enable 2FA (scan QR code with Google Authenticator)
   - View active sessions
   - Configure VPN preferences
   - Manage devices
   - Set notification preferences
   - Export your data

### Test Admin Settings:
1. Log in as an admin user
2. Navigate to `/admin/settings`
3. Test the General tab:
   - Update site name
   - Configure announcement banner
   - Enable/disable maintenance mode
4. Save changes and verify they persist

## Step 7: Customize Styling (Optional)

If you want to match your existing theme, update the color classes in the components:

```typescript
// Replace orange accent (admin) with your color:
'bg-orange-500' → 'bg-your-color-500'
'text-orange-400' → 'text-your-color-400'
'border-orange-500' → 'border-your-color-500'

// Replace blue accent (user) with your color:
'bg-blue-500' → 'bg-your-color-500'
'text-blue-400' → 'text-your-color-400'
'border-blue-500' → 'border-your-color-500'
```

## Step 8: Add Protected Route Components (if not exists)

Create `ProtectedRoute.tsx` if you don't have it:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin' && user.adminRole === 'user') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
```

## Step 9: Verify API Endpoints

Test the API endpoints using curl or Postman:

```bash
# Get user settings
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/user/settings

# Update profile
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","country":"United States"}' \
  http://localhost:5000/api/user/settings/profile

# Get admin settings (admin token required)
curl -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:5000/api/admin/site-settings
```

## Step 10: Production Deployment Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] Database migrations are run
- [ ] SMTP is configured for email notifications
- [ ] 2FA is tested with real authenticator apps
- [ ] File upload limits are configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] SSL/TLS is enabled
- [ ] Backup strategy is in place
- [ ] Error logging is configured
- [ ] Security headers are set

## Troubleshooting

### Issue: "Cannot find module 'qrcode'"
**Solution:** Run `npm install qrcode` in the frontend directory

### Issue: "Cannot find module 'speakeasy'"
**Solution:** Run `npm install speakeasy` in the backend directory

### Issue: "authenticateToken is not a function"
**Solution:** The middleware has been updated to use `checkSession`. Make sure all route files import the correct middleware.

### Issue: "Settings not saving"
**Solution:** Check browser console and network tab for errors. Verify the API endpoints are responding correctly.

### Issue: "2FA QR code not displaying"
**Solution:** Make sure qrcode package is installed and the API is returning the otpauthUrl correctly.

### Issue: "Admin settings not accessible"
**Solution:** Verify your user has admin role. Check the database: `SELECT role, adminRole FROM User WHERE id = 'your-user-id'`

## Quick Start Commands

```bash
# Complete setup from scratch
cd frontend && npm install qrcode
cd ../backend && npm install speakeasy
cd backend && npx prisma generate && npx prisma db push

# Start development
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Open browser
# User Settings: http://localhost:5173/dashboard/settings
# Admin Settings: http://localhost:5173/admin/settings
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend logs
3. Verify database schema is up to date
4. Ensure all dependencies are installed
5. Check that environment variables are set correctly

## Next Steps

After basic integration:
1. Expand the placeholder admin tabs with full functionality
2. Add email templates for notifications
3. Implement file upload for avatars and logos
4. Add rich text editor for legal pages
5. Connect payment gateways (Stripe/PayPal)
6. Add comprehensive testing
7. Implement audit logging for all settings changes

---

**Need Help?** Check the SETTINGS_IMPLEMENTATION.md file for detailed documentation.
