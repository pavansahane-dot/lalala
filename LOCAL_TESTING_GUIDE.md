# 🧪 Local Testing Guide

## Quick Start

### Option 1: Automated (Recommended)
```bash
# Start both backend and frontend
start-dev.bat

# In another terminal, run tests
node test-local.js
```

### Option 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Tests
node test-local.js
```

---

## Manual Testing Checklist

### 1. Legal Pages ✅

**Privacy Policy:**
- [ ] Navigate to http://localhost:5173/privacy-policy
- [ ] Page loads without errors
- [ ] All sections are visible
- [ ] "Back to Home" link works
- [ ] Header navigation works

**Terms of Service:**
- [ ] Navigate to http://localhost:5173/terms-of-service
- [ ] Page loads without errors
- [ ] All sections are visible
- [ ] "Back to Home" link works

**Contact Page:**
- [ ] Navigate to http://localhost:5173/contact
- [ ] Form is visible with all fields
- [ ] Email links work (support@, bugs@, feedback@)
- [ ] Form validation works (try submitting empty)
- [ ] Submit form with valid data
- [ ] Success toast appears
- [ ] Form clears after submission

### 2. Cookie Consent ✅

- [ ] Open http://localhost:5173 in incognito/private mode
- [ ] Cookie consent banner appears at bottom
- [ ] "Accept" button works
- [ ] "Decline" button works
- [ ] Banner doesn't reappear after accepting
- [ ] Privacy Policy link in banner works

### 3. Footer Links ✅

- [ ] Scroll to footer on landing page
- [ ] "Privacy Policy" link visible
- [ ] "Terms of Service" link visible
- [ ] "Contact Us" link visible
- [ ] All links navigate correctly

### 4. SEO & Meta Tags ✅

- [ ] View page source (Ctrl+U)
- [ ] Check for `<title>` tag
- [ ] Check for meta description
- [ ] Check for Open Graph tags (og:title, og:description)
- [ ] Check for Twitter Card tags

### 5. Analytics ✅

**Open Browser Console (F12):**
- [ ] Navigate to different pages
- [ ] Check console for `[Analytics]` logs (in development)
- [ ] Accept cookies
- [ ] Perform actions (signup, login)
- [ ] Verify events are tracked

### 6. Contact Form API ✅

**Test Backend:**
```bash
# Test contact endpoint
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"subject\":\"general\",\"message\":\"Test message\"}"
```

Expected: `{"message":"Message sent successfully"}`

**Test Rate Limiting:**
- [ ] Submit contact form 6 times quickly
- [ ] 6th request should be rate limited
- [ ] Error message appears

### 7. Existing Features (Regression Testing) ✅

**Authentication:**
- [ ] Signup works
- [ ] Email verification works
- [ ] Login works
- [ ] Password reset works
- [ ] OAuth (Google) works

**Dashboard:**
- [ ] Dashboard loads after login
- [ ] VPN configs can be generated
- [ ] Server list loads
- [ ] Profile page works

**Billing:**
- [ ] Billing page loads
- [ ] Stripe checkout works (test mode)
- [ ] Subscription status displays

---

## Common Issues & Fixes

### Issue: Pages show 404
**Fix:** Make sure frontend dev server is running on port 5173

### Issue: API calls fail
**Fix:** Make sure backend is running on port 5000

### Issue: Cookie banner doesn't appear
**Fix:** Clear localStorage and refresh in incognito mode

### Issue: Contact form doesn't submit
**Fix:** Check backend logs for errors, verify email configuration

### Issue: Database errors
**Fix:** Run `npx prisma migrate deploy` in backend folder

---

## Environment Variables Check

### Backend (.env)
```bash
# Required for local testing
DATABASE_URL=postgresql://postgres:secure_password_here@localhost:5432/vpndb
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development

# Optional (for full features)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

---

## Performance Testing

### Page Load Times
- [ ] Landing page loads < 2 seconds
- [ ] Privacy Policy loads < 1 second
- [ ] Terms loads < 1 second
- [ ] Contact page loads < 1 second

### API Response Times
- [ ] Health check < 100ms
- [ ] Contact form < 500ms
- [ ] Auth endpoints < 300ms

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browser (Chrome mobile)

---

## Accessibility Testing

- [ ] Tab navigation works on all forms
- [ ] All buttons are keyboard accessible
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Color contrast is sufficient

---

## Security Testing

- [ ] XSS: Try `<script>alert('xss')</script>` in contact form
- [ ] SQL Injection: Try `'; DROP TABLE users; --` in forms
- [ ] Rate limiting works on contact endpoint
- [ ] CORS headers are set correctly
- [ ] Passwords are not visible in network tab

---

## Final Verification

Before deploying, ensure:
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No console errors
- [ ] No broken links
- [ ] All forms work
- [ ] Email notifications work (if configured)
- [ ] Database migrations applied
- [ ] No sensitive data in logs

---

## Next Steps

Once all tests pass:
1. Commit changes to git
2. Run `node verify-deployment.js`
3. Deploy to Azure with `.\azure-deploy.ps1`
4. Run same tests on production URL

---

**Testing Date:** _____________
**Tested By:** _____________
**Status:** _____________
